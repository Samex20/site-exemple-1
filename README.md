# WEAPON SYSTEMS ARCHIVE

One-page cinematic scroll experience (React + Vite + Tailwind + Three/R3F + GSAP ScrollTrigger + Lenis).

## Run locally

```bash
npm install
npm run dev
```

## 3D model paths (required)

Place the provided glTF scenes exactly here (Vite serves `public/` at `/`):

```
public/models/w1/scene.gltf
public/models/w1/scene.bin
public/models/w1/textures/...

public/models/w2/scene.gltf
public/models/w2/scene.bin
public/models/w2/textures/...

public/models/w3/scene.gltf
public/models/w3/scene.bin
public/models/w3/textures/...
```

The app loads these exact URLs:

- `/models/w1/scene.gltf`
- `/models/w2/scene.gltf`
- `/models/w3/scene.gltf`

Texture paths must remain as-exported inside each weapon folder.

## Editing callout anchor points

Callout anchors and offsets live in:

- [src/data/weapons.js](src/data/weapons.js)

Each callout has:

- `anchor`: model-local position `[x, y, z]`
- `offset`: screen offset `[dx, dy]` for the label placement

Adjust these after you confirm the models’ local scale/origin.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
