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
        this.encrypt = this.options.encrypt;
        this.encryptionKey = this.options.encryptionKey;
        this.cache = this.options.cache;
        this.namespace = this.options.namespace;

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

    async setItem<T>(key: string, value: T, ttl?: number): Promise<void> {
        const fullKey = this.buildKey(key);
        const expiresAt = ttl
            ? Date.now() + ttl
            : this.options.defaultTTL
            ? Date.now() + this.options.defaultTTL
            : undefined;
    
        const wrapper: StoredValue<T> = { data: value, expiresAt };
        let data = JSON.stringify(wrapper);
    
        if (this.encrypt && this.encryptionKey) {
            data = await encryptData(data, this.encryptionKey);
        }
    
        this.storage.setItem(fullKey, data);
    
        if (this.cache) {
            this.memoryCache.set(fullKey, value);
        }
    
        this.notifyChange(key, value);
    }

    async getItem<T>(key: string): Promise<T | null> {
        const fullKey = this.buildKey(key);
    
        if (this.cache && this.memoryCache.has(fullKey)) {
            return this.memoryCache.get(fullKey);
        }
    
        const raw = this.storage.getItem(fullKey);
        if (!raw) return null;
    
        try {
            const data = this.encrypt && this.encryptionKey
                ? await decryptData(raw, this.encryptionKey)
                : raw;
    
            const parsed: StoredValue<T> = JSON.parse(data);
    
            if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
                this.removeItem(key);
                return null;
            }
    
            if (this.cache) {
                this.memoryCache.set(fullKey, parsed.data);
            }
    
            return parsed.data;
        } catch (err) {
            console.error(`Failed to retrieve or parse item for key "${key}":`, err);
            throw new Error(`Failed to retrieve item for key "${key}".`);
        }
    }

    removeItem(key: string): void {
        const fullKey = this.buildKey(key);
        this.storage.removeItem(fullKey);
        if (this.cache) {
            this.memoryCache.delete(fullKey);
        }
        this.notifyChange(key, null);
    }

    clear(): void {
        const keysToRemove = Object.keys(this.storage).filter((key) =>
            this.namespace ? key.startsWith(`${this.namespace}:`) : true
        );
    
        keysToRemove.forEach((key) => this.storage.removeItem(key));
        if (this.cache) {
            this.memoryCache.clear();
        }
    
        keysToRemove.forEach((key) => {
            const shortKey = this.namespace ? key.replace(`${this.namespace}:`, '') : key;
            this.notifyChange(shortKey, null);
        });
    }

    raw(): Storage {
        return this.storage;
    }
}

export { StorageType };
