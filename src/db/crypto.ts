import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils';
import * as Crypto from 'expo-crypto';
import { getKey } from './key';

/**
 * Field-level encryption for entry bodies.
 *
 * XChaCha20-Poly1305 with a fresh 24-byte nonce per write, so we never have to
 * reason about nonce reuse. The entry id is bound in as associated data, which
 * means ciphertext can't be moved from one row to another.
 *
 * What is NOT encrypted, deliberately: day, valence, energy, word count. The
 * timeline has to paint a year without decrypting 365 rows. Someone with the
 * device file learns that you had a heavy Tuesday, not what you wrote.
 */

export type Sealed = { cipher: Uint8Array; nonce: Uint8Array };

export async function seal(plaintext: string, entryId: string): Promise<Sealed> {
  const key = await getKey();
  const nonce = Crypto.getRandomBytes(24);
  const aead = xchacha20poly1305(key, nonce, utf8ToBytes(entryId));
  return { cipher: aead.encrypt(utf8ToBytes(plaintext)), nonce };
}

export async function open(sealed: Sealed, entryId: string): Promise<string> {
  const key = await getKey();
  const aead = xchacha20poly1305(key, sealed.nonce, utf8ToBytes(entryId));
  return bytesToUtf8(aead.decrypt(sealed.cipher));
}
