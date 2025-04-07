# 🏦 json-secure-store

A lightweight, TypeScript-first utility for storing JSON objects in `localStorage` or `sessionStorage`, with optional AES encryption, expiration, type-safe access, and change listeners. Framework-agnostic and blazing fast.

---

## ✨ Features

- ✅ LocalStorage or SessionStorage  
- 🔐 Optional AES encryption (using `crypto-js`)  
- ⏳ Expiration support (TTL in milliseconds)  
- 🧠 Type-safe via models/interfaces  
- 📡 `onChange` listeners for reactive behavior  
- ⚡ In-memory cache option for faster reads  
- 🛆 Tiny bundle size, zero dependencies (except `crypto-js`)  

---

## 📅 Installation

```bash
npm install json-secure-store
```

---

## 🚀 Quick Start

```ts
import { JsonStore, StorageType } from 'json-secure-store';

interface User {
  id: string;
  name: string;
  age: number;
}

const store = new JsonStore({
  storageType: StorageType.Local,
  encrypt: true,
  encryptionKey: 'my-secret',
  cache: true,
  defaultTTL: 60_000, // 1 minute
  namespace: 'app',
});

store.setItem<User>('user', { id: '1', name: 'Alice', age: 30 });

const user = store.getItem<User>('user');
console.log(user?.name);
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

## 📡 Change Listeners

```ts
store.onChange((key, value) => {
  console.log(`Key changed: ${key}`, value);
});
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