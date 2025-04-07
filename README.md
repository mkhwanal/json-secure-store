# 🏦 json-secure-store

[![npm version](https://badge.fury.io/js/json-secure-store.svg)](https://www.npmjs.com/package/json-secure-store)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, TypeScript-first utility for storing JSON objects in `localStorage` or `sessionStorage`, with optional AES encryption, expiration, type-safe access, and change listeners. Framework-agnostic and blazing fast.

---

## ✨ Features

- ✅ Local/session storage support
- 🔐 Optional encryption (AES)
- 🧠 Typed access with interfaces or models
- ⏳ Expiration support (TTL)
- 🔄 onChange listeners
- ⚙️ Framework agnostic (works in React, Angular, Vue, plain JS, etc.)

---

## 📅 Installation

```bash
npm install json-secure-store
```

---

## 🛠️ Usage
### Basic Store / Get / Remove

```ts
import { JsonSecureStore } from 'json-secure-store';

const store = new JsonSecureStore();

store.setItem('user', { name: 'Alice', role: 'admin' });

const user = store.getItem<{ name: string; role: string }>('user');

console.log(user?.name); // "Alice"

store.removeItem('user');
```

### With Encryption 🔐

```ts
const store = new JsonSecureStore({ secret: 'my-super-secret-key' });

store.setItem('token', 'my-token');

const token = store.getItem<string>('token');
```

### With Expiration

```ts
store.setItem('session', { userId: 123 }, { ttl: 60000 }); // expires in 60 seconds
=
```

### Listen for Changes

```ts
store.onChange('theme', (newValue) => {
  console.log('Theme changed:', newValue);
});
```


---

## 🧹 API

### Constructor Options

```ts
type StorageOptions = {
  storageType?: 'localStorage' | 'sessionStorage';
  encrypt?: boolean;
  encryptionKey?: string;
  cache?: boolean;
  defaultTTL?: number;     // milliseconds
  namespace?: string;
};
```

---

### Methods

```ts
store.setItem<T>(key: string, value: T): void;
store.getItem<T>(key: string): T | null;
store.removeItem(key: string): void;
store.clear(): void;
store.onChange(callback: (key: string, value: any) => void): void;
store.raw(): Storage;
```

---

## 🔐 Encryption

- Uses AES encryption via `crypto-js`.
- Requires `encryptionKey` if `encrypt: true`.

---

## ⏱ Expiration (TTL)

- Use `defaultTTL` (in milliseconds) to auto-expire items.
- Expired items return `null` and are auto-removed on read.

---

## 🧠 Type Guards (Optional)

```ts
function isUser(val: any): val is User {
  return val && typeof val.name === 'string';
}

const user = store.getItem('user');
if (isUser(user)) {
  console.log(user.name);
}
```

---

## 🧺 Testing

```bash
npm run test
```

Uses [Vitest](https://vitest.dev/) for fast, browser-like testing.

---

## 🗾 License

MIT © 2025 mkhwanal