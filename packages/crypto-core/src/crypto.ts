import {
  uint8ArrayToBase64,
  base64ToUint8Array,
  stringToUtf8,
  utf8ToString,
  uint8ArrayToHex
} from './utils.js';

// SubtleCrypto resolver compatible with Web, Node, and React Native
function getSubtle(): SubtleCrypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  try {
    const nodeCrypto = require('node:crypto');
    if (nodeCrypto.webcrypto?.subtle) {
      return nodeCrypto.webcrypto.subtle;
    }
  } catch {}
  throw new Error('SubtleCrypto is not available in the current environment.');
}

function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(array as any);
    return array;
  }
  try {
    const nodeCrypto = require('node:crypto');
    nodeCrypto.randomFillSync(array);
    return array;
  } catch {}
  throw new Error('Crypto getRandomValues is not available.');
}

export interface EncryptedPayload {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  ciphertextBase64: string;
  nonceBase64: string;
}

export const AndreaCrypto = {
  /**
   * Generates cryptographically secure random bytes
   */
  generateRandomBytes(length: number): Uint8Array {
    const array = new Uint8Array(length);
    return getRandomValues(array);
  },

  /**
   * Generates a 6-digit numeric pairing code
   */
  generatePairingCode(): string {
    const randomBytes = getRandomValues(new Uint8Array(4));
    const num = ((randomBytes[0] << 24) | (randomBytes[1] << 16) | (randomBytes[2] << 8) | randomBytes[3]) >>> 0;
    return (num % 1000000).toString().padStart(6, '0');
  },

  /**
   * Computes a deterministic, order-independent couple_id from two user UUIDs
   */
  async computeCoupleId(user1Id: string, user2Id: string): Promise<string> {
    const sorted = [user1Id, user2Id].sort().join(':');
    const subtle = getSubtle();
    const digest = await subtle.digest('SHA-256', stringToUtf8(`andrea:couple:${sorted}`) as BufferSource);
    return uint8ArrayToHex(new Uint8Array(digest)).substring(0, 32);
  },

  /**
   * Derives a master encryption key (AES-GCM 256) from user's passphrase + salt using PBKDF2
   */
  async deriveMasterKey(
    passphrase: string,
    salt: Uint8Array,
    iterations: number = 600000
  ): Promise<CryptoKey> {
    const subtle = getSubtle();
    const keyMaterial = await subtle.importKey(
      'raw',
      stringToUtf8(passphrase) as BufferSource,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
    );
  },

  /**
   * Generates ECDH key pair for key exchange (P-256 curve by default, universally supported)
   */
  async generateKeyPair(namedCurve: 'P-256' | 'P-384' | 'P-521' = 'P-256'): Promise<CryptoKeyPair> {
    const subtle = getSubtle();
    return subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve
      },
      true,
      ['deriveKey', 'deriveBits']
    );
  },

  /**
   * Derives shared AES-GCM 256 secret using ECDH between private key and remote public key
   */
  async deriveSharedSecret(
    privateKey: CryptoKey,
    remotePublicKey: CryptoKey
  ): Promise<CryptoKey> {
    const subtle = getSubtle();
    return subtle.deriveKey(
      {
        name: 'ECDH',
        public: remotePublicKey
      },
      privateKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  },

  /**
   * Derives purpose-specific keys using HKDF (e.g. 'diary_private', 'diary_shared', 'feelings', 'aya_context')
   */
  async derivePurposeKey(
    baseKey: CryptoKey,
    purpose: string,
    salt: Uint8Array = new Uint8Array(32)
  ): Promise<CryptoKey> {
    const subtle = getSubtle();
    const rawKey = await subtle.exportKey('raw', baseKey);
    const hkdfKeyMaterial = await subtle.importKey(
      'raw',
      rawKey,
      'HKDF',
      false,
      ['deriveKey']
    );

    const info = stringToUtf8(`andrea:purpose:${purpose}:v1`);

    return subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt as BufferSource,
        info: info as BufferSource
      },
      hkdfKeyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  },

  /**
   * Encrypts raw bytes using AES-GCM (256-bit) with a unique 12-byte IV/nonce
   */
  async encrypt(
    key: CryptoKey,
    plaintext: Uint8Array
  ): Promise<EncryptedPayload> {
    const subtle = getSubtle();
    const nonce = AndreaCrypto.generateRandomBytes(12);
    const ciphertextBuf = await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: nonce as BufferSource
      },
      key,
      plaintext as BufferSource
    );

    const ciphertext = new Uint8Array(ciphertextBuf);
    return {
      ciphertext,
      nonce,
      ciphertextBase64: uint8ArrayToBase64(ciphertext),
      nonceBase64: uint8ArrayToBase64(nonce)
    };
  },

  /**
   * Decrypts AES-GCM ciphertext
   */
  async decrypt(
    key: CryptoKey,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    const subtle = getSubtle();
    const decryptedBuf = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce as BufferSource
      },
      key,
      ciphertext as BufferSource
    );
    return new Uint8Array(decryptedBuf);
  },

  /**
   * Encrypts any JSON-serializable object
   */
  async encryptJson<T>(key: CryptoKey, data: T): Promise<{ ciphertextBase64: string; nonceBase64: string }> {
    const jsonStr = JSON.stringify(data);
    const plaintext = stringToUtf8(jsonStr);
    const result = await AndreaCrypto.encrypt(key, plaintext);
    return {
      ciphertextBase64: result.ciphertextBase64,
      nonceBase64: result.nonceBase64
    };
  },

  /**
   * Decrypts JSON payload
   */
  async decryptJson<T>(key: CryptoKey, ciphertextBase64: string, nonceBase64: string): Promise<T> {
    const ciphertext = base64ToUint8Array(ciphertextBase64);
    const nonce = base64ToUint8Array(nonceBase64);
    const decryptedBytes = await AndreaCrypto.decrypt(key, ciphertext, nonce);
    const jsonStr = utf8ToString(decryptedBytes);
    return JSON.parse(jsonStr) as T;
  },

  /**
   * Exports ECDH Public Key as Base64 SPKI
   */
  async exportPublicKey(key: CryptoKey): Promise<string> {
    const subtle = getSubtle();
    const spki = await subtle.exportKey('spki', key);
    return uint8ArrayToBase64(new Uint8Array(spki));
  },

  /**
   * Imports ECDH Public Key from Base64 SPKI
   */
  async importPublicKey(spkiBase64: string, namedCurve: 'P-256' | 'P-384' | 'P-521' = 'P-256'): Promise<CryptoKey> {
    const subtle = getSubtle();
    const spkiBytes = base64ToUint8Array(spkiBase64);
    return subtle.importKey(
      'spki',
      spkiBytes as BufferSource,
      {
        name: 'ECDH',
        namedCurve
      },
      true,
      []
    );
  },

  /**
   * Wraps (encrypts) private key with master key for safe local/remote storage
   */
  async wrapPrivateKey(privateKey: CryptoKey, masterKey: CryptoKey): Promise<{ wrappedKeyBase64: string; nonceBase64: string }> {
    const subtle = getSubtle();
    const nonce = AndreaCrypto.generateRandomBytes(12);
    const wrapped = await subtle.wrapKey(
      'pkcs8',
      privateKey,
      masterKey,
      {
        name: 'AES-GCM',
        iv: nonce as BufferSource
      }
    );
    return {
      wrappedKeyBase64: uint8ArrayToBase64(new Uint8Array(wrapped)),
      nonceBase64: uint8ArrayToBase64(nonce)
    };
  },

  /**
   * Unwraps (decrypts) private key using master key
   */
  async unwrapPrivateKey(
    wrappedKeyBase64: string,
    nonceBase64: string,
    masterKey: CryptoKey,
    namedCurve: 'P-256' | 'P-384' | 'P-521' = 'P-256'
  ): Promise<CryptoKey> {
    const subtle = getSubtle();
    const wrappedBytes = base64ToUint8Array(wrappedKeyBase64);
    const nonce = base64ToUint8Array(nonceBase64);

    return subtle.unwrapKey(
      'pkcs8',
      wrappedBytes as BufferSource,
      masterKey,
      {
        name: 'AES-GCM',
        iv: nonce as BufferSource
      },
      {
        name: 'ECDH',
        namedCurve
      },
      true,
      ['deriveKey', 'deriveBits']
    );
  }
};
