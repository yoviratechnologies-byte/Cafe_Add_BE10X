/**
 * Aura Artisanal Cafe & Roastery — 3D WebGL Engine
 * Implements: Hero Ceramic Cup, Rising Steam Particle Simulation, & Spatial Cafe Tour
 */

(function () {
  'use strict';

  // Check if WebGL is supported
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Global references
  let heroRenderer, heroScene, heroCamera, heroCupGroup, steamParticles;
  let tourRenderer, tourScene, tourCamera;
  let isHeroHovered = false;

  // Waypoints for the Virtual Cafe Tour
  const tourWaypoints = {
    bar: { position: [0, 1.8, 4.5], target: [0, 1.2, 0], fov: 45 },
    roastery: { position: [-3.8, 2.2, 3.2], target: [-2.0, 1.0, -1.0], fov: 50 },
    lounge: { position: [3.5, 1.9, 3.8], target: [1.5, 0.8, -0.5], fov: 48 },
    pastry: { position: [0.2, 1.4, 2.8], target: [0.1, 0.9, 0], fov: 40 }
  };

  /**
   * Generates a procedural Canvas Texture for the Latte Art Froth
   */
  function createLatteArtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich Crema Background
    const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    grad.addColorStop(0, '#5a3825');
    grad.addColorStop(0.5, '#784c31');
    grad.addColorStop(0.85, '#a46f48');
    grad.addColorStop(1, '#c99468');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Micro-texture foam specks
    ctx.fillStyle = 'rgba(255, 245, 230, 0.12)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Latte Art Rosette / Heart Shape in center
    ctx.save();
    ctx.translate(256, 256);
    ctx.fillStyle = '#fdfaf5';
    ctx.shadowColor = 'rgba(90, 56, 37, 0.4)';
    ctx.shadowBlur = 10;

    // Center Rosette Leaves
    for (let layer = 5; layer >= 1; layer--) {
      ctx.beginPath();
      const radius = layer * 18;
      ctx.ellipse(0, -layer * 12, radius, radius * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Drawn Heart Tail
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(0, 90);
    ctx.strokeStyle = '#fdfaf5';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Generates soft circular alpha texture for the steam particle simulation
   */
  function createSteamParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.18)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Initializes the 3D Hero Coffee Cup Scene
   */
  function initHeroScene() {
    const container = document.getElementById('hero-canvas-container');
    const canvas = document.getElementById('hero-canvas');
    const fallback = document.getElementById('hero-fallback');

    if (!isWebGLAvailable() || !window.THREE) {
      if (fallback) fallback.classList.add('active');
      return;
    }

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Scene
    heroScene = new THREE.Scene();

    // Camera
    heroCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    heroCamera.position.set(0, 1.8, 4.4);
    heroCamera.lookAt(0, 0.35, 0);

    // Renderer
    heroRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    heroRenderer.setSize(width, height);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    heroRenderer.shadowMap.enabled = true;
    heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting Setup
    const ambientLight = new THREE.HemisphereLight(0xfcf8f2, 0x2e4237, 0.85);
    heroScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(3, 5, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.001;
    heroScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbad7f2, 1.4);
    rimLight.position.set(-3.5, 3, -2.5);
    heroScene.add(rimLight);

    // Cup & Saucer Group
    heroCupGroup = new THREE.Group();
    heroScene.add(heroCupGroup);

    // Ceramic Material
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0x1f1917, // Charcoal Espresso Ceramic
      roughness: 0.28,
      metalness: 0.08
    });

    // 1. Saucer Plate
    const saucerGeo = new THREE.CylinderGeometry(1.6, 1.0, 0.12, 48);
    const saucer = new THREE.Mesh(saucerGeo, ceramicMat);
    saucer.position.y = -0.06;
    saucer.receiveShadow = true;
    saucer.castShadow = true;
    heroCupGroup.add(saucer);

    // Saucer Rim Lip
    const lipGeo = new THREE.TorusGeometry(1.58, 0.05, 16, 48);
    lipGeo.rotateX(Math.PI / 2);
    const saucerLip = new THREE.Mesh(lipGeo, ceramicMat);
    saucerLip.position.y = 0.01;
    heroCupGroup.add(saucerLip);

    // 2. Coffee Cup Body
    const cupGeo = new THREE.CylinderGeometry(0.95, 0.65, 1.15, 48, 1, true);
    const cup = new THREE.Mesh(cupGeo, ceramicMat);
    cup.position.y = 0.56;
    cup.castShadow = true;
    cup.receiveShadow = true;
    heroCupGroup.add(cup);

    // Cup Base Inside
    const cupBaseGeo = new THREE.CircleGeometry(0.65, 48);
    cupBaseGeo.rotateX(-Math.PI / 2);
    const cupBase = new THREE.Mesh(cupBaseGeo, ceramicMat);
    cupBase.position.y = -0.01;
    heroCupGroup.add(cupBase);

    // Cup Smooth Rim Ring
    const cupRimGeo = new THREE.TorusGeometry(0.95, 0.04, 16, 48);
    cupRimGeo.rotateX(Math.PI / 2);
    const cupRim = new THREE.Mesh(cupRimGeo, ceramicMat);
    cupRim.position.y = 1.14;
    heroCupGroup.add(cupRim);

    // 3. Ergonomic Handle
    const handleGeo = new THREE.TorusGeometry(0.38, 0.09, 16, 32, Math.PI * 1.15);
    handleGeo.rotateZ(-Math.PI / 4);
    const handle = new THREE.Mesh(handleGeo, ceramicMat);
    handle.position.set(0.96, 0.58, 0);
    handle.castShadow = true;
    heroCupGroup.add(handle);

    // 4. Coffee Liquid & Froth Disc
    const coffeeMat = new THREE.MeshStandardMaterial({
      map: createLatteArtTexture(),
      roughness: 0.35,
      metalness: 0.02
    });
    const coffeeGeo = new THREE.CircleGeometry(0.91, 48);
    coffeeGeo.rotateX(-Math.PI / 2);
    const coffeeSurface = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffeeSurface.position.y = 1.05;
    heroCupGroup.add(coffeeSurface);

    // 5. Volumetric Steam Particle System
    const steamCount = 80;
    const steamGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(steamCount * 3);
    const velocities = new Float32Array(steamCount * 3);

    for (let i = 0; i < steamCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 0.7;
      positions[i * 3 + 1] = 1.1 + Math.random() * 1.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.7;

      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = 0.004 + Math.random() * 0.006;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    steamGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    steamGeo.userData = { velocities: velocities };

    const steamMat = new THREE.PointsMaterial({
      size: 0.35,
      map: createSteamParticleTexture(),
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    steamParticles = new THREE.Points(steamGeo, steamMat);
    heroCupGroup.add(steamParticles);

    // Interactive Drag / Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        heroCupGroup.rotation.y += deltaX * 0.008;
        heroCupGroup.rotation.x = Math.max(-0.25, Math.min(0.4, heroCupGroup.rotation.x + deltaY * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    });

    // Touch Support for Mobile
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    canvas.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        heroCupGroup.rotation.y += deltaX * 0.01;
        heroCupGroup.rotation.x = Math.max(-0.2, Math.min(0.3, heroCupGroup.rotation.x + deltaY * 0.008));
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    // Animate Loop
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Gentle continuous idle rotation if not dragged
      if (!isDragging && !prefersReducedMotion) {
        heroCupGroup.rotation.y += 0.004;
      }

      // Animate Steam Particles
      if (steamParticles && !prefersReducedMotion) {
        const pos = steamParticles.geometry.attributes.position.array;
        const vel = steamParticles.geometry.userData.velocities;

        for (let i = 0; i < steamCount; i++) {
          pos[i * 3 + 1] += vel[i * 3 + 1];
          pos[i * 3 + 0] += Math.sin(elapsed * 2 + i) * 0.002;
          pos[i * 3 + 2] += Math.cos(elapsed * 2 + i) * 0.002;

          // Reset particle if it floats too high
          if (pos[i * 3 + 1] > 2.8) {
            pos[i * 3 + 1] = 1.08;
            pos[i * 3 + 0] = (Math.random() - 0.5) * 0.65;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.65;
          }
        }
        steamParticles.geometry.attributes.position.needsUpdate = true;
      }

      heroRenderer.render(heroScene, heroCamera);
    }

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      heroCamera.aspect = w / h;
      heroCamera.updateProjectionMatrix();
      heroRenderer.setSize(w, h);
    });
  }

  /**
   * Initializes the 3D Virtual Cafe Tour Scene
   */
  function initTourScene() {
    const container = document.getElementById('tour-canvas-container');
    const canvas = document.getElementById('tour-canvas');
    if (!container || !canvas || !isWebGLAvailable() || !window.THREE) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    tourScene = new THREE.Scene();
    tourScene.background = new THREE.Color(0x191614);
    tourScene.fog = new THREE.FogExp2(0x191614, 0.12);

    tourCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const startPoint = tourWaypoints.bar;
    tourCamera.position.set(...startPoint.position);
    tourCamera.lookAt(...startPoint.target);

    tourRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    tourRenderer.setSize(width, height);
    tourRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    // Warm Ambient Cafe Lighting (2700K)
    const cafeWarmLight = new THREE.PointLight(0xffb366, 2.5, 12);
    cafeWarmLight.position.set(0, 3.2, 0);
    tourScene.add(cafeWarmLight);

    const softFill = new THREE.AmbientLight(0xfff5ea, 0.8);
    tourScene.add(softFill);

    // Architectural Elements: Timber Floor & Microcement Counter
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2b221a, roughness: 0.6 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    tourScene.add(floor);

    // Counter Bar
    const counterGeo = new THREE.BoxGeometry(4.5, 1.1, 1.4);
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x3d3027, roughness: 0.4 });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(0, 0.55, -0.6);
    tourScene.add(counter);

    // Espresso Machine Representation
    const machineGeo = new THREE.BoxGeometry(1.2, 0.6, 0.6);
    const machineMat = new THREE.MeshStandardMaterial({ color: 0x8a9299, metalness: 0.85, roughness: 0.2 });
    const machine = new THREE.Mesh(machineGeo, machineMat);
    machine.position.set(-0.8, 1.4, -0.6);
    tourScene.add(machine);

    // Pendant Lamps with Warm Glow
    for (let x = -1.2; x <= 1.2; x += 1.2) {
      const lampGeo = new THREE.ConeGeometry(0.22, 0.35, 24);
      lampGeo.rotateX(Math.PI);
      const lampMat = new THREE.MeshStandardMaterial({ color: 0xcaa472, metalness: 0.7, roughness: 0.3 });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(x, 2.6, -0.6);
      tourScene.add(lamp);

      const bulb = new THREE.PointLight(0xffc580, 1.8, 4);
      bulb.position.set(x, 2.4, -0.6);
      tourScene.add(bulb);
    }

    // Animation & Smooth Waypoint Transition
    let currentTargetPos = new THREE.Vector3(...startPoint.position);
    let currentLookAt = new THREE.Vector3(...startPoint.target);

    window.switchTourWaypoint = function (key) {
      const wp = tourWaypoints[key];
      if (!wp) return;

      currentTargetPos.set(...wp.position);
      currentLookAt.set(...wp.target);

      document.querySelectorAll('.tour-btn').forEach((b) => b.classList.remove('active'));
      const activeBtn = document.querySelector(`[data-wp="${key}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    };

    function animateTour() {
      requestAnimationFrame(animateTour);

      // Smooth Lerp Camera
      tourCamera.position.lerp(currentTargetPos, 0.04);
      tourCamera.lookAt(currentLookAt);

      tourRenderer.render(tourScene, tourCamera);
    }

    animateTour();

    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      tourCamera.aspect = w / h;
      tourCamera.updateProjectionMatrix();
      tourRenderer.setSize(w, h);
    });
  }

  // Self-initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHeroScene();
      initTourScene();
    });
  } else {
    initHeroScene();
    initTourScene();
  }
})();
