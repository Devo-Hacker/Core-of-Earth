# 🌍 EARTHER: Interactive Spatial Model

![Earther Banner](https://img.shields.io/badge/Three.js-Black?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> *What are we in this multiverse? Initiate Descent.*

**Earther** is a cinematic, scroll-driven 3D web experience built with Three.js. It takes users on an interactive journey from the vastness of space down through the geological layers of the Earth. Featuring a procedurally generated galaxy, custom shaders/lighting, and glassmorphism UI, this project blends educational storytelling with cutting-edge web design.

---

## 🎥 Live Preview

*(Add your video demonstration here)*

<div align="center">
  <video width="100%" controls autoplay loop muted>
    <source src="src/assets/earther.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>

---

## ✨ Key Features

* **Scroll-Driven Storytelling:** Smoothly interpolate the camera and layer visibility based on user scroll events, powered by a custom trapezoid mathematical function for seamless transitions.
* **Procedural Galaxy Generation:** A dynamically generated starfield featuring over 15,000 scattered stars and a dense, 6,000-star tilted band to mimic the Milky Way.
* **Interactive Geological Layers:** 
  * 🌎 **Crust:** Stunning 8k day/night textures with high-intensity emissive city lights.
  * 🪨 **Mantle:** Textured rock with a deep, emissive magma glow.
  * 🌋 **Outer Core:** Swirling molten lava aesthetics.
  * ⚙️ **Inner Core:** A highly metallic, intensely bright solid iron core.
* **Cinematic Lighting & Camera:** Utilizes OrbitControls with damping, directional sun lighting with a point light glow, and ambient fill lights to create a dramatic, realistic look.
* **Spatial UI Design:** Built with Tailwind CSS and custom glassmorphism effects (`backdrop-filter`), featuring contextual story cards that fade in as you delve deeper.
* **Developer GUI:** Integrated `lil-gui` (toggleable via the `H` key) to tweak story progression, lighting intensity, and material emissiveness in real-time.

---

## 🛠️ Tech Stack

* **Core Engine:** [Three.js](https://threejs.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** Tailwind CSS & Custom CSS (Glassmorphism, CSS Animations)
* **Controls & Debugging:** `OrbitControls`, `lil-gui`
* **Typography:** 'Inter' via Google Fonts

---

## 📁 Project Structure

Below is a glimpse of the development environment (as seen in `image_23d586.jpg`), utilizing Vite for blazing-fast HMR and organized asset management:

```text
📦 src
 ┣ 📂 assets
 ┃ ┣ 📂 texture
 ┃ ┃ ┣ 📜 8k_earth_daymap.jpg
 ┃ ┃ ┣ 📜 8k_earth_nightmap.jpg
 ┃ ┃ ┣ 📜 Lava003.png
 ┃ ┃ ┣ 📜 Metal044B.png
 ┃ ┃ ┗ 📜 Rock035.png
 ┣ 📜 main.js       # Three.js scene setup, procedural galaxy, and render loop
 ┣ 📜 style.css     # Tailwind imports, cinematic animations, and spatial UI styling
 ┣ 📜 index.html    # DOM structure, Hero overlay, and Story panels
 ┗ 📜 vite.config.js