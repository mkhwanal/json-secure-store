const ENCRYPTION_SALT = crypto.getRandomValues(new Uint8Array(16));
const ITERATIONS = 100000;
const IV_LENGTH = 12; // Recommended length for AES-GCM IV

async function getKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string, secret: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a new salt
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH)); // Generate a new IV
  const key = await getKey(secret, salt);
  const encoded = new TextEncoder().encode(data);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  // Combine salt, IV, and encrypted data into a single Uint8Array
  const fullData = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  fullData.set(salt);
  fullData.set(iv, salt.length);
  fullData.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Return the combined data as a base64 string
  return btoa(String.fromCharCode(...fullData));
}

export async function decryptData(encryptedData: string, secret: string): Promise<string> {
  const data = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
  const salt = data.slice(0, 16); // Extract the salt
  const iv = data.slice(16, 16 + IV_LENGTH); // Extract the IV
  const encrypted = data.slice(16 + IV_LENGTH); // Extract the encrypted data
  const key = await getKey(secret, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}