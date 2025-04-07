import { StorageType, StorageOptions, StorageAdapter, StoredValue, ChangeCallback } from './types';
import { encryptData, decryptData } from './utils/crypto';

export class JsonStore implements StorageAdapter {
    private storage: Storage;
    private encrypt: boolean;
    private encryptionKey?: string;
    private cache: boolean;
    private namespace?: string;
    private listeners: ChangeCallback[] = [];
    private options: Required<StorageOptions>;
    private memoryCache: Map<string, any> = new Map();

    constructor(options?: StorageOptions) {
        const {
            storageType = StorageType.Local,
            encrypt = false,
            encryptionKey,
            cache = false,
            namespace,
        } = options || {};

        const defaults: Required<StorageOptions> = {
            storageType: StorageType.Local,
            encrypt: false,
            encryptionKey: '',
            cache: false,
            namespace: '',
            defaultTTL: 0,
        };

        this.options = Object.assign({}, defaults, options);
        this.storage = window[this.options.storageType];

        if (this.options.encrypt && !this.options.encryptionKey) {
            throw new Error('Encryption key is required when encryption is enabled.');
        }

        this.storage = window[storageType];
        this.encrypt = encrypt;
        this.encryptionKey = encryptionKey;
        this.cache = cache;
        this.namespace = namespace;

        if (this.encrypt && !this.encryptionKey) {
            throw new Error('Encryption key is required when encryption is enabled.');
        }
    }

    private buildKey(key: string): string {
        return this.namespace ? `${this.namespace}:${key}` : key;
    }

    private notifyChange(key: string, value: any): void {
        this.listeners.forEach((cb) => cb(key, value));
    }

    onChange(callback: ChangeCallback): void {
        this.listeners.push(callback);
    }

    setItem<T>(key: string, value: T): void {
        const fullKey = this.buildKey(key);
        const expiresAt = this.options.defaultTTL
            ? Date.now() + this.options.defaultTTL
            : undefined;

        const wrapper: StoredValue<T> = { data: value, expiresAt };
        let data = JSON.stringify(wrapper);

        if (this.encrypt && this.encryptionKey) {
            data = encryptData(data, this.encryptionKey);
        }

        this.storage.setItem(fullKey, data);

        if (this.cache) {
            this.memoryCache.set(fullKey, value);
        }
    }

    getItem<T>(key: string): T | null {
        const fullKey = this.buildKey(key);

        if (this.cache && this.memoryCache.has(fullKey)) {
            return this.memoryCache.get(fullKey);
        }

        const raw = this.storage.getItem(fullKey);
        if (!raw) return null;

        try {
            const data = this.encrypt && this.encryptionKey
                ? decryptData(raw, this.encryptionKey)
                : raw;

            const parsed: StoredValue<T> = JSON.parse(data);

            if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
                this.removeItem(key);
                return null;
            }
            if (this.cache) {
                this.memoryCache.set(fullKey, parsed);
            }

            return parsed.data;
        } catch (err) {
            console.error('Failed to decrypt or parse item:', err);
            return null;
        }
    }

    removeItem(key: string): void {
        const fullKey = this.buildKey(key);
        this.storage.removeItem(fullKey);
        if (this.cache) {
            this.memoryCache.delete(fullKey);
        }
    }

    clear(): void {
        const keysToRemove = Object.keys(this.storage).filter((key) =>
            this.namespace ? key.startsWith(this.namespace + ':') : true
        );

        keysToRemove.forEach((key) => this.storage.removeItem(key));
        if (this.cache) {
            this.memoryCache.clear();
        }
    }

    raw(): Storage {
        return this.storage;
    }
}
