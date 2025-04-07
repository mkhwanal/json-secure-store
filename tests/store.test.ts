import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JsonStore, StorageType } from '../src/store';

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

  it('should store and retrieve an item', () => {
    store.setItem<User>('user', testUser);
    const result = store.getItem<User>('user');
    expect(result).toEqual(testUser);
  });

  it('should remove an item', () => {
    store.setItem<User>('user', testUser);
    store.removeItem('user');
    const result = store.getItem<User>('user');
    expect(result).toBeNull();
  });

  it('should clear all items', () => {
    store.setItem<User>('a', testUser);
    store.setItem<User>('b', testUser);
    store.clear();
    expect(store.getItem<User>('a')).toBeNull();
    expect(store.getItem<User>('b')).toBeNull();
  });

  it('should encrypt and decrypt data correctly', () => {
    const secureStore = new JsonStore({
      storageType: StorageType.Local,
      encrypt: true,
      encryptionKey: 'test-secret',
    });

    secureStore.setItem<User>('user', testUser);
    const result = secureStore.getItem<User>('user');
    expect(result).toEqual(testUser);
  });

  it('should return null for expired items', () => {
    const expiringStore = new JsonStore({
      storageType: StorageType.Local,
      defaultTTL: 10,
    });

    expiringStore.setItem<User>('user', testUser);

    // Simulate expiration
    const record = JSON.parse(localStorage.getItem('user')!);
    record.expiresAt = Date.now() - 1000;
    localStorage.setItem('user', JSON.stringify(record));

    const result = expiringStore.getItem<User>('user');
    expect(result).toBeNull();
  });
});
