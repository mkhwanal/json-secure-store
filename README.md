# json-secure-store

A lightweight, TypeScript-first utility for storing JSON objects in `localStorage` or `sessionStorage`, with optional AES encryption, expiration, type-safe access, and change listeners. Framework-agnostic and blazing fast.

## ✨ Features

- Local/session storage support
- Optional encryption (AES)
- Typed access with interfaces or models
- Expiration support (TTL)
- Change listeners
- Framework agnostic (works in Angular, React, Vue, plain JS, etc.)

## Installation

```bash
npm install json-secure-store
```

## Usage

### Basic Store / Get / Remove

```typescript
import { JsonStore } from 'json-secure-store';

const store = new JsonStore();

// Store an object
store.setItem('user', { name: 'Alice', role: 'admin' });

// Retrieve the object with type safety
const user = store.getItem<{ name: string; role: string }>('user');
console.log(user?.name); // "Alice"

// Remove the item
store.removeItem('user');
```

### With Encryption

```typescript
import { JsonStore } from 'json-secure-store';

const store = new JsonStore({ encrypt: true, encryptionKey: 'my-super-secret-key' });

// Store a sensitive item
store.setItem('token', 'my-token');

// Retrieve the encrypted item
const token = store.getItem<string>('token');
```

### With Expiration

```typescript
import { JsonStore } from 'json-secure-store';

const store = new JsonStore();

// Store an item that expires in 60 seconds
store.setItem('session', { userId: 123 }, { ttl: 60000 });
```

### Switching Between localStorage and sessionStorage:
```typescript
import { JsonStore } from 'json-secure-store';

const localStore = new JsonStore({ storageType: 'localStorage' });
const sessionStore = new JsonStore({ storageType: 'sessionStorage' });

// Store an item in localStorage
localStore.setItem('user', { name: 'Alice' });

// Store an item in sessionStorage
sessionStore.setItem('session', { sessionId: '12345' });
```

Using Cache:
```typescript
import { JsonStore } from 'json-secure-store';

const store = new JsonStore({ cache: true });

// Store an item with caching enabled
store.setItem('user', { name: 'Alice' });

// Retrieve from cache if available
const cachedUser = store.getItem('user');
console.log(cachedUser);
```

### Listen for Changes

```typescript
import { JsonStore } from 'json-secure-store';

const store = new JsonStore();

store.onChange((key, newValue) => {
  console.log(`Changed key: ${key}, new value:`, newValue);
});
```

## Angular Integration Example

### 1. Install the package:

```bash
npm install json-secure-store
```

### 2. Create a service to encapsulate storage operations:

```typescript
import { Injectable } from '@angular/core';
import { JsonStore } from 'json-secure-store';

@Injectable({
  providedIn: 'root',
})
export class SecureStorageService {
  private store: JsonStore;

  constructor() {
    this.store = new JsonStore({ encrypt: true, encryptionKey: 'your-encryption-key' });
  }

  setItem<T>(key: string, value: T, ttl?: number): void {
    this.store.setItem(key, value, ttl ? { ttl } : undefined);
  }

  getItem<T>(key: string): T | null {
    return this.store.getItem<T>(key);
  }

  removeItem(key: string): void {
    this.store.removeItem(key);
  }
}
```

### 3. Use the service in your components:

```typescript
import { Component, OnInit } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';

@Component({
  selector: 'app-example',
  template: `<p>{{ userData?.name }}</p>`,
})
export class ExampleComponent implements OnInit {
  userData: { name: string; role: string } | null = null;

  constructor(private secureStorageService: SecureStorageService) {}

  ngOnInit(): void {
    // Store data
    this.secureStorageService.setItem('user', { name: 'Alice', role: 'admin' });

    // Retrieve data
    this.userData = this.secureStorageService.getItem<{ name: string; role: string }>('user');
  }
}
```

## API

### Constructor Options

```typescript
export interface StorageOptions {
  storageType?: 'localStorage' | 'sessionStorage';
  encrypt?: boolean;
  encryptionKey?: string;
  cache?: boolean;
  namespace?: string;
  defaultTTL?: number;
}
```

### Methods

```typescript
store.setItem<T>(key: string, value: T, options?: { ttl?: number }): void;
store.getItem<T>(key: string): T | null;
store.removeItem(key: string): void;
store.clear(): void;
store.onChange(callback: (key: string, value: any) => void): void;
store.raw(): Storage;
```

## Encryption

- Utilizes AES encryption via `crypto-js`.
- Requires `encrypt: true` and `encryptionKey` for encryption.

## Expiration (TTL)

- Use `defaultTTL` (in milliseconds) to auto-expire items.
- Items with expired TTL are removed on retrieval.

## Type Guards (Optional)

```typescript
function isUser(val: any): val is User {
  return val && typeof val.name === 'string';
}

const user = store.getItem('user');
if (isUser(user)) {
  console.log(user.name);
}
```

## Testing

```bash
npm run test
```

Utilizes [Vitest](https://vitest.dev) for fast, browser-like testing.

## License

MIT © 2025 mkhwanal

