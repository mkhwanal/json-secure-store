export enum StorageType {
    Local = 'localStorage',
    Session = 'sessionStorage'
}

export interface StorageOptions {
    storageType?: StorageType;
    encrypt?: boolean;
    encryptionKey?: string;
    cache?: boolean;
    namespace?: string;
    defaultTTL?: number; // in ms
}

export interface StorageAdapter {
    setItem<T>(key: string, value: T): void;
    getItem<T>(key: string): T | null;
    removeItem(key: string): void;
    clear(): void;
    raw(): Storage;
}

export interface StoredValue<T> {
    data: T;
    expiresAt?: number;
}

export type ChangeCallback = (key: string, value: any) => void;