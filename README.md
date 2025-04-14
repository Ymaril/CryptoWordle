# 🔐 CryptoWordle

A **cryptographically secure Wordle-style puzzle** — built for curiosity, challenge, and fun.

The encrypted word cannot be reversed or revealed by reading the code or URL.  
Brute-forcing is the only way to find it — and **guessing is brute-forcing**.  
That's the entire game: each attempt is a costly cryptographic guess.

This game enforces that principle with **heavy hashing** and **stream-based validation**.

---

### ✨ What makes it unique?

- Each letter is hashed using a salted, position-based strategy
- The hashing algorithm is intentionally expensive — to make guessing costly
- The encrypted word is encoded as a compact `base64url` string
- There is **no way to decrypt the original word**
- Guesses are validated **without revealing any internal state**
- **Reactive streams (RxJS)** power everything: encryption, progress, comparison

---

### 🚀 Getting Started

#### 1. Install dependencies

```bash
yarn
```

#### 2. Start the dev server

```bash
yarn dev
```

#### 3. Open in your browser

```
http://localhost:3000
```

---

### 🛠️ Built With

- ⚡️ **Vite** – modern build tool
- ⚛️ **React** + **TypeScript**
- 🔄 **RxJS** – fully reactive encryption and validation
- 🧮 **base64url** – safe and shareable encoded words
