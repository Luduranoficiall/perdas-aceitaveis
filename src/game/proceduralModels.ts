/**
 * Procedural 3D Geometry and Model Generator for Perdas Aceitáveis
 * Builds composite multi-part characters, WW1 trench fortifications, craters,
 * barbed wire, duckboards, and sandbags without external asset dependencies.
 */

import * as THREE from 'three';

// Shared materials with physical PBR calibration
export interface TrenchMaterials {
  mudGround: THREE.MeshStandardMaterial;
  trenchWood: THREE.MeshStandardMaterial;
  sandbag: THREE.MeshStandardMaterial;
  craterWater: THREE.MeshStandardMaterial;
  barbedWire: THREE.MeshStandardMaterial;
  charredWood: THREE.MeshStandardMaterial;
  alliedUniform: THREE.MeshStandardMaterial;
  alliedHelmet: THREE.MeshStandardMaterial;
  enemyUniform: THREE.MeshStandardMaterial;
  enemyHelmet: THREE.MeshStandardMaterial;
  enemyArmor: THREE.MeshStandardMaterial;
  flesh: THREE.MeshStandardMaterial;
  weaponWood: THREE.MeshStandardMaterial;
  weaponSteel: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  selectionRing: THREE.MeshBasicMaterial;
  targetRing: THREE.MeshBasicMaterial;
  mortarBlastArea: THREE.MeshBasicMaterial;
}

/**
 * Creates procedural materials with canvas micro-relief noise maps
 */
export function createTrenchMaterials(): TrenchMaterials {
  // 1. Procedural Mud Texture
  const mudCanvas = document.createElement('canvas');
  mudCanvas.width = 256;
  mudCanvas.height = 256;
  const mudCtx = mudCanvas.getContext('2d')!;
  mudCtx.fillStyle = '#2b231c';
  mudCtx.fillRect(0, 0, 256, 256);
  // Add mud clumps and ruts
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const radius = 2 + Math.random() * 8;
    const shade = Math.floor(25 + Math.random() * 35);
    mudCtx.fillStyle = `rgb(${shade + 10}, ${shade}, ${shade - 8})`;
    mudCtx.beginPath();
    mudCtx.arc(x, y, radius, 0, Math.PI * 2);
    mudCtx.fill();
  }
  const mudTexture = new THREE.CanvasTexture(mudCanvas);
  mudTexture.wrapS = THREE.RepeatWrapping;
  mudTexture.wrapT = THREE.RepeatWrapping;
  mudTexture.repeat.set(16, 16);
  mudTexture.colorSpace = THREE.SRGBColorSpace;

  // 2. Procedural Wood Grain Texture for Duckboards
  const woodCanvas = document.createElement('canvas');
  woodCanvas.width = 128;
  woodCanvas.height = 128;
  const woodCtx = woodCanvas.getContext('2d')!;
  woodCtx.fillStyle = '#4a3828';
  woodCtx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 4) {
    woodCtx.fillStyle = (y % 8 === 0) ? '#382a1e' : '#57422f';
    woodCtx.fillRect(0, y, 128, 2);
  }
  const woodTexture = new THREE.CanvasTexture(woodCanvas);
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.colorSpace = THREE.SRGBColorSpace;

  // 3. Sandbag burlap texture
  const burlapCanvas = document.createElement('canvas');
  burlapCanvas.width = 64;
  burlapCanvas.height = 64;
  const bCtx = burlapCanvas.getContext('2d')!;
  bCtx.fillStyle = '#7a6f58';
  bCtx.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 200; i++) {
    bCtx.fillStyle = Math.random() > 0.5 ? '#615844' : '#8c8065';
    bCtx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
  }
  const burlapTexture = new THREE.CanvasTexture(burlapCanvas);
  burlapTexture.wrapS = THREE.RepeatWrapping;
  burlapTexture.wrapT = THREE.RepeatWrapping;
  burlapTexture.colorSpace = THREE.SRGBColorSpace;

  return {
    mudGround: new THREE.MeshStandardMaterial({
      map: mudTexture,
      roughness: 0.92,
      metalness: 0.12,
    }),
    trenchWood: new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.82,
      metalness: 0.05,
    }),
    sandbag: new THREE.MeshStandardMaterial({
      map: burlapTexture,
      roughness: 0.95,
      metalness: 0.02,
    }),
    craterWater: new THREE.MeshStandardMaterial({
      color: 0x1f231f,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    }),
    barbedWire: new THREE.MeshStandardMaterial({
      color: 0x4a4f55,
      roughness: 0.45,
      metalness: 0.85,
    }),
    charredWood: new THREE.MeshStandardMaterial({
      color: 0x1a1817,
      roughness: 0.95,
      metalness: 0.05,
    }),
    alliedUniform: new THREE.MeshStandardMaterial({
      color: 0x5c533c, // Khaki tunic
      roughness: 0.85,
      metalness: 0.08,
    }),
    alliedHelmet: new THREE.MeshStandardMaterial({
      color: 0x4f4939, // British Brodie steel helmet
      roughness: 0.38,
      metalness: 0.72,
    }),
    enemyUniform: new THREE.MeshStandardMaterial({
      color: 0x3d434a, // Feldgrau German uniform
      roughness: 0.85,
      metalness: 0.08,
    }),
    enemyHelmet: new THREE.MeshStandardMaterial({
      color: 0x363a40, // German Stahlhelm
      roughness: 0.35,
      metalness: 0.75,
    }),
    enemyArmor: new THREE.MeshStandardMaterial({
      color: 0x24282c, // Grabenpanzer body armor
      roughness: 0.4,
      metalness: 0.8,
    }),
    flesh: new THREE.MeshStandardMaterial({
      color: 0xc89d7c,
      roughness: 0.7,
      metalness: 0.02,
    }),
    weaponWood: new THREE.MeshStandardMaterial({
      color: 0x442817,
      roughness: 0.65,
      metalness: 0.05,
    }),
    weaponSteel: new THREE.MeshStandardMaterial({
      color: 0x222428,
      roughness: 0.25,
      metalness: 0.9,
    }),
    contactShadow: new THREE.MeshBasicMaterial({
      color: 0x070605,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
    selectionRing: new THREE.MeshBasicMaterial({
      color: 0xd4af37, // Brass gold
      transparent: true,
      opacity: 0.8,
      wireframe: true,
      depthWrite: false,
    }),
    targetRing: new THREE.MeshBasicMaterial({
      color: 0xe04434, // Crimson telegraph ring
      transparent: true,
      opacity: 0.75,
      wireframe: true,
      depthWrite: false,
    }),
    mortarBlastArea: new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
      depthWrite: false,
    }),
  };
}

/**
 * Creates a composite Allied Soldier (8 parts: Torso, Head, Brodie Helmet, Arms, Rifle with bayonet, Legs, Contact Shadow)
 */
export function createAlliedSoldierModel(
  materials: TrenchMaterials,
  role: 'corporal' | 'rifleman' | 'gunner' | 'medic'
): THREE.Group {
  const group = new THREE.Group();

  // 1. Torso (khaki tunic + webbing)
  const torsoGeo = new THREE.BoxGeometry(0.36, 0.48, 0.24);
  const torso = new THREE.Mesh(torsoGeo, materials.alliedUniform);
  torso.position.y = 0.54;
  torso.castShadow = true;
  group.add(torso);

  // Cross straps / webbing belt
  const strapGeo = new THREE.BoxGeometry(0.38, 0.06, 0.26);
  const strapMat = new THREE.MeshStandardMaterial({ color: 0x73684a, roughness: 0.9 });
  const belt = new THREE.Mesh(strapGeo, strapMat);
  belt.position.y = 0.36;
  group.add(belt);

  // 2. Head
  const headGeo = new THREE.BoxGeometry(0.2, 0.22, 0.2);
  const head = new THREE.Mesh(headGeo, materials.flesh);
  head.position.y = 0.86;
  head.castShadow = true;
  group.add(head);

  // 3. British Brodie Helmet (dish shape)
  const helmetBrimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 12);
  const helmetDomeGeo = new THREE.SphereGeometry(0.14, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const helmetGroup = new THREE.Group();
  const brim = new THREE.Mesh(helmetBrimGeo, materials.alliedHelmet);
  brim.position.y = 0.94;
  const dome = new THREE.Mesh(helmetDomeGeo, materials.alliedHelmet);
  dome.position.y = 0.94;
  helmetGroup.add(brim);
  helmetGroup.add(dome);
  helmetGroup.castShadow = true;
  group.add(helmetGroup);

  // 4. Arms
  const armGeo = new THREE.BoxGeometry(0.1, 0.36, 0.1);
  const leftArm = new THREE.Mesh(armGeo, materials.alliedUniform);
  leftArm.position.set(-0.24, 0.52, 0.04);
  leftArm.rotation.x = 0.35;
  const rightArm = new THREE.Mesh(armGeo, materials.alliedUniform);
  rightArm.position.set(0.24, 0.52, 0.12);
  rightArm.rotation.x = -0.6;
  group.add(leftArm);
  group.add(rightArm);

  // 5. Legs
  const legGeo = new THREE.BoxGeometry(0.12, 0.42, 0.12);
  const leftLeg = new THREE.Mesh(legGeo, materials.alliedUniform);
  leftLeg.position.set(-0.11, 0.21, 0);
  const rightLeg = new THREE.Mesh(legGeo, materials.alliedUniform);
  rightLeg.position.set(0.11, 0.21, 0);
  group.add(leftLeg);
  group.add(rightLeg);

  // 6. Weapon
  const weaponGroup = new THREE.Group();
  if (role === 'gunner') {
    // Lewis Gun with circular pan magazine
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8), materials.weaponSteel);
    barrel.rotation.x = Math.PI * 0.5;
    barrel.position.set(0.12, 0.52, 0.35);
    const mag = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 12), materials.weaponSteel);
    mag.position.set(0.12, 0.58, 0.28);
    weaponGroup.add(barrel);
    weaponGroup.add(mag);
  } else if (role === 'medic') {
    // Red Cross satchel / pouch
    const satchelGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
    const redCrossMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.7 });
    const satchel = new THREE.Mesh(satchelGeo, redCrossMat);
    satchel.position.set(-0.25, 0.38, 0);
    // Red cross emblem
    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: 0xcc2222 }));
    crossBar.position.set(-0.25, 0.38, 0.06);
    const crossBarH = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.02), new THREE.MeshBasicMaterial({ color: 0xcc2222 }));
    crossBarH.position.set(-0.25, 0.38, 0.06);
    weaponGroup.add(satchel);
    weaponGroup.add(crossBar);
    weaponGroup.add(crossBarH);
  } else {
    // Lee-Enfield Mk III Rifle with bayonet
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.65), materials.weaponWood);
    stock.position.set(0.12, 0.52, 0.28);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.75, 6), materials.weaponSteel);
    barrel.rotation.x = Math.PI * 0.5;
    barrel.position.set(0.12, 0.54, 0.34);
    // Bayonet blade
    const bayonet = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, 0.18), materials.weaponSteel);
    bayonet.position.set(0.12, 0.54, 0.75);
    weaponGroup.add(stock);
    weaponGroup.add(barrel);
    weaponGroup.add(bayonet);
  }
  weaponGroup.castShadow = true;
  group.add(weaponGroup);

  // 7. Grounded Contact Shadow Disc
  const shadowGeo = new THREE.CircleGeometry(0.34, 12);
  const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadow.rotation.x = -Math.PI * 0.5;
  shadow.position.y = 0.015;
  group.add(shadow);

  // 8. Selection Ring (hidden until selected)
  const ringGeo = new THREE.RingGeometry(0.38, 0.44, 16);
  const ring = new THREE.Mesh(ringGeo, materials.selectionRing);
  ring.name = 'selectionRing';
  ring.rotation.x = -Math.PI * 0.5;
  ring.position.y = 0.02;
  ring.visible = false;
  group.add(ring);

  group.scale.set(1.1, 1.1, 1.1);
  return group;
}

/**
 * Creates a composite German Enemy model (Sturmtrupp, Conscript, Flamethrower, or Sniper)
 */
export function createEnemyModel(
  materials: TrenchMaterials,
  type: 'conscript' | 'sturmtrupp' | 'flamethrower' | 'sniper'
): THREE.Group {
  const group = new THREE.Group();

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.36, 0.48, 0.24);
  const torsoMat = type === 'flamethrower' ? materials.enemyArmor : materials.enemyUniform;
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 0.54;
  torso.castShadow = true;
  group.add(torso);

  // German Stahlhelm (distinct curved rim + dome)
  const stahlhelmGroup = new THREE.Group();
  const domeGeo = new THREE.SphereGeometry(0.15, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const dome = new THREE.Mesh(domeGeo, materials.enemyHelmet);
  dome.position.y = 0.92;
  const brimGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.05, 8);
  const brim = new THREE.Mesh(brimGeo, materials.enemyHelmet);
  brim.position.set(0, 0.88, 0.02);
  brim.rotation.x = 0.15;
  stahlhelmGroup.add(dome);
  stahlhelmGroup.add(brim);
  group.add(stahlhelmGroup);

  // Head
  const headGeo = new THREE.BoxGeometry(0.2, 0.22, 0.2);
  const head = new THREE.Mesh(headGeo, materials.flesh);
  head.position.y = 0.86;
  group.add(head);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.12, 0.42, 0.12);
  const leftLeg = new THREE.Mesh(legGeo, materials.enemyUniform);
  leftLeg.position.set(-0.11, 0.21, 0);
  const rightLeg = new THREE.Mesh(legGeo, materials.enemyUniform);
  rightLeg.position.set(0.11, 0.21, 0);
  group.add(leftLeg);
  group.add(rightLeg);

  // Specialized Gear based on archetype
  if (type === 'flamethrower') {
    // Twin fuel canisters on back
    const tankGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.42, 8);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x6e261f, roughness: 0.4, metalness: 0.7 });
    const tank1 = new THREE.Mesh(tankGeo, tankMat);
    tank1.position.set(-0.1, 0.55, -0.2);
    const tank2 = new THREE.Mesh(tankGeo, tankMat);
    tank2.position.set(0.1, 0.55, -0.2);
    group.add(tank1);
    group.add(tank2);

    // Lance nozzle
    const lance = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), materials.weaponSteel);
    lance.rotation.x = Math.PI * 0.45;
    lance.position.set(0.15, 0.5, 0.35);
    group.add(lance);
  } else if (type === 'sturmtrupp') {
    // Stick grenade (Stielhandgranate) on belt + aggressive stance
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6), materials.weaponWood);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), materials.weaponSteel);
    stick.position.set(0.2, 0.4, -0.05);
    can.position.set(0.2, 0.48, -0.05);
    group.add(stick);
    group.add(can);

    // Carbine
    const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.5), materials.weaponWood);
    rifle.position.set(0.12, 0.5, 0.25);
    group.add(rifle);
  } else if (type === 'sniper') {
    // Long rifle with scope cylinder
    const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.75), materials.weaponWood);
    rifle.position.set(0.12, 0.52, 0.32);
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), materials.weaponSteel);
    scope.rotation.x = Math.PI * 0.5;
    scope.position.set(0.12, 0.57, 0.3);
    group.add(rifle);
    group.add(scope);
  } else {
    // Conscript basic rifle
    const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.6), materials.weaponWood);
    rifle.position.set(0.12, 0.5, 0.28);
    group.add(rifle);
  }

  // Telegraph ring (for attack windups)
  const telegraphRing = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.48, 16), materials.targetRing);
  telegraphRing.name = 'telegraphRing';
  telegraphRing.rotation.x = -Math.PI * 0.5;
  telegraphRing.position.y = 0.02;
  telegraphRing.visible = false;
  group.add(telegraphRing);

  // Grounded Contact Shadow Disc
  const shadowGeo = new THREE.CircleGeometry(0.34, 12);
  const shadow = new THREE.Mesh(shadowGeo, materials.contactShadow);
  shadow.rotation.x = -Math.PI * 0.5;
  shadow.position.y = 0.015;
  group.add(shadow);

  group.scale.set(1.1, 1.1, 1.1);
  return group;
}

/**
 * Creates procedural WW1 trench terrain with duckboards, revetment walls,
 * sandbags, barbed wire posts, and shell craters.
 */
export function createTrenchBattlefield(materials: TrenchMaterials): THREE.Group {
  const worldGroup = new THREE.Group();

  // 1. Mud Terrain Surface with trench depression
  // Main ground plane
  const groundGeo = new THREE.PlaneGeometry(64, 48, 32, 24);
  const ground = new THREE.Mesh(groundGeo, materials.mudGround);
  ground.rotation.x = -Math.PI * 0.5;
  ground.receiveShadow = true;
  worldGroup.add(ground);

  // 2. Allied Trench System (Lowered wooden trench corridor from X: -16 to 16, Z: 6 to 10)
  // Duckboard planks on trench floor
  const plankGeo = new THREE.BoxGeometry(1.6, 0.05, 0.2);
  for (let x = -15; x <= 15; x += 0.3) {
    const plank = new THREE.Mesh(plankGeo, materials.trenchWood);
    plank.position.set(x, 0.026, 8.0 + (Math.sin(x * 0.3) * 0.4));
    plank.rotation.y = (Math.random() - 0.5) * 0.05;
    plank.receiveShadow = true;
    worldGroup.add(plank);
  }

  // Timber revetment trench back wall
  const revetmentGeo = new THREE.BoxGeometry(0.8, 0.6, 0.1);
  for (let x = -15; x <= 15; x += 0.8) {
    const revet = new THREE.Mesh(revetmentGeo, materials.trenchWood);
    revet.position.set(x, 0.3, 9.2);
    revet.castShadow = true;
    revet.receiveShadow = true;
    worldGroup.add(revet);
  }

  // 3. Sandbag Parapets (Stacked bags along Z: 6.8 defending against No Man's Land)
  const bagGeo = new THREE.BoxGeometry(0.48, 0.18, 0.28);
  for (let x = -15; x <= 15; x += 0.45) {
    // Bottom row
    const bag1 = new THREE.Mesh(bagGeo, materials.sandbag);
    bag1.position.set(x, 0.1, 6.9);
    bag1.rotation.y = (Math.random() - 0.5) * 0.15;
    bag1.castShadow = true;
    bag1.receiveShadow = true;
    worldGroup.add(bag1);

    // Top row staggered
    const bag2 = new THREE.Mesh(bagGeo, materials.sandbag);
    bag2.position.set(x + 0.22, 0.24, 6.9);
    bag2.rotation.y = (Math.random() - 0.5) * 0.15;
    bag2.castShadow = true;
    bag2.receiveShadow = true;
    worldGroup.add(bag2);
  }

  // 4. Shell Craters with muddy stagnant water pools in No Man's Land
  const craterPositions = [
    { x: -8, z: 2, r: 2.2 },
    { x: 4, z: -1, r: 2.8 },
    { x: -3, z: -6, r: 1.8 },
    { x: 9, z: 1, r: 2.4 },
    { x: -11, z: -10, r: 3.0 },
    { x: 6, z: -9, r: 2.6 },
  ];

  craterPositions.forEach((crater) => {
    // Rim berm
    const rimGeo = new THREE.TorusGeometry(crater.r, 0.35, 6, 16);
    const rim = new THREE.Mesh(rimGeo, materials.mudGround);
    rim.rotation.x = Math.PI * 0.5;
    rim.position.set(crater.x, 0.12, crater.z);
    rim.castShadow = true;
    rim.receiveShadow = true;
    worldGroup.add(rim);

    // Murky water pool in center
    const waterGeo = new THREE.CircleGeometry(crater.r * 0.75, 12);
    const water = new THREE.Mesh(waterGeo, materials.craterWater);
    water.rotation.x = -Math.PI * 0.5;
    water.position.set(crater.x, 0.022, crater.z);
    worldGroup.add(water);
  });

  // 5. Barbed Wire Spools and Wooden Pickets (Chevaux de frise)
  const stakeGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.1, 6);
  for (let x = -14; x <= 14; x += 2.2) {
    const stake1 = new THREE.Mesh(stakeGeo, materials.trenchWood);
    stake1.position.set(x, 0.55, 4.8);
    stake1.rotation.z = (Math.random() - 0.5) * 0.25;
    stake1.castShadow = true;
    worldGroup.add(stake1);

    // Twisted cross stake
    const stake2 = new THREE.Mesh(stakeGeo, materials.trenchWood);
    stake2.position.set(x + 0.1, 0.55, 4.8);
    stake2.rotation.x = 0.45;
    stake2.castShadow = true;
    worldGroup.add(stake2);

    // Barbed wire rings connecting stakes
    const wireGeo = new THREE.TorusGeometry(0.4, 0.015, 4, 12);
    const wire = new THREE.Mesh(wireGeo, materials.barbedWire);
    wire.position.set(x + 1.1, 0.45, 4.8);
    wire.rotation.y = Math.PI * 0.5;
    worldGroup.add(wire);
  }

  // 6. Charred and Splintered Tree Trunks in No Man's Land
  const treePositions = [
    { x: -12, z: -4 },
    { x: -6, z: -12 },
    { x: 8, z: -7 },
    { x: 13, z: -3 },
    { x: 2, z: -14 },
  ];
  treePositions.forEach((pos) => {
    const treeGeo = new THREE.CylinderGeometry(0.12, 0.24, 2.8, 6);
    const tree = new THREE.Mesh(treeGeo, materials.charredWood);
    tree.position.set(pos.x, 1.4, pos.z);
    tree.rotation.z = (Math.random() - 0.5) * 0.2;
    tree.castShadow = true;
    tree.receiveShadow = true;
    worldGroup.add(tree);

    // Broken stump jagged branch
    const branchGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.9, 5);
    const branch = new THREE.Mesh(branchGeo, materials.charredWood);
    branch.position.set(pos.x + 0.2, 1.8, pos.z);
    branch.rotation.z = 0.7;
    worldGroup.add(branch);
  });

  // 7. Dugout command bunker entrance (Z: 10.5, X: -2)
  const bunkerRoof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 3.2), materials.sandbag);
  bunkerRoof.position.set(-2, 1.2, 11.5);
  bunkerRoof.castShadow = true;
  worldGroup.add(bunkerRoof);

  const beamGeo = new THREE.BoxGeometry(0.25, 1.2, 0.25);
  const beamL = new THREE.Mesh(beamGeo, materials.trenchWood);
  beamL.position.set(-3.8, 0.6, 10.2);
  const beamR = new THREE.Mesh(beamGeo, materials.trenchWood);
  beamR.position.set(-0.2, 0.6, 10.2);
  worldGroup.add(beamL);
  worldGroup.add(beamR);

  return worldGroup;
}
