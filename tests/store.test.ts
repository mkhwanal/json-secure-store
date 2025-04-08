import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JsonStore, StorageType } from '../src/store';

let fakeEncrypted: ArrayBuffer;

beforeEach(() => {
  global.crypto = {
    getRandomValues: vi.fn().mockImplementation((array: Uint8Array) => {
      return new Uint8Array(array.length).fill(1);
    }),
    subtle: {
      importKey: vi.fn().mockResolvedValue({}),
      deriveKey: vi.fn().mockResolvedValue({}),
      encrypt: vi.fn().mockImplementation(async (_alg, _key, data) => {
        // Store input buffer so it can be returned by the decrypt call
        fakeEncrypted = data;
        return data; // pretend encryption doesn't change data
      }),
      decrypt: vi.fn().mockImplementation(async (_alg, _key, _data) => {
        return fakeEncrypted; // return the original input "unencrypted"
      }),
    },
  } as any;
});

interface User {
  id: string;
  name: string;
}

const testUser: User = { id: '1', name: 'Alice' };

describe('JsonStore', () => {
  let store: JsonStore;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    store = new JsonStore({
      storageType: StorageType.Local,
      cache: false,
    });
  });

  it('should store and retrieve an item', async () => {
    await store.setItem<User>('user', testUser);
    const result = await store.getItem<User>('user');
    expect(result).toEqual(testUser);
  });

  it('should remove an item', async () => {
    await store.setItem<User>('user', testUser);
    await store.removeItem('user');
    const result = await store.getItem<User>('user');
    expect(result).toBeNull();
  });

  it('should clear all items', async () => {
    await store.setItem<User>('a', testUser);
    await store.setItem<User>('b', testUser);
    await store.clear();
    expect(await store.getItem<User>('a')).toBeNull();
    expect(await store.getItem<User>('b')).toBeNull();
  });

  it('should encrypt and decrypt data correctly', async () => {
    const secureStore = new JsonStore({
      storageType: StorageType.Local,
      encrypt: true,
      encryptionKey: 'test-secret', // Ensure this matches the key used in encryption
    });

    await secureStore.setItem<User>('user', testUser);
    const result = await secureStore.getItem<User>('user');
    expect(result).toEqual(testUser); // Verify that the decrypted data matches the original
  });

  it('should return null for expired items', async () => {
    const expiringStore = new JsonStore({
      storageType: StorageType.Local,
      defaultTTL: 10,
    });

    await expiringStore.setItem<User>('user', testUser);

    // Simulate expiration
    const record = JSON.parse(localStorage.getItem('user')!);
    record.expiresAt = Date.now() - 1000;
    localStorage.setItem('user', JSON.stringify(record));

    const result = await expiringStore.getItem<User>('user');
    expect(result).toBeNull();
  });
});
