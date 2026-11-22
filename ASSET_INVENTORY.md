# 3D ASSET INVENTORY & WEBGL SPECIFICATION
## Aura Artisanal Cafe & Roastery

**Version:** 1.0.0  
**Updated:** Phase 0 Discovery & Asset Audit  
**Author:** 3D WebGL / Three.js Lead Engineer  

---

## 1. Asset Audit & Workspace Inspection Findings

An exhaustive scan of the project workspace was conducted. The project repository initially contained the strategic specifications (`master_Plan.docx` and `immersive_3d_cafe_website_blueprint.docx`). No pre-packaged external `.glb` or `.gltf` binary model files were stored in the workspace root.

To ensure **100% operational autonomy, instant loading, and zero missing-dependency failures**, this project implements a hybrid **Engineered WebGL Architecture**:
1. **Procedural High-Fidelity 3D Geometries:** Hand-crafted Three.js parametric geometries representing the iconic ceramic coffee cup, contoured saucer, latte art froth disc, ambient cafe counter, and rising steam particle system.
2. **GLTF/GLB Loader Pipeline Ready:** The architecture includes an asynchronous `GLTFLoader` with Draco compression support. Whenever the cafe owner uploads custom 3D files (e.g., `signature-cup.glb`, `interior-tour.glb`) to `/public/assets/models/`, the system automatically hot-swaps to the external asset.
3. **Hardware-Accelerated Fallback:** An immediate, beautiful CSS3 cinematic card and SVG canvas fallback renders seamlessly on low-power devices, systems with WebGL disabled, or users with `prefers-reduced-motion`.

---

## 2. Asset Manifest & Placement Mapping

| Asset ID | Asset Name | Primary Format | Intended Placement | Triangle Budget | Optimization & Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MOD-01** | Signature Ceramic Coffee Cup & Saucer | Procedural Mesh / `signature-cup.glb` | Homepage Hero Canvas | ~12,500 tris | Smooth phong/pbr materials, dynamic shadow map (512x512), orbit parallax |
| **MOD-02** | Volumetric Steam System | Three.js Particle System (Points) | Hero Canvas & Product View | 150 billboard particles | Soft alpha blending, random velocity drift, zero CPU physics overhead |
| **MOD-03** | Latte Art Froth Surface | Canvas Texture Procedural Shader | Coffee Cup Top Mesh | 2D Canvas 512x512 | Rosette/heart micro-texture with roughness map |
| **MOD-04** | Virtual Cafe Spatial Tour | Multi-mesh environment / `cafe-tour.glb` | Section "Experience Aura" | ~24,000 tris | Baked lightmaps, interactive camera navigation points, low-draw-call instancing |
| **MOD-05** | Artisanal Packaging & Beans | Three.js Cylinder & Label Map | Product Inspector Modal | ~4,200 tris | 360-degree rotation inspect modal with touch controls |

---

## 3. WebGL Scene Configuration & Camera Specifications

### Hero Scene (`HeroScene.js`):
- **Camera:** PerspectiveCamera (FOV: 42°, Near: 0.1, Far: 1000). Default Position: `[0, 1.6, 4.2]`, LookAt: `[0, 0.4, 0]`.
- **Lighting Setup:**
  - Key Light: DirectionalLight (`#FFE8D6`, Intensity: 2.2), Position: `[3, 5, 2]`, Soft Shadows.
  - Rim Light: DirectionalLight (`#E0F2FE`, Intensity: 1.4), Position: `[-4, 3, -2]` (creates rim silhouette on ceramic).
  - Ambient Fill: HemisphereLight (`#F7F3EB`, `#2E4237`, Intensity: 0.85).
- **Interactivity:** Gentle mouse movement parallax on desktop, smooth gyroscopic/touch drag on mobile, auto-rotation idle speed of 0.005 rad/frame.

### Spatial Atmosphere Tour (`CafeTour.js`):
- Four interactive cinematic waypoints:
  1. *The Espresso Bar:* Focus on the dual-group machine and brass tamper station.
  2. *The Roastery Corner:* Focus on the artisanal micro-roaster and green bean sacks.
  3. *The Courtyard Lounge:* Natural oak tables and skylight illumination.
  4. *The Pastry Counter:* Warm glass vitrine with baked brioche and croissants.

---

## 4. Performance & Memory Safeguards

1. **Pixel Ratio Clamping:** Set to `Math.min(window.devicePixelRatio, 1.75)` to prevent GPU throttling on high-DPI smartphone displays (e.g. 3x Retina).
2. **Context Loss Recovery:** Built-in `webglcontextlost` and `webglcontextrestored` event handlers prevent browser crashing and cleanly reload the scene.
3. **Memory Disposal:** All geometries, textures, materials, and requestAnimationFrame loops are systematically disposed of upon component unmounting.
4. **Visibility Observer:** Canvas rendering pauses automatically (`renderer.setAnimationLoop(null)`) when the canvas scrolls out of the active viewport.
