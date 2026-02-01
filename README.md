
# FPS Tree Game 🌳

A lightweight, browser-based **first-person 3D game** built with modern web technologies.

This project is intentionally minimal:  
**you can walk around in first-person view and see a single tree.**  
That’s it — and that’s the point.

---

## 🎯 Project Goal

The purpose of this project is to:

- Learn **browser-based 3D game development**
- Ship something **playable fast**
- Stay lightweight and easy to deploy
- Avoid overengineering (no big engines, no assets yet)

### v0.1 Goal
- First-person POV
- WASD movement + mouse look
- Gravity & collision
- Flat ground
- One tree 🌳
- Deployed publicly (Netlify)

---

## 🧠 Tech Stack

### Core
- **Babylon.js** – Web-based 3D game engine
- **JavaScript (ES Modules)**

### Tooling
- **Vite** – Dev server & build tool
- **Node.js** – Local development
- **npm** – Dependency management

### Deployment
- **Netlify** – Static hosting & auto-deploy

---

## 🗂 Project Structure

```

fps-tree-game/
├── index.html
├── src/
│   └── main.js
├── public/
├── package.json
├── vite.config.js
└── README.md

````

---

## 🚀 Getting Started (Local Dev)

### 1. Install dependencies
```bash
npm install
````

### 2. Run dev server

```bash
npm run dev
```

Open the URL shown in terminal (usually `http://localhost:5173`)

* Click the canvas to lock mouse
* Use **WASD** to move
* Move mouse to look around

---

## 📦 Build (Compile)

To create a production-ready build:

```bash
npm run build
```

This generates a `/dist` folder containing static files.

---

## 🌍 Deployment (Netlify)

### Manual Deploy

1. Go to Netlify
2. Add new site → Deploy manually
3. Drag the `dist/` folder
4. Done 🎉

### Git-Based Deploy (Recommended)

Netlify settings:

* **Build command:** `npm run build`
* **Publish directory:** `dist`

Every push to `main` auto-deploys.

---

## 🕹 Controls

| Action        | Input        |
| ------------- | ------------ |
| Move forward  | W            |
| Move backward | S            |
| Strafe left   | A            |
| Strafe right  | D            |
| Look around   | Mouse        |
| Lock pointer  | Click canvas |

---

## 🧩 Current Features

* First-person camera (UniversalCamera)
* Mouse look (pointer lock)
* Gravity & collision
* Simple lighting
* Procedural tree (cylinder + sphere)

---

## 🛣 Roadmap

### v0.2

* Jump
* Simple goal object (walk to win)

### v0.3

* Multiple trees (random placement)
* Basic UI hint (click to start)

### v0.4

* Block / voxel experiments
* Simple terrain variation

---

## 🧠 Design Philosophy

* **Ship fast**
* **Keep it readable**
* **Learn by building**
* **One feature at a time**

This is not a full engine.
This is a learning playground that happens to be fun.

---

## 📄 License

MIT – do whatever you want with it.

---

## 🙌 Credits

Built by Jovylle
Powered by Babylon.js + the modern web

