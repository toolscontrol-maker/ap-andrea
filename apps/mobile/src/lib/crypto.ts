import { AndreaCrypto } from '@andrea/crypto-core';
import { base64ToUint8Array, uint8ArrayToBase64 } from '@andrea/crypto-core';
import { SecureStorage } from './storage';

const MASTER_SALT_KEY = 'andrea_master_salt';
const WRAPPED_PRIV_KEY = 'andrea_wrapped_priv_key';
const WRAPPED_PRIV_NONCE = 'andrea_wrapped_priv_nonce';
const PUBKEY_STORAGE_KEY = 'andrea_pubkey_spki';
const COUPLE_KEY_STORAGE = 'andrea_couple_key_raw';

// In-memory key cache (wiped on app terminate / lock)
let inMemoryMasterKey: CryptoKey | null = null;
let inMemoryPrivateKey: CryptoKey | null = null;
let inMemorySharedSecret: CryptoKey | null = null;
const inMemoryPurposeKeys = new Map<string, CryptoKey>();

export const MobileCryptoService = {
  /**
   * Initializes user cryptographic identity upon signup
   */
  async initializeUserVault(passphrase: string): Promise<{
    saltBase64: string;
    pubKeyBase64: string;
    wrappedPrivateKeyBase64: string;
    nonceBase64: string;
  }> {
    const salt = AndreaCrypto.generateRandomBytes(32);
    const saltBase64 = uint8ArrayToBase64(salt);

    const masterKey = await AndreaCrypto.deriveMasterKey(passphrase, salt);
    const keyPair = await AndreaCrypto.generateKeyPair();

    const pubKeyBase64 = await AndreaCrypto.exportPublicKey(keyPair.publicKey);
    const { wrappedKeyBase64, nonceBase64 } = await AndreaCrypto.wrapPrivateKey(keyPair.privateKey, masterKey);

    // Save salt and wrapped private key locally
    await SecureStorage.setItem(MASTER_SALT_KEY, saltBase64);
    await SecureStorage.setItem(WRAPPED_PRIV_KEY, wrappedKeyBase64);
    await SecureStorage.setItem(WRAPPED_PRIV_NONCE, nonceBase64);
    await SecureStorage.setItem(PUBKEY_STORAGE_KEY, pubKeyBase64);

    // Cache keys in memory
    inMemoryMasterKey = masterKey;
    inMemoryPrivateKey = keyPair.privateKey;

    return {
      saltBase64,
      pubKeyBase64,
      wrappedPrivateKeyBase64: wrappedKeyBase64,
      nonceBase64
    };
  },

  /**
   * Unlocks user vault using passphrase
   */
  async unlockVault(passphrase: string): Promise<boolean> {
    const saltBase64 = await SecureStorage.getItem(MASTER_SALT_KEY);
    const wrappedPrivKey = await SecureStorage.getItem(WRAPPED_PRIV_KEY);
    const nonceBase64 = await SecureStorage.getItem(WRAPPED_PRIV_NONCE);

    if (!saltBase64 || !wrappedPrivKey || !nonceBase64) {
      return false;
    }

    try {
      const salt = base64ToUint8Array(saltBase64);
      const masterKey = await AndreaCrypto.deriveMasterKey(passphrase, salt);
      const privateKey = await AndreaCrypto.unwrapPrivateKey(wrappedPrivKey, nonceBase64, masterKey);

      inMemoryMasterKey = masterKey;
      inMemoryPrivateKey = privateKey;
      return true;
    } catch (err) {
      console.error('Failed to unlock vault:', err);
      return false;
    }
  },

  /**
   * Derives and stores shared couple key using partner's public key
   */
  async establishCoupleSecret(partnerPubKeyBase64: string): Promise<CryptoKey> {
    if (!inMemoryPrivateKey) {
      throw new Error('Vault is locked. Unlock vault first.');
    }

    const partnerPubKey = await AndreaCrypto.importPublicKey(partnerPubKeyBase64);
    const sharedSecret = await AndreaCrypto.deriveSharedSecret(inMemoryPrivateKey, partnerPubKey);

    inMemorySharedSecret = sharedSecret;
    return sharedSecret;
  },

  /**
   * Gets purpose-derived key (e.g. 'diary_private', 'diary_shared', 'feelings')
   */
  async getPurposeKey(purpose: 'diary_private' | 'diary_shared' | 'feelings' | 'surprises' | 'aya_context'): Promise<CryptoKey> {
    if (inMemoryPurposeKeys.has(purpose)) {
      return inMemoryPurposeKeys.get(purpose)!;
    }

    if (purpose === 'diary_private') {
      if (!inMemoryMasterKey) throw new Error('Vault is locked.');
      const key = await AndreaCrypto.derivePurposeKey(inMemoryMasterKey, purpose);
      inMemoryPurposeKeys.set(purpose, key);
      return key;
    }

    // Shared purposes require couple shared secret
    if (!inMemorySharedSecret) {
      throw new Error('Couple shared secret not established. Ensure pairing is complete.');
    }

    const key = await AndreaCrypto.derivePurposeKey(inMemorySharedSecret, purpose);
    inMemoryPurposeKeys.set(purpose, key);
    return key;
  },

  /**
   * Encrypts an entry payload
   */
  async encryptEntryPayload<T>(
    payload: T,
    visibility: 'private' | 'shared',
    purpose: 'diary_private' | 'diary_shared' | 'feelings' | 'surprises'
  ): Promise<{ ciphertextBase64: string; nonceBase64: string }> {
    const key = await this.getPurposeKey(visibility === 'private' ? 'diary_private' : purpose);
    return AndreaCrypto.encryptJson(key, payload);
  },

  /**
   * Decrypts an entry payload
   */
  async decryptEntryPayload<T>(
    ciphertextBase64: string,
    nonceBase64: string,
    visibility: 'private' | 'shared',
    purpose: 'diary_private' | 'diary_shared' | 'feelings' | 'surprises'
  ): Promise<T> {
    const key = await this.getPurposeKey(visibility === 'private' ? 'diary_private' : purpose);
    return AndreaCrypto.decryptJson<T>(key, ciphertextBase64, nonceBase64);
  },

  /**
   * Clears in-memory keys (lock)
   */
  lockVault(): void {
    inMemoryMasterKey = null;
    inMemoryPrivateKey = null;
    inMemorySharedSecret = null;
    inMemoryPurposeKeys.clear();
  },

  isVaultUnlocked(): boolean {
    return inMemoryMasterKey !== null && inMemoryPrivateKey !== null;
  }
};
