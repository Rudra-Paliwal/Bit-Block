# 🔐 Bit-Block v2 — Client-Side Encryption Tool 

**Bit-Block** is a lightweight, no-backend encryption web app that lets users securely **encrypt and decrypt text or files directly in the browser** — with **zero data sent to any server**.  
All encryption happens **locally** using the **Web Crypto API (AES-GCM + PBKDF2)** ensuring full privacy and security.

---

## 🚀 Live Demo

👉 https://rudra-paliwal.github.io/Bit-Block/

*(No backend — safe to use even offline)*

------------------------------------------------------

## ✨ Features

- 🔒 **Client-side encryption only** — No servers, no tracking.  
- 📄 **Text Encryption/Decryption** — Simple UI for encrypting messages.  
- 📁 **File Encryption/Decryption** — Works with any file type.  
- 🧠 **AES-GCM algorithm** for high-level security.  
- 🧂 **PBKDF2 key derivation** with adjustable iterations.  
- ⚡ **Completely offline compatible** — works even without internet.  
- 💻 **Lightweight UI** — minimal design with responsive layout.  

---

## 🧩 Tech Stack

| Layer | Technology Used |
|:------|:----------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Cryptography | Web Crypto API (AES-GCM, PBKDF2) |
| Hosting | Github (Static) |
| Design | Minimal responsive grid system |

---

## 📂 Project Structure

```
bit_V2/
│
├── index.html        # Text encryption page
├── file.html         # File encryption page
├── style.css         # Styling and layout
├── script.js         # Core logic (encryption/decryption)
└── README.md         # Documentation
```

---

## 🧭 Usage Guide

### 🔹 Encrypt Text
1. Open **index.html**.
2. Enter text and passphrase.
3. Click **Encrypt → Copy/Download**.
4. To decrypt, paste ciphertext + use same passphrase.

### 🔹 Encrypt Files
1. Open **file.html**.
2. Choose a file and set passphrase.
3. Click **Encrypt File** → downloads `.secure.json`.
4. To decrypt, select the `.secure.json` file and same passphrase → original file restored.

---

## 🔐 Encryption Format

Each encrypted file produces a JSON package like:

```json
{
  "v": 1,
  "alg": "AES-GCM",
  "salt": "base64...",
  "iv": "base64...",
  "iters": 250000,
  "ct": "base64...",
  "filename": "example.txt"
}
```

---

## ⚙️ How It Works

- **Key Derivation:** User passphrase → PBKDF2 (with salt + iterations) → AES-GCM key.  
- **Encryption:** Data is encrypted in-browser using Web Crypto API.  
- **Decryption:** JSON data + passphrase reconstruct the key to decrypt locally.  
- **Security:** No backend or third-party API is involved.

---

## 🧠 Goals

> Bit-Block aims to make encryption **accessible, transparent, and safe** for non-technical users —  
> giving them a simple interface to secure their private data without trusting external servers.

---

## 🛠️ Setup & Run Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/rishitapardeshi/Bit-Block-v2.git
   cd Bit-Block-v2
   ```

2. Run locally by opening `index.html` or `file.html` in your browser.

3. (Optional) Deploy on Netlify / GitHub Pages for instant hosting.


---

## 🪪 License

This project is open-source under the **MIT License**.  
Feel free to fork, improve, or use for educational purposes.  
Please retain attribution.

---

## ❤️ Acknowledgements

- Inspired by privacy-first tools like [cryptii.com](https://cryptii.com) & [AES online demo].  
- Built for personal security, education, and awareness.

---

### 💡 Tagline

> **“Encrypt everything. Trust nothing outside your browser.”**
