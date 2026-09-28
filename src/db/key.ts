import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const KEY_ID = 'longhand.dek.v1';

let cached: Uint8Array | null = null;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

/**
 * The data encryption key. Generated once on this device, held in the
 * Keychain/Keystore, never transmitted anywhere. Losing the device means
 * losing the entries — that is the deal we make on the privacy screen.
 */
export async function getKey(): Promise<Uint8Array> {
  if (cached) return cached;

  const existing = await SecureStore.getItemAsync(KEY_ID);
  if (existing) {
    cached = fromHex(existing);
    return cached;
  }

  const fresh = Crypto.getRandomBytes(32);
  await SecureStore.setItemAsync(KEY_ID, toHex(fresh), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  cached = fresh;
  return cached;
}
