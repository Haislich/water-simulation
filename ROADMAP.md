# WebGL Water Simulation – Project Roadmap

This document outlines the complete development roadmap for the final exam project in Interaactive Graphics.

---

## Project Requirements Overview

- Technologies: **Rendering**, **Shading**, and **Animation**
- Platform: **Plain WebGL** (preferred for top marks)
- Animation: **Manual**, not from pre-baked models
- Physics: Custom implementation preferred over external libraries
- Presentation: Oral explanation and code walkthrough (10 minutes)

---

## 🛠️ Phase 1 – Project Setup

- [ ] ✅ Initialize project with **Bun** and TypeScript
  - `bun init`
  - Add `tsconfig.json`, `index.html`, `main.ts`, `style.css`
- [ ] Set up **WebGL2 rendering context**
- [ ] Add basic TypeScript structure with modules and strict typing
- [ ] Add development server (e.g., `bun --watch` or `vite` fallback)
- [ ] Set up linter + Prettier for consistent formatting

---

## 🎨 Phase 2 – Water Rendering & Shading

- [ ] Create GLSL **vertex + fragment shaders** for animated water
- [ ] Implement **time-based wave distortion** via sin/cos in shaders
- [ ] Add **normal mapping** or dynamic lighting to water surface
- [ ] Use a **framebuffer or cube map** for basic reflections
- [ ] Allow toggling visual effects (reflection, normal map, etc.)

---

## 🧠 Phase 3 – Manual Animation & Physics

- [ ] Add a **floating object (e.g., cube or boat)**
  - [ ] Apply **manual buoyancy calculation** (vertical movement based on water height)
  - [ ] React to wave direction and slope
- [ ] Implement **impulse-based interaction**
  - [ ] User can "tap" the boat to perturb it (simulate a push)
  - [ ] React with inertia and damping
- [ ] Add **sun/moon light source** rotating around the scene
  - [ ] Light direction affects water shading (GLSL uniform)

---

## 🎮 Phase 4 – Camera and Scene Interaction

- [ ] Implement **camera controls**
  - [ ] Rotate around scene
  - [ ] Translate (left, right, up, down, forward, back)
  - [ ] Keyboard + mouse input
- [ ] Add GUI (or simple keys) to **enable/disable features**
  - [ ] Reflection toggle
  - [ ] Perturbation toggle
  - [ ] Debug overlays (normals, FPS)

---

## 🧪 Phase 5 – Testing & Performance

- [ ] Add FPS counter to monitor real-time performance
- [ ] Optimize draw calls, shader performance
- [ ] Ensure fallbacks for lower-spec machines (reduce resolution, disable effects)
- [ ] Test in multiple browsers (Chrome, Firefox)

---

## 🧾 Phase 6 – Documentation & Presentation

- [ ] Write clear code comments and modular structure
- [ ] Create a `README.md` with:
  - [ ] Description
  - [ ] Setup instructions
  - [ ] Features
  - [ ] Controls
- [ ] Prepare for oral exam:
  - [ ] Be able to explain every major code block
  - [ ] Rehearse English explanation
  - [ ] Time your presentation (~10 minutes)

---

## 🏁 Bonus (Optional but impressive)

- [ ] Add **skybox or dynamic background** for better realism
- [ ] Implement **refraction** in water (more advanced FBO work)
- [ ] Add audio feedback when interacting with the scene
- [ ] Export demo video / animated GIF for documentation

---

## 🔚 Final Deliverables

- [ ] Fully working WebGL + TypeScript app
- [ ] Codebase with modular structure and clear naming
- [ ] Ability to run demo on laptop during in-person exam
- [ ] Oral presentation ready, with confident code walkthrough

---

🟢 **Goal**: Build an interactive, visually appealing, and technically solid WebGL water simulation that satisfies all core rendering, shading, and animation criteria — and implements meaningful physics and interaction for honors (30 e lode).
