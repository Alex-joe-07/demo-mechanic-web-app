/**
 * Cinematic 3D Motorcycle Hero Experience using Three.js
 * Features a high-fidelity bespoke motorcycle model, dramatic industrial lighting,
 * smooth mouse parallax, and scroll-driven perspective camera choreography.
 */

class Hero3DExperience {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.fallbackBg = document.querySelector('.hero-fallback-bg');
    this.loader = document.getElementById('hero-3d-loader');
    
    // Check reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pointer Parallax state
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;
    this.isInitialized = false;

    // Check WebGL availability
    if (!this.isWebGLAvailable()) {
      this.activateFallback();
      return;
    }

    this.init();
  }

  isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  activateFallback() {
    if (this.fallbackBg) {
      this.fallbackBg.style.opacity = '1';
    }
    if (this.loader) {
      this.loader.style.opacity = '0';
      setTimeout(() => this.loader.remove(), 400);
    }
    
    // Add subtle CSS mouse tilt to fallback
    if (!this.prefersReducedMotion && this.fallbackBg) {
      window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 15;
        this.fallbackBg.style.transform = `scale(1.05) translate(${-x}px, ${-y}px)`;
      }, { passive: true });
    }
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0c0d0c, 0.045);

    // 2. Camera setup
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    // Position camera offset to the right so editorial text on left has prominence
    this.cameraBasePos = { x: 1.45, y: 1.05, z: 4.6 };
    this.camera.position.set(this.cameraBasePos.x, this.cameraBasePos.y, this.cameraBasePos.z);
    this.cameraTarget = new THREE.Vector3(1.25, 0.42, 0);
    this.camera.lookAt(this.cameraTarget);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. Lights & Materials
    this.setupLighting();
    this.setupMaterials();

    // 5. Build Motorcycle Model
    this.motorcycleGroup = new THREE.Group();
    this.buildMotorcycle();
    
    // Position motorcycle in the right-hand portion of the scene (leaving left for copy)
    this.updateModelPlacement();
    this.motorcycleGroup.rotation.y = -0.36; // 3/4 front-three-quarter view
    this.scene.add(this.motorcycleGroup);

    // 6. Ground Shadow & Studio Floor
    this.setupGround();

    // 7. Atmospheric Dust Particles
    this.setupDustParticles();

    // 8. Event Listeners
    this.bindEvents();

    // 9. Start Loop
    this.isInitialized = true;
    this.animate();

    // Remove Loader
    setTimeout(() => {
      if (this.loader) {
        this.loader.style.opacity = '0';
        setTimeout(() => this.loader.remove(), 500);
      }
    }, 300);
  }

  setupLighting() {
    // Ambient light - dark moody workshop fill
    const ambientLight = new THREE.AmbientLight(0x222220, 0.9);
    this.scene.add(ambientLight);

    // Main Overhead Warm Tungsten Key Spotlight
    this.keyLight = new THREE.SpotLight(0xf7e2ca, 3.8);
    this.keyLight.position.set(3.5, 5.0, 3.0);
    this.keyLight.angle = Math.PI / 4.5;
    this.keyLight.penumbra = 0.8;
    this.keyLight.decay = 1.6;
    this.keyLight.distance = 25;
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 15;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // Muted Bronze Rim Light (Silhouette carve)
    this.rimLight = new THREE.DirectionalLight(0xa98252, 2.2);
    this.rimLight.position.set(-4.0, 2.5, -3.0);
    this.scene.add(this.rimLight);

    // Cool Gunmetal Fill Light
    this.fillLight = new THREE.DirectionalLight(0x566773, 1.2);
    this.fillLight.position.set(1.0, 1.0, 4.0);
    this.scene.add(this.fillLight);

    // Low Warm Ground Bounce
    const bounceLight = new THREE.PointLight(0xa98252, 1.0, 6);
    bounceLight.position.set(0.6, -0.2, 0.5);
    this.scene.add(bounceLight);
  }

  setupMaterials() {
    // Muted Brushed Bronze (Tank & Accents)
    this.matBronze = new THREE.MeshStandardMaterial({
      color: 0xa98252,
      metalness: 0.88,
      roughness: 0.28,
      envMapIntensity: 1.2
    });

    // Dark Gunmetal / Chassis Powder Coat
    this.matChassis = new THREE.MeshStandardMaterial({
      color: 0x181918,
      metalness: 0.8,
      roughness: 0.35
    });

    // Machined Engine Alloy / Cooling Fins
    this.matEngineAlloy = new THREE.MeshStandardMaterial({
      color: 0x3d3f3e,
      metalness: 0.9,
      roughness: 0.3
    });

    // Polished Chrome / Polished Steel
    this.matChrome = new THREE.MeshStandardMaterial({
      color: 0xe6e6e6,
      metalness: 0.98,
      roughness: 0.12
    });

    // Matte Black Rubber (Tires & Grips)
    this.matRubber = new THREE.MeshStandardMaterial({
      color: 0x141414,
      metalness: 0.1,
      roughness: 0.9
    });

    // Handcrafted Cognac Leather Saddle
    this.matLeather = new THREE.MeshStandardMaterial({
      color: 0x6e3d1c,
      metalness: 0.15,
      roughness: 0.75
    });

    // Headlight Glass Lens
    this.matGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      ior: 1.5
    });
  }

  buildMotorcycle() {
    const root = this.motorcycleGroup;

    // --- 1. WHEELS ---
    const wheelRadiusFront = 0.52;
    const wheelRadiusRear = 0.48;
    const tireThickness = 0.14;
    const wheelbase = 1.95;

    // Front Wheel Assembly
    const frontWheel = this.createSpokedWheel(wheelRadiusFront, tireThickness, true);
    frontWheel.position.set(wheelbase * 0.52, wheelRadiusFront, 0);
    root.add(frontWheel);

    // Rear Wheel Assembly
    const rearWheel = this.createSpokedWheel(wheelRadiusRear, tireThickness, false);
    rearWheel.position.set(-wheelbase * 0.48, wheelRadiusRear, 0);
    root.add(rearWheel);

    // --- 2. FRAME & CHASSIS (TIG WELDED TUBULAR GEOMETRY) ---
    const frameGroup = new THREE.Group();

    // Lower cradle rails
    const cradleGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.1, 12);
    const cradleL = new THREE.Mesh(cradleGeo, this.matChassis);
    cradleL.rotation.z = Math.PI / 2;
    cradleL.position.set(-0.05, 0.28, 0.1);
    cradleL.castShadow = true;
    frameGroup.add(cradleL);

    const cradleR = new THREE.Mesh(cradleGeo, this.matChassis);
    cradleR.rotation.z = Math.PI / 2;
    cradleR.position.set(-0.05, 0.28, -0.1);
    cradleR.castShadow = true;
    frameGroup.add(cradleR);

    // Main backbone spine tube
    const spineGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.15, 16);
    const spine = new THREE.Mesh(spineGeo, this.matChassis);
    spine.rotation.z = -Math.PI / 5.2;
    spine.position.set(0.18, 0.85, 0);
    spine.castShadow = true;
    frameGroup.add(spine);

    // Steering neck tube
    const neckGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.32, 16);
    const neck = new THREE.Mesh(neckGeo, this.matChassis);
    neck.rotation.z = -Math.PI / 7;
    neck.position.set(0.66, 1.05, 0);
    frameGroup.add(neck);

    // Tucked short bobber subframe loop
    const subframeCurve = new THREE.TorusGeometry(0.18, 0.022, 12, 24, Math.PI);
    const subframeLoop = new THREE.Mesh(subframeCurve, this.matChassis);
    subframeLoop.rotation.x = Math.PI / 2;
    subframeLoop.rotation.z = Math.PI / 2;
    subframeLoop.position.set(-0.48, 0.82, 0);
    frameGroup.add(subframeLoop);

    root.add(frameGroup);

    // --- 3. AIR-COOLED ENGINE BLOCK (J-SERIES / UCE MONOLITH) ---
    const engineGroup = new THREE.Group();

    // Crankcase
    const crankGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.34, 24);
    const crankcase = new THREE.Mesh(crankGeo, this.matEngineAlloy);
    crankcase.rotation.x = Math.PI / 2;
    crankcase.position.set(0.05, 0.44, 0);
    crankcase.castShadow = true;
    engineGroup.add(crankcase);

    // Stator cover brass badge
    const badgeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24);
    const badge = new THREE.Mesh(badgeGeo, this.matBronze);
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0.05, 0.44, 0.18);
    engineGroup.add(badge);

    // Cylinder with precision cooling fins
    const cylinderBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.32, 16),
      this.matEngineAlloy
    );
    cylinderBase.position.set(0.08, 0.68, 0);
    cylinderBase.rotation.z = -0.15; // authentic forward engine cant
    cylinderBase.castShadow = true;
    engineGroup.add(cylinderBase);

    // Stacked cooling fin plates
    for (let i = 0; i < 7; i++) {
      const fin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.20, 0.20, 0.012, 16),
        this.matEngineAlloy
      );
      fin.position.set(0.08, 0.58 + i * 0.042, 0);
      fin.rotation.z = -0.15;
      engineGroup.add(fin);
    }

    // Cylinder Head & Rocker Covers
    const rockerGeo = new THREE.BoxGeometry(0.26, 0.12, 0.22);
    const rocker = new THREE.Mesh(rockerGeo, this.matEngineAlloy);
    rocker.position.set(0.11, 0.88, 0);
    rocker.rotation.z = -0.15;
    rocker.castShadow = true;
    engineGroup.add(rocker);

    root.add(engineGroup);

    // --- 4. EXHAUST SYSTEM (SCRAMBLER SWEPT PIPE) ---
    const exhaustCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.22, 0.78, 0.14),
      new THREE.Vector3(0.32, 0.50, 0.16),
      new THREE.Vector3(0.10, 0.24, 0.18),
      new THREE.Vector3(-0.25, 0.28, 0.18),
      new THREE.Vector3(-0.65, 0.45, 0.19),
      new THREE.Vector3(-0.95, 0.60, 0.19)
    ]);
    const exhaustGeo = new THREE.TubeGeometry(exhaustCurve, 40, 0.032, 16, false);
    const exhaust = new THREE.Mesh(exhaustGeo, this.matChrome);
    exhaust.castShadow = true;
    root.add(exhaust);

    // Cone megaphone silencer tip in bronze
    const coneGeo = new THREE.ConeGeometry(0.065, 0.28, 16);
    const cone = new THREE.Mesh(coneGeo, this.matBronze);
    cone.rotation.z = -Math.PI / 3.2;
    cone.position.set(-0.92, 0.58, 0.19);
    root.add(cone);

    // --- 5. TEARDROP FUEL TANK WITH BRUSHED BRONZE COAT ---
    const tankGroup = new THREE.Group();
    // Main sculpted tank body
    const tankGeo = new THREE.SphereGeometry(0.36, 24, 18);
    tankGeo.scale(1.4, 0.72, 0.78);
    const tank = new THREE.Mesh(tankGeo, this.matBronze);
    tank.position.set(0.28, 0.98, 0);
    tank.rotation.z = -0.12;
    tank.castShadow = true;
    tankGroup.add(tank);

    // Brass machined gas cap
    const capGeo = new THREE.CylinderGeometry(0.048, 0.052, 0.024, 20);
    const gasCap = new THREE.Mesh(capGeo, this.matBronze);
    gasCap.position.set(0.28, 1.25, 0.06);
    gasCap.rotation.z = -0.15;
    tankGroup.add(gasCap);

    // Matte black knee pads
    const padGeo = new THREE.BoxGeometry(0.28, 0.16, 0.02);
    const padL = new THREE.Mesh(padGeo, this.matRubber);
    padL.position.set(0.22, 0.95, 0.29);
    padL.rotation.y = 0.15;
    tankGroup.add(padL);

    const padR = new THREE.Mesh(padGeo, this.matRubber);
    padR.position.set(0.22, 0.95, -0.29);
    padR.rotation.y = -0.15;
    tankGroup.add(padR);

    root.add(tankGroup);

    // --- 6. SADDLE (HAND-STITCHED COGNAC LEATHER TUCK-AND-ROLL) ---
    const seatCurve = new THREE.BoxGeometry(0.48, 0.09, 0.26);
    const seat = new THREE.Mesh(seatCurve, this.matLeather);
    seat.position.set(-0.32, 0.88, 0);
    seat.rotation.z = 0.08;
    seat.castShadow = true;
    root.add(seat);

    // --- 7. FRONT FORKS & COCKPIT ---
    const forkAngle = -Math.PI / 6.8;
    const forkGroup = new THREE.Group();
    forkGroup.position.set(0.66, 1.05, 0);
    forkGroup.rotation.z = forkAngle;

    // Twin Fork tubes
    const forkTubeGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.2, 16);
    const forkL = new THREE.Mesh(forkTubeGeo, this.matChrome);
    forkL.position.set(0, -0.35, 0.12);
    forkL.castShadow = true;
    forkGroup.add(forkL);

    const forkR = new THREE.Mesh(forkTubeGeo, this.matChrome);
    forkR.position.set(0, -0.35, -0.12);
    forkR.castShadow = true;
    forkGroup.add(forkR);

    // Triple clamp crowns
    const clampGeo = new THREE.BoxGeometry(0.09, 0.03, 0.32);
    const clampTop = new THREE.Mesh(clampGeo, this.matEngineAlloy);
    clampTop.position.set(0, 0.06, 0);
    forkGroup.add(clampTop);

    const clampBottom = new THREE.Mesh(clampGeo, this.matEngineAlloy);
    clampBottom.position.set(0, -0.14, 0);
    forkGroup.add(clampBottom);

    // Tracker Handlebars
    const barGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.72, 16);
    const bar = new THREE.Mesh(barGeo, this.matChassis);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(-0.02, 0.16, 0);
    forkGroup.add(bar);

    // Bar-end mirrors
    const mirrorGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.012, 16);
    const mirrorL = new THREE.Mesh(mirrorGeo, this.matChassis);
    mirrorL.rotation.x = Math.PI / 2;
    mirrorL.position.set(-0.02, 0.16, 0.40);
    forkGroup.add(mirrorL);

    const mirrorR = new THREE.Mesh(mirrorGeo, this.matChassis);
    mirrorR.rotation.x = Math.PI / 2;
    mirrorR.position.set(-0.02, 0.16, -0.40);
    forkGroup.add(mirrorR);

    // Round Classic Headlamp
    const lampBucketGeo = new THREE.SphereGeometry(0.11, 18, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const lampBucket = new THREE.Mesh(lampBucketGeo, this.matChassis);
    lampBucket.rotation.x = -Math.PI / 2;
    lampBucket.position.set(0.12, -0.04, 0);
    forkGroup.add(lampBucket);

    const lampLensGeo = new THREE.CircleGeometry(0.108, 20);
    const lampLens = new THREE.Mesh(lampLensGeo, this.matGlass);
    lampLens.position.set(0.12, -0.04, 0.005);
    forkGroup.add(lampLens);

    // Subtle internal headlamp glow
    const headlampLight = new THREE.PointLight(0xffeedd, 1.4, 4);
    headlampLight.position.set(0.3, -0.04, 0);
    forkGroup.add(headlampLight);

    root.add(forkGroup);

    // --- 8. REAR TWIN DAMPERS ---
    const shockL = this.createShockAbsorber();
    shockL.position.set(-0.35, 0.62, 0.14);
    shockL.rotation.z = Math.PI / 4.8;
    root.add(shockL);

    const shockR = this.createShockAbsorber();
    shockR.position.set(-0.35, 0.62, -0.14);
    shockR.rotation.z = Math.PI / 4.8;
    root.add(shockR);
  }

  createSpokedWheel(radius, thickness, isFront) {
    const wheelGroup = new THREE.Group();

    // Knobby Dual-Sport Tire
    const tireGeo = new THREE.TorusGeometry(radius, thickness * 0.52, 16, 36);
    const tire = new THREE.Mesh(tireGeo, this.matRubber);
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Heavy Spoke Rim
    const rimGeo = new THREE.TorusGeometry(radius * 0.9, 0.022, 12, 36);
    const rim = new THREE.Mesh(rimGeo, this.matChrome);
    wheelGroup.add(rim);

    // Wheel Hub
    const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, thickness * 0.8, 18);
    const hub = new THREE.Mesh(hubGeo, this.matEngineAlloy);
    hub.rotation.x = Math.PI / 2;
    wheelGroup.add(hub);

    // Spokes Lacing
    const spokeCount = 28;
    const spokeGeo = new THREE.CylinderGeometry(0.003, 0.003, radius * 0.88, 6);
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const spoke = new THREE.Mesh(spokeGeo, this.matChrome);
      spoke.position.set(Math.cos(angle) * radius * 0.44, Math.sin(angle) * radius * 0.44, 0);
      spoke.rotation.z = angle + Math.PI / 2 + (i % 2 === 0 ? 0.2 : -0.2);
      wheelGroup.add(spoke);
    }

    // Drilled Brake Disc
    const discGeo = new THREE.RingGeometry(0.10, radius * 0.58, 24);
    const disc = new THREE.Mesh(discGeo, this.matChrome);
    disc.position.z = thickness * 0.45;
    wheelGroup.add(disc);

    // Gold Caliper
    const caliperGeo = new THREE.BoxGeometry(0.08, 0.12, 0.05);
    const caliper = new THREE.Mesh(caliperGeo, this.matBronze);
    caliper.position.set(radius * 0.48, 0.12, thickness * 0.45);
    wheelGroup.add(caliper);

    return wheelGroup;
  }

  createShockAbsorber() {
    const shockGroup = new THREE.Group();
    // Inner Damper Rod
    const rodGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.42, 12);
    const rod = new THREE.Mesh(rodGeo, this.matChrome);
    shockGroup.add(rod);

    // Bronze Coil Spring
    const coilCurve = new THREE.TorusGeometry(0.038, 0.008, 8, 24, Math.PI * 6);
    const coil = new THREE.Mesh(coilCurve, this.matBronze);
    coil.scale.set(1, 1, 3.5);
    coil.rotation.x = Math.PI / 2;
    shockGroup.add(coil);

    return shockGroup;
  }

  updateModelPlacement() {
    if (!this.motorcycleGroup) return;
    const isMobile = window.innerWidth < 992;
    if (isMobile) {
      this.motorcycleGroup.position.set(0.1, -0.42, -0.3);
      this.motorcycleGroup.scale.set(0.82, 0.82, 0.82);
      if (this.cameraBasePos) {
        this.cameraBasePos.x = 0.1;
        this.cameraBasePos.z = 5.2;
        this.cameraTarget.set(0.1, 0.4, 0);
      }
    } else {
      this.motorcycleGroup.position.set(1.45, -0.42, 0);
      this.motorcycleGroup.scale.set(1, 1, 1);
      if (this.cameraBasePos) {
        this.cameraBasePos.x = 1.35;
        this.cameraBasePos.z = 4.7;
        this.cameraTarget.set(1.15, 0.42, 0);
      }
    }
    if (this.contactShadow) {
      this.contactShadow.position.x = this.motorcycleGroup.position.x;
    }
  }

  setupGround() {
    // Dark Circular Studio Floor Grid that blends seamlessly with canvas
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0d0c,
      metalness: 0.9,
      roughness: 0.85
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.42;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Soft Radial Contact Shadow below motorcycle
    const shadowGeo = new THREE.PlaneGeometry(3.6, 1.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.85
    });
    this.contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.set(1.45, -0.418, 0);
    this.scene.add(this.contactShadow);
  }

  setupDustParticles() {
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = Math.random() * 4;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xa98252,
      size: 0.028,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  bindEvents() {
    // Pointer Parallax
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // Scroll Reaction
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroHeight = this.container.clientHeight || window.innerHeight;
      this.scrollProgress = Math.min(scrollY / heroHeight, 1.5);
    }, { passive: true });

    // Resize Handler
    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.updateModelPlacement();
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.isInitialized) return;

    // Smooth inertia interpolation for mouse parallax
    const lerpFactor = 0.045;
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * lerpFactor;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * lerpFactor;

    // Camera Parallax & Scroll Choreography
    if (!this.prefersReducedMotion) {
      // Gentle orbit offset based on mouse
      this.camera.position.x = this.cameraBasePos.x + this.mouse.x * 0.35 + (this.scrollProgress * 0.5);
      this.camera.position.y = this.cameraBasePos.y - this.mouse.y * 0.22 - (this.scrollProgress * 0.25);
      this.camera.position.z = this.cameraBasePos.z + (this.scrollProgress * 0.8);

      // Model gentle reactive rotation
      if (this.motorcycleGroup) {
        this.motorcycleGroup.rotation.y = -0.38 + (this.mouse.x * 0.12) - (this.scrollProgress * 0.45);
        this.motorcycleGroup.rotation.z = this.mouse.y * 0.025;
      }

      // Floating dust particles animation
      if (this.particles) {
        this.particles.rotation.y += 0.0008;
      }
    }

    this.camera.lookAt(this.cameraTarget);
    this.renderer.render(this.scene, this.camera);
  }
}

// Auto-initialize when Three.js is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (typeof THREE !== 'undefined') {
    window.hero3D = new Hero3DExperience('hero-3d-stage');
  } else {
    // Three.js not loaded, activate fallback
    const fallback = document.querySelector('.hero-fallback-bg');
    if (fallback) fallback.style.opacity = '1';
  }
});
