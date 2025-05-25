## 🖼️ Image Eval Guide

Use JavaScript to create or modify images using **ImageScript** or **Sharp** in a secure VM.

---

### 🧪 How to Use

Return an image object or log something with `console.log()`.

---

### ✨ ImageScript Example

```js
const img = await Image.decode(await fetch(authorAvatar).then(r => r.arrayBuffer()));
return img.resize(100, 100);
```

Available: `Image`, `GIF`, `Frame`, `.resize()`, `.composite()`, `.drawText()`

---

### ⚡ Sharp Example

```js
return sharp(await fetch(authorAvatar).then(r => r.arrayBuffer()))
  .resize(100, 100)
  .png();
```

Available: `sharp(...)`, `.resize()`, `.png()`, `.jpeg()`, `.webp()`, etc.

---

### 🌐 Globals

- `authorAvatar`: string (URL)
- `fetch`: use for arrayBuffer fetching
- `console.log()`: up to 5000 characters

---

### ⚠️ Output Rules

- Must return an image or log something
- Image output is auto-encoded (PNG, JPEG, WebP, GIF)

