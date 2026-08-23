import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AndreaCrypto } from '../src/crypto.js';
import { stringToUtf8, utf8ToString } from '../src/utils.js';


describe('Andrea Crypto Core Tests', () => {
  it('should generate valid 6-digit pairing codes', () => {
    const code1 = AndreaCrypto.generatePairingCode();
    const code2 = AndreaCrypto.generatePairingCode();
    assert.match(code1, /^\d{6}$/);
    assert.match(code2, /^\d{6}$/);
    assert.notStrictEqual(code1, code2);
  });

  it('should compute deterministic couple_id irrespective of order', async () => {
    const uidA = '11111111-aaaa-bbbb-cccc-111111111111';
    const uidB = '22222222-dddd-eeee-ffff-222222222222';
    const coupleId1 = await AndreaCrypto.computeCoupleId(uidA, uidB);
    const coupleId2 = await AndreaCrypto.computeCoupleId(uidB, uidA);
    assert.strictEqual(coupleId1, coupleId2);
    assert.strictEqual(coupleId1.length, 32);
  });

  it('should derive master key via PBKDF2 and encrypt/decrypt data', async () => {
    const salt = AndreaCrypto.generateRandomBytes(16);
    const masterKey = await AndreaCrypto.deriveMasterKey('my-super-secret-passphrase', salt, 1000); // 1000 for fast test

    const secretText = 'Querido diario: Hoy fue un día extraordinario con Andrea.';
    const payload = await AndreaCrypto.encrypt(masterKey, stringToUtf8(secretText));

    assert.ok(payload.ciphertextBase64);
    assert.ok(payload.nonceBase64);

    const decryptedBytes = await AndreaCrypto.decrypt(masterKey, payload.ciphertext, payload.nonce);
    assert.strictEqual(utf8ToString(decryptedBytes), secretText);
  });

  it('should perform ECDH key exchange between User 1 and User 2 and produce identical shared secrets', async () => {
    // User 1 key pair
    const aliceKeys = await AndreaCrypto.generateKeyPair();
    const alicePubBase64 = await AndreaCrypto.exportPublicKey(aliceKeys.publicKey);

    // User 2 key pair
    const bobKeys = await AndreaCrypto.generateKeyPair();
    const bobPubBase64 = await AndreaCrypto.exportPublicKey(bobKeys.publicKey);

    // Import public keys
    const importedBobPub = await AndreaCrypto.importPublicKey(bobPubBase64);
    const importedAlicePub = await AndreaCrypto.importPublicKey(alicePubBase64);

    // Alice derives shared secret using Bob's public key
    const aliceShared = await AndreaCrypto.deriveSharedSecret(aliceKeys.privateKey, importedBobPub);

    // Bob derives shared secret using Alice's public key
    const bobShared = await AndreaCrypto.deriveSharedSecret(bobKeys.privateKey, importedAlicePub);

    // Derive HKDF purpose keys
    const aliceDiaryKey = await AndreaCrypto.derivePurposeKey(aliceShared, 'diary_shared');
    const bobDiaryKey = await AndreaCrypto.derivePurposeKey(bobShared, 'diary_shared');

    // Alice encrypts a shared entry
    const entryData = {
      title: 'Nuestro viaje a Roma',
      body: 'Caminamos por el Trastevere y comimos el mejor gelato.',
      rating: 5
    };

    const encrypted = await AndreaCrypto.encryptJson(aliceDiaryKey, entryData);

    // Bob decrypts the shared entry
    const decrypted = await AndreaCrypto.decryptJson<typeof entryData>(
      bobDiaryKey,
      encrypted.ciphertextBase64,
      encrypted.nonceBase64
    );

    assert.deepStrictEqual(decrypted, entryData);
  });

  it('should wrap and unwrap private key with master key for persistent storage', async () => {
    const salt = AndreaCrypto.generateRandomBytes(16);
    const masterKey = await AndreaCrypto.deriveMasterKey('passphrase-1234', salt, 1000);
    const keyPair = await AndreaCrypto.generateKeyPair();

    const { wrappedKeyBase64, nonceBase64 } = await AndreaCrypto.wrapPrivateKey(keyPair.privateKey, masterKey);
    assert.ok(wrappedKeyBase64);

    const unwrappedPrivateKey = await AndreaCrypto.unwrapPrivateKey(wrappedKeyBase64, nonceBase64, masterKey);
    assert.ok(unwrappedPrivateKey);

    // Test that unwrapped key works in ECDH
    const peerKeyPair = await AndreaCrypto.generateKeyPair();
    const sharedSecret = await AndreaCrypto.deriveSharedSecret(unwrappedPrivateKey, peerKeyPair.publicKey);
    assert.ok(sharedSecret);
  });

  it('should fail decryption when ciphertext is tampered with (AEAD guarantee)', async () => {
    const salt = AndreaCrypto.generateRandomBytes(16);
    const key = await AndreaCrypto.deriveMasterKey('test', salt, 1000);
    const { ciphertext, nonce } = await AndreaCrypto.encrypt(key, stringToUtf8('sensible'));

    // Tamper single byte
    ciphertext[0] ^= 0xff;

    await assert.rejects(async () => {
      await AndreaCrypto.decrypt(key, ciphertext, nonce);
    });
  });
});
