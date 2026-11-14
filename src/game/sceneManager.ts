/**
 * Three.js 3D Scene, Simulation & Game Loop Engine for Perdas Aceitáveis
 * Incorporates Godot 4.8 Dev 6 features (SSCS, 3D Toolbar inspection, 60fps clamped sim,
 * hitstop, trauma camera shake, procedural particles, and tactical squad controls).
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Soldier,
  Enemy,
  ArtilleryStrike,
  BulletTracer,
  Particle,
  GameState,
  GodotEngineSettings,
} from './types';
import {
  createTrenchMaterials,
  createTrenchBattlefield,
  createAlliedSoldierModel,
  createEnemyModel,
  TrenchMaterials,
} from './proceduralModels';
import {
  getDayParameters,
  calculateHitProbability,
  calculateDamage,
  calculateArtilleryDamage,
  calculateMoraleDelta,
  getDifficultySettings,
  DifficultyLevel,
} from './combatRules';
import { soundManager } from '../audio/soundManager';

export interface SceneCallbacks {
  onSquadUpdate: (squad: Soldier[]) => void;
  onEnemiesCountUpdate: (remaining: number, total: number) => void;
  onDayComplete: (nextDay: number) => void;
  onGameOver: (victory: boolean) => void;
  onArtilleryCooldownUpdate: (ratio: number) => void;
  onIncomingMortarAlert?: (alert: boolean) => void;
}

export class TrenchSceneManager {
  private container: HTMLElement;
  private callbacks: SceneCallbacks;

  // Three.js core
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private materials!: TrenchMaterials;
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private pmremGenerator!: THREE.PMREMGenerator;

  // Animation & loop
  private frameId: number = 0;
  private lastTime: number = performance.now();
  private hitstopTimer: number = 0;
  private cameraTrauma: number = 0;
  private cameraBasePos: THREE.Vector3 = new THREE.Vector3(0, 16, 22);
  private cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 1, 4);

  // Game state & Difficulty
  private gameState: GameState = 'title';
  private difficulty: DifficultyLevel = 'medio';
  private currentDay: number = 1;
  private enemiesKilledThisDay: number = 0;
  private totalEnemiesThisDay: number = 6;
  private enemySpawnTimer: number = 0;
  private counterMortarTimer: number = 10;
  private artilleryCooldown: number = 0; // in seconds
  private artilleryMaxCooldown: number = 12; // 12 seconds
  private activeStrikes: ArtilleryStrike[] = [];
  private rainCount: number = 180;
  private rainGeometry!: THREE.BufferGeometry;
  private rainPoints!: THREE.Points;
  private isTrenchDucking: boolean = false;

  // Simulation Entities
  private squad: Soldier[] = [];
  private enemies: Enemy[] = [];
  private soldierMeshes: Map<string, THREE.Group> = new Map();
  private enemyMeshes: Map<string, THREE.Group> = new Map();
  private tracers: BulletTracer[] = [];
  private tracerMesh!: THREE.LineSegments;
  private particles: Particle[] = [];
  private particleMesh!: THREE.InstancedMesh;

  // Godot 4.8 Engine Settings
  private engineSettings: GodotEngineSettings = {
    sscsEnabled: true,
    sscsIntensity: 0.85,
    wireframe: false,
    directionalShadowBias: -0.0005,
    godotToolbarMode: 'select',
    showDevNotes: false,
  };

  // Raycasting & Controls
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mousePos: THREE.Vector2 = new THREE.Vector2();
  private groundPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private hoveredGroundPoint: THREE.Vector3 = new THREE.Vector3();
  private isPointerDown: boolean = false;
  private keysPressed: Set<string> = new Set();
  private artilleryTargetRing!: THREE.Mesh;
  private isArtilleryTargeting: boolean = false;

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.checkSoftwareGl();
    this.initRenderer();
    this.initScene();
    this.initLighting();
    this.initEnvironment();
    this.initBattlefield();
    this.initEntities();
    this.initParticles();
    this.initEventListeners();

    this.startLoop();
  }

  private checkSoftwareGl() {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) {
      this.isSoftwareGl = true;
      return;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x363d42); // Overcast Flanders sky
    this.scene.fog = new THREE.FogExp2(0x363d42, 0.022);

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      120
    );
    this.camera.position.set(0, 16, 22);
    this.camera.lookAt(0, 1, 4);
  }

  private initLighting() {
    // Warm key directional light (pale autumn sun breaking through smoke)
    this.dirLight = new THREE.DirectionalLight(0xffeed4, 1.4);
    this.dirLight.position.set(16, 28, 14);
    this.dirLight.castShadow = !this.isSoftwareGl;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 60;
    this.dirLight.shadow.camera.left = -22;
    this.dirLight.shadow.camera.right = 22;
    this.dirLight.shadow.camera.top = 22;
    this.dirLight.shadow.camera.bottom = -22;
    this.dirLight.shadow.bias = this.engineSettings.directionalShadowBias;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight);

    // Cool hemisphere fill (grey-blue sky vs muddy earth)
    this.hemiLight = new THREE.HemisphereLight(0x768894, 0x2e2722, 0.9);
    this.scene.add(this.hemiLight);
  }

  private initEnvironment() {
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.pmremGenerator.dispose();
  }

  private initBattlefield() {
    this.materials = createTrenchMaterials();
    const terrain = createTrenchBattlefield(this.materials);
    this.scene.add(terrain);

    // Artillery target telegraph ring
    const ringGeo = new THREE.RingGeometry(2.8, 3.1, 24);
    this.artilleryTargetRing = new THREE.Mesh(ringGeo, this.materials.mortarBlastArea);
    this.artilleryTargetRing.rotation.x = -Math.PI * 0.5;
    this.artilleryTargetRing.position.y = 0.03;
    this.artilleryTargetRing.visible = false;
    this.scene.add(this.artilleryTargetRing);

    // Rain particles
    const rainPositions = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 50;
      rainPositions[i * 3 + 1] = Math.random() * 20;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    this.rainGeometry = new THREE.BufferGeometry();
    this.rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x8fa4b3,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
    });
    this.rainPoints = new THREE.Points(this.rainGeometry, rainMat);
    this.scene.add(this.rainPoints);
  }

  private initEntities() {
    // 4 Allied Soldiers in Trench
    this.squad = [
      {
        id: 's1',
        name: 'Arthur Price',
        rank: 'Cabo',
        role: 'corporal',
        x: -4.5,
        z: 7.2,
        targetX: -4.5,
        targetZ: 7.2,
        hp: 100,
        maxHp: 100,
        morale: 95,
        ammo: 40,
        maxAmmo: 50,
        inCover: true,
        isDucking: false,
        selected: true,
        isDead: false,
        isAttacking: false,
        attackCooldown: 0,
        suppression: 0,
        medicCooldown: 0,
        bayonetChargeCooldown: 0,
      },
      {
        id: 's2',
        name: 'Thomas Miller',
        rank: 'Soldado',
        role: 'rifleman',
        x: -1.5,
        z: 7.2,
        targetX: -1.5,
        targetZ: 7.2,
        hp: 85,
        maxHp: 85,
        morale: 90,
        ammo: 45,
        maxAmmo: 50,
        inCover: true,
        isDucking: false,
        selected: false,
        isDead: false,
        isAttacking: false,
        attackCooldown: 0,
        suppression: 0,
        medicCooldown: 0,
        bayonetChargeCooldown: 0,
      },
      {
        id: 's3',
        name: 'Edward Vance',
        rank: 'Atirador',
        role: 'gunner',
        x: 2.0,
        z: 7.2,
        targetX: 2.0,
        targetZ: 7.2,
        hp: 90,
        maxHp: 90,
        morale: 88,
        ammo: 120,
        maxAmmo: 150,
        inCover: true,
        isDucking: false,
        selected: false,
        isDead: false,
        isAttacking: false,
        attackCooldown: 0,
        suppression: 0,
        medicCooldown: 0,
        bayonetChargeCooldown: 0,
      },
      {
        id: 's4',
        name: 'George Bailey',
        rank: 'Paramédico',
        role: 'medic',
        x: 5.0,
        z: 7.4,
        targetX: 5.0,
        targetZ: 7.4,
        hp: 80,
        maxHp: 80,
        morale: 92,
        ammo: 25,
        maxAmmo: 30,
        inCover: true,
        isDucking: false,
        selected: false,
        isDead: false,
        isAttacking: false,
        attackCooldown: 0,
        suppression: 0,
        medicCooldown: 0,
        bayonetChargeCooldown: 0,
      },
    ];

    // Build soldier 3D models
    this.squad.forEach((soldier) => {
      const model = createAlliedSoldierModel(this.materials, soldier.role);
      model.position.set(soldier.x, 0, soldier.z);
      this.scene.add(model);
      this.soldierMeshes.set(soldier.id, model);

      // Highlight selected
      const ring = model.getObjectByName('selectionRing');
      if (ring) ring.visible = soldier.selected;
    });

    this.callbacks.onSquadUpdate([...this.squad]);
    this.setupDay(1);
  }

  private initParticles() {
    // Instanced mesh for pooled particles (sparks, smoke, dirt)
    const particleGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, 250);
    this.particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.particleMesh);

    // Tracers line segment
    const tracerGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(60 * 6);
    tracerGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const tracerMat = new THREE.LineBasicMaterial({ color: 0xffdd66, linewidth: 2 });
    this.tracerMesh = new THREE.LineSegments(tracerGeo, tracerMat);
    this.scene.add(this.tracerMesh);
  }

  private initEventListeners() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);

    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: true });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.gameState === 'title' && (e.code === 'Enter' || e.code === 'Space')) {
      this.setGameState('playing');
      return;
    }

    this.keysPressed.add(e.code);

    // Number keys 1-4 for selecting squad members
    if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
      const idx = parseInt(e.code.replace('Digit', '')) - 1;
      this.selectSoldierByIndex(idx);
    }

    // Space for Artillery strike targeting
    if (e.code === 'Space' && this.gameState === 'playing') {
      this.toggleArtilleryTargeting();
    }

    // Key 'R' for Medic first aid heal
    if (e.code === 'KeyR' && this.gameState === 'playing') {
      this.orderMedicHeal();
    }

    // Key 'C' for Trench Ducking / Taking Cover
    if (e.code === 'KeyC' && this.gameState === 'playing') {
      this.toggleTrenchDuck();
    }

    // Key 'M' for Mute audio
    if (e.code === 'KeyM') {
      soundManager.toggleMute();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysPressed.delete(e.code);
  };

  private onBlur = () => {
    this.keysPressed.clear();
    this.isPointerDown = false;
  };

  private onPointerDown = (e: PointerEvent) => {
    this.isPointerDown = true;
    this.updateMouseCoords(e);

    if (this.gameState !== 'playing') return;

    if (this.isArtilleryTargeting) {
      // Confirm artillery strike location
      this.callArtilleryAt(this.hoveredGroundPoint.x, this.hoveredGroundPoint.z);
      this.isArtilleryTargeting = false;
      this.artilleryTargetRing.visible = false;
      return;
    }

    // Raycast against soldiers or ground
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersects = this.raycaster.intersectObjects(Array.from(this.soldierMeshes.values()), true);

    if (intersects.length > 0) {
      // Find top group
      let hitGroup: THREE.Object3D | null = intersects[0].object;
      while (hitGroup && hitGroup.parent !== this.scene) {
        hitGroup = hitGroup.parent;
      }
      if (hitGroup) {
        for (const [id, grp] of this.soldierMeshes.entries()) {
          if (grp === hitGroup) {
            this.selectSoldierById(id);
            soundManager.playClick();
            return;
          }
        }
      }
    }

    // Right-click or ground click: Order selected soldier to move or aim
    const groundHit = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.groundPlane, groundHit)) {
      const sel = this.squad.find((s) => s.selected && !s.isDead);
      if (sel) {
        // Clamp movement inside trench zone
        sel.targetX = Math.max(-14, Math.min(14, groundHit.x));
        sel.targetZ = Math.max(6.2, Math.min(9.0, groundHit.z));
        sel.inCover = sel.targetZ <= 7.5;
        soundManager.playClick();
      }
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    this.updateMouseCoords(e);
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    this.raycaster.ray.intersectPlane(this.groundPlane, this.hoveredGroundPoint);

    if (this.isArtilleryTargeting) {
      this.artilleryTargetRing.position.x = this.hoveredGroundPoint.x;
      this.artilleryTargetRing.position.z = this.hoveredGroundPoint.z;
    }
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    if (this.gameState !== 'playing') return;
    const zoomDelta = e.deltaY * 0.015;
    this.cameraBasePos.y = Math.max(8, Math.min(26, this.cameraBasePos.y + zoomDelta));
    this.cameraBasePos.z = Math.max(12, Math.min(32, this.cameraBasePos.z + zoomDelta * 1.2));
  };

  private updateMouseCoords(e: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  public selectSoldierByIndex(index: number) {
    if (index >= 0 && index < this.squad.length) {
      this.selectSoldierById(this.squad[index].id);
    }
  }

  public selectSoldierById(id: string) {
    this.squad.forEach((s) => {
      s.selected = s.id === id;
      const mesh = this.soldierMeshes.get(s.id);
      if (mesh) {
        const ring = mesh.getObjectByName('selectionRing');
        if (ring) ring.visible = s.selected && !s.isDead;
      }
    });
    this.callbacks.onSquadUpdate([...this.squad]);
  }

  public toggleArtilleryTargeting() {
    if (this.artilleryCooldown > 0) return;
    this.isArtilleryTargeting = !this.isArtilleryTargeting;
    this.artilleryTargetRing.visible = this.isArtilleryTargeting;
    soundManager.playClick();
  }

  public callArtilleryAt(x: number, z: number) {
    if (this.artilleryCooldown > 0) return;
    this.artilleryCooldown = this.artilleryMaxCooldown;
    soundManager.playTrenchWhistle();
    soundManager.playArtilleryStrike();

    this.activeStrikes.push({
      id: `art_${Date.now()}`,
      targetX: x,
      targetZ: z,
      delayTimer: 1.15,
      blastRadius: 5.5,
      maxDamage: 90,
      hasExploded: false,
    });

    // Add trauma
    this.cameraTrauma = Math.min(1.0, this.cameraTrauma + 0.5);
  }

  public orderMedicHeal() {
    const medic = this.squad.find((s) => s.role === 'medic' && !s.isDead);
    if (!medic || medic.medicCooldown > 0) return;

    // Heal all nearby wounded comrades
    let healedAny = false;
    this.squad.forEach((soldier) => {
      if (!soldier.isDead && soldier.hp < soldier.maxHp) {
        soldier.hp = Math.min(soldier.maxHp, soldier.hp + 35);
        soldier.morale = Math.min(100, soldier.morale + 20);
        healedAny = true;
      }
    });

    if (healedAny) {
      medic.medicCooldown = 8.0;
      soundManager.playMedicHeal();
      this.callbacks.onSquadUpdate([...this.squad]);
      // Spawn healing sparkles
      for (let i = 0; i < 20; i++) {
        this.spawnParticle(
          medic.x + (Math.random() - 0.5) * 2,
          1.0 + Math.random(),
          medic.z + (Math.random() - 0.5) * 2,
          'spark'
        );
      }
    }
  }

  public setDifficulty(diff: DifficultyLevel) {
    this.difficulty = diff;
    const diffSetting = getDifficultySettings(diff);
    this.artilleryMaxCooldown = Math.round(12 * diffSetting.artilleryCooldownMultiplier);

    // Apply starting ammo multiplier to squad
    this.squad.forEach((s) => {
      s.ammo = Math.min(s.maxAmmo, Math.round(s.maxAmmo * diffSetting.startingAmmoMultiplier));
    });
    this.callbacks.onSquadUpdate([...this.squad]);
  }

  public getDifficulty(): DifficultyLevel {
    return this.difficulty;
  }

  public toggleTrenchDuck(): boolean {
    this.isTrenchDucking = !this.isTrenchDucking;
    this.squad.forEach((soldier) => {
      if (!soldier.isDead) {
        soldier.isDucking = this.isTrenchDucking;
        const mesh = this.soldierMeshes.get(soldier.id);
        if (mesh) {
          // Crouch down or stand up
          mesh.scale.set(1.1, this.isTrenchDucking ? 0.7 : 1.1, 1.1);
          mesh.position.y = this.isTrenchDucking ? -0.12 : 0;
        }
      }
    });

    soundManager.playClick();
    this.callbacks.onSquadUpdate([...this.squad]);
    return this.isTrenchDucking;
  }

  public isDucking(): boolean {
    return this.isTrenchDucking;
  }

  public triggerEnemyMortarStrike(targetX: number, targetZ: number) {
    soundManager.playArtilleryStrike();
    if (this.callbacks.onIncomingMortarAlert) {
      this.callbacks.onIncomingMortarAlert(true);
      setTimeout(() => this.callbacks.onIncomingMortarAlert?.(false), 2200);
    }

    this.activeStrikes.push({
      id: `enemy_mortar_${Date.now()}`,
      targetX,
      targetZ,
      delayTimer: 1.8,
      blastRadius: 4.8,
      maxDamage: this.difficulty === 'hard_master' ? 70 : 50,
      hasExploded: false,
      isEnemyStrike: true,
    });
  }

  public orderVolleyFire() {
    this.squad.forEach((soldier) => {
      if (!soldier.isDead && soldier.ammo > 0) {
        soldier.attackCooldown = 0;
      }
    });
    soundManager.playTrenchWhistle();
  }

  public setupDay(day: number, diff?: DifficultyLevel) {
    if (diff) {
      this.difficulty = diff;
    }
    this.currentDay = Math.max(1, Math.min(20, day));
    const dayConfig = getDayParameters(this.currentDay, this.difficulty);
    const diffSetting = getDifficultySettings(this.difficulty);

    this.artilleryMaxCooldown = Math.round(12 * diffSetting.artilleryCooldownMultiplier);
    this.counterMortarTimer = (this.difficulty === 'hard_master' ? 8 : 14) + Math.random() * 6;
    this.enemiesKilledThisDay = 0;
    this.totalEnemiesThisDay = dayConfig.enemyCount;
    this.enemySpawnTimer = 1.5;

    // Reset ducking
    if (this.isTrenchDucking) {
      this.toggleTrenchDuck();
    }

    // Clean up old enemy meshes
    this.enemies.forEach((e) => {
      const mesh = this.enemyMeshes.get(e.id);
      if (mesh) this.scene.remove(mesh);
    });
    this.enemies = [];
    this.enemyMeshes.clear();

    // Adjust scene lighting and fog according to weather
    if (dayConfig.weather === 'night') {
      this.scene.background = new THREE.Color(0x0a0c10);
      this.scene.fog = new THREE.FogExp2(0x0a0c10, 0.035);
      this.dirLight.intensity = 0.3;
      this.hemiLight.intensity = 0.25;
    } else if (dayConfig.weather === 'dawn') {
      this.scene.background = new THREE.Color(0x4a3a35);
      this.scene.fog = new THREE.FogExp2(0x4a3a35, 0.02);
      this.dirLight.intensity = 1.3;
      this.dirLight.color.setHex(0xffaa77);
      this.hemiLight.intensity = 0.8;
    } else if (dayConfig.weather === 'fog') {
      this.scene.background = new THREE.Color(0x4e5458);
      this.scene.fog = new THREE.FogExp2(0x4e5458, 0.045);
      this.dirLight.intensity = 0.8;
      this.hemiLight.intensity = 0.6;
    } else {
      // Overcast / Rain
      this.scene.background = new THREE.Color(0x323a3e);
      this.scene.fog = new THREE.FogExp2(0x323a3e, 0.024);
      this.dirLight.intensity = 1.2;
      this.dirLight.color.setHex(0xffeed4);
      this.hemiLight.intensity = 0.75;
    }

    // Replenish some ammo and morale for surviving soldiers
    const ammoRefill = Math.round(20 * diffSetting.startingAmmoMultiplier);
    this.squad.forEach((s) => {
      if (!s.isDead) {
        s.ammo = Math.min(s.maxAmmo, s.ammo + ammoRefill);
        s.morale = Math.min(100, s.morale + 15);
      }
    });

    this.callbacks.onSquadUpdate([...this.squad]);
    this.callbacks.onEnemiesCountUpdate(this.totalEnemiesThisDay, this.totalEnemiesThisDay);
  }

  private spawnEnemy() {
    const dayConfig = getDayParameters(this.currentDay);
    let type: Enemy['type'] = 'conscript';
    const rand = Math.random();

    if (rand < dayConfig.flamethrowerProbability) {
      type = 'flamethrower';
    } else if (rand < dayConfig.flamethrowerProbability + dayConfig.sniperProbability) {
      type = 'sniper';
    } else if (rand < dayConfig.flamethrowerProbability + dayConfig.sniperProbability + dayConfig.sturmtruppProbability) {
      type = 'sturmtrupp';
    }

    let hp = 45;
    let speed = 1.2;
    let damage = 16;
    let attackRange = 14;

    if (type === 'sturmtrupp') {
      hp = 65;
      speed = 1.9;
      damage = 26;
      attackRange = 8;
    } else if (type === 'flamethrower') {
      hp = 110;
      speed = 0.85;
      damage = 38;
      attackRange = 6.5;
    } else if (type === 'sniper') {
      hp = 40;
      speed = 1.0;
      damage = 35;
      attackRange = 22;
    }

    const enemy: Enemy = {
      id: `e_${Date.now()}_${Math.random()}`,
      type,
      x: (Math.random() - 0.5) * 26,
      z: -18 - Math.random() * 4,
      hp,
      maxHp: hp,
      speed,
      damage,
      attackRange,
      attackCooldown: 1.5 + Math.random() * 2,
      windupTimer: 0,
      isWindingUp: false,
      isAttacking: false,
      isDead: false,
      suppression: 0,
    };

    const model = createEnemyModel(this.materials, type);
    model.position.set(enemy.x, 0, enemy.z);
    this.scene.add(model);
    this.enemyMeshes.set(enemy.id, model);
    this.enemies.push(enemy);
  }

  public setGameState(state: GameState) {
    this.gameState = state;
    document.body.dataset.state = state;

    if (state === 'playing') {
      // Focus game camera on trench
      this.cameraBasePos.set(0, 16, 22);
      this.cameraTarget.set(0, 1, 4);
    }
  }

  public updateEngineSettings(settings: Partial<GodotEngineSettings>) {
    this.engineSettings = { ...this.engineSettings, ...settings };

    // Apply SSCS (Screen-space contact shadow simulation)
    // When enabled in Godot 4.8 dev 6, contact shadows receive Bend Studios contact darkening
    if (this.engineSettings.sscsEnabled) {
      this.materials.contactShadow.opacity = 0.65 * this.engineSettings.sscsIntensity;
      this.dirLight.shadow.bias = -0.0008;
      this.dirLight.shadow.normalBias = 0.035;
    } else {
      this.materials.contactShadow.opacity = 0.15;
      this.dirLight.shadow.bias = -0.0001;
      this.dirLight.shadow.normalBias = 0.005;
    }

    // Wireframe toggle
    this.materials.mudGround.wireframe = this.engineSettings.wireframe;
    this.materials.trenchWood.wireframe = this.engineSettings.wireframe;
    this.materials.alliedUniform.wireframe = this.engineSettings.wireframe;
    this.materials.enemyUniform.wireframe = this.engineSettings.wireframe;
  }

  public getEngineSettings(): GodotEngineSettings {
    return this.engineSettings;
  }

  private startLoop() {
    const tick = (now: number) => {
      const rawDt = (now - this.lastTime) * 0.001;
      this.lastTime = now;
      const dt = Math.min(rawDt, 0.05); // Clamped delta time

      this.update(dt);
      this.render();

      this.frameId = requestAnimationFrame(tick);
    };

    this.frameId = requestAnimationFrame(tick);
  }

  private update(dt: number) {
    // 1. Camera Animation
    if (this.gameState === 'title') {
      // Atmospheric cinematic flyover on Title screen
      const time = performance.now() * 0.0003;
      this.camera.position.x = Math.sin(time) * 14;
      this.camera.position.z = 18 + Math.cos(time * 0.8) * 4;
      this.camera.position.y = 8 + Math.sin(time * 0.5) * 2;
      this.camera.lookAt(0, 1, 5);
      this.updateRain(dt);
      return;
    }

    if (this.gameState === 'paused' || this.gameState === 'gameover') {
      return;
    }

    // 2. Camera Controls during Gameplay (WASD pan)
    const panSpeed = 16 * dt;
    if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) {
      this.cameraBasePos.x -= panSpeed;
      this.cameraTarget.x -= panSpeed;
    }
    if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) {
      this.cameraBasePos.x += panSpeed;
      this.cameraTarget.x += panSpeed;
    }
    if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) {
      this.cameraBasePos.z -= panSpeed;
      this.cameraTarget.z -= panSpeed;
    }
    if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) {
      this.cameraBasePos.z += panSpeed;
      this.cameraTarget.z += panSpeed;
    }

    // Clamp camera to battlefield
    this.cameraBasePos.x = Math.max(-18, Math.min(18, this.cameraBasePos.x));
    this.cameraBasePos.z = Math.max(10, Math.min(28, this.cameraBasePos.z));
    this.cameraTarget.x = this.cameraBasePos.x;
    this.cameraTarget.z = this.cameraBasePos.z - 16;

    // Decay Trauma Camera Shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.cameraTrauma > 0) {
      this.cameraTrauma = Math.max(0, this.cameraTrauma - dt * 1.4);
      const shakePower = Math.pow(this.cameraTrauma, 2) * 0.8;
      shakeX = (Math.random() - 0.5) * shakePower;
      shakeY = (Math.random() - 0.5) * shakePower;
    }

    this.camera.position.set(
      this.cameraBasePos.x + shakeX,
      this.cameraBasePos.y + shakeY,
      this.cameraBasePos.z
    );
    this.camera.lookAt(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);

    // 3. Hitstop simulation timer check
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateParticles(dt);
      return;
    }

    // 4. Artillery cooldown & active strikes
    if (this.artilleryCooldown > 0) {
      this.artilleryCooldown = Math.max(0, this.artilleryCooldown - dt);
      this.callbacks.onArtilleryCooldownUpdate(1 - (this.artilleryCooldown / this.artilleryMaxCooldown));
    }

    for (let i = this.activeStrikes.length - 1; i >= 0; i--) {
      const strike = this.activeStrikes[i];
      strike.delayTimer -= dt;
      if (strike.delayTimer <= 0 && !strike.hasExploded) {
        strike.hasExploded = true;
        this.triggerArtilleryExplosion(strike);
        this.activeStrikes.splice(i, 1);
      }
    }

    const diffSetting = getDifficultySettings(this.difficulty);

    // Counter-battery mortar check (Difícil and Hard Master)
    if (diffSetting.counterBatteryMortars) {
      this.counterMortarTimer -= dt;
      if (this.counterMortarTimer <= 0) {
        this.counterMortarTimer = (this.difficulty === 'hard_master' ? 8 : 13) + Math.random() * 6;
        const targetX = (Math.random() - 0.5) * 20;
        const targetZ = 7.2;
        this.triggerEnemyMortarStrike(targetX, targetZ);
      }
    }

    // 5. Enemy Spawning
    const dayConfig = getDayParameters(this.currentDay, this.difficulty);
    const enemiesSpawnedSoFar = this.enemiesKilledThisDay + this.enemies.length;
    if (enemiesSpawnedSoFar < this.totalEnemiesThisDay) {
      this.enemySpawnTimer -= dt;
      if (this.enemySpawnTimer <= 0) {
        this.spawnEnemy();
        this.enemySpawnTimer = dayConfig.enemyWaveDelay * (0.8 + Math.random() * 0.4);
      }
    }

    // 6. Update Soldiers
    let anySoldierAlive = false;
    this.squad.forEach((soldier) => {
      if (soldier.isDead) return;
      anySoldierAlive = true;

      // Move toward target position
      const dx = soldier.targetX - soldier.x;
      const dz = soldier.targetZ - soldier.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 0.05) {
        const moveDist = Math.min(dist, 2.8 * dt);
        soldier.x += (dx / dist) * moveDist;
        soldier.z += (dz / dist) * moveDist;
      }

      // Decrement attack cooldown
      if (soldier.attackCooldown > 0) {
        soldier.attackCooldown -= dt;
      }

      // Decrement medic cooldown
      if (soldier.medicCooldown > 0) {
        soldier.medicCooldown -= dt;
      }

      // Auto-target nearest living enemy in range
      if (soldier.attackCooldown <= 0 && soldier.ammo > 0) {
        let nearestEnemy: Enemy | null = null;
        let minDist = 999;
        this.enemies.forEach((enemy) => {
          if (!enemy.isDead) {
            const edx = enemy.x - soldier.x;
            const edz = enemy.z - soldier.z;
            const edist = Math.sqrt(edx * edx + edz * edz);
            if (edist < minDist) {
              minDist = edist;
              nearestEnemy = enemy;
            }
          }
        });

        if (nearestEnemy && minDist < 24) {
          this.soldierFireAt(soldier, nearestEnemy);
        }
      }

      // Update 3D mesh position
      const mesh = this.soldierMeshes.get(soldier.id);
      if (mesh) {
        mesh.position.set(soldier.x, 0, soldier.z);
        // Turn to face forward toward No Man's Land
        mesh.rotation.y = 0;
      }
    });

    if (!anySoldierAlive) {
      this.setGameState('gameover');
      this.callbacks.onGameOver(false);
      return;
    }

    // 7. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.isDead) continue;

      // Find nearest living soldier
      let nearestSoldier: Soldier | null = null;
      let minDist = 999;
      this.squad.forEach((soldier) => {
        if (!soldier.isDead) {
          const sdx = soldier.x - enemy.x;
          const sdz = soldier.z - enemy.z;
          const sdist = Math.sqrt(sdx * sdx + sdz * sdz);
          if (sdist < minDist) {
            minDist = sdist;
            nearestSoldier = soldier;
          }
        }
      });

      if (!nearestSoldier) continue;

      // Advance toward trench parapet
      if (minDist > enemy.attackRange) {
        const edx = (nearestSoldier as Soldier).x - enemy.x;
        const edz = (nearestSoldier as Soldier).z - enemy.z;
        const dist = Math.sqrt(edx * edx + edz * edz);
        const actualSpeed = enemy.suppression > 0 ? enemy.speed * 0.45 : enemy.speed;
        enemy.x += (edx / dist) * actualSpeed * dt;
        enemy.z += (edz / dist) * actualSpeed * dt;
      }

      // Attack telegraph and firing
      if (enemy.attackCooldown > 0) {
        enemy.attackCooldown -= dt;
      }

      const mesh = this.enemyMeshes.get(enemy.id);
      const telegraph = mesh?.getObjectByName('telegraphRing');

      if (minDist <= enemy.attackRange && enemy.attackCooldown <= 0) {
        if (!enemy.isWindingUp) {
          // Begin attack windup telegraph
          enemy.isWindingUp = true;
          enemy.windupTimer = enemy.type === 'flamethrower' ? 0.75 : 0.45;
          if (telegraph) telegraph.visible = true;
        } else {
          enemy.windupTimer -= dt;
          if (enemy.windupTimer <= 0) {
            // Execute attack!
            this.enemyFireAt(enemy, nearestSoldier);
            enemy.isWindingUp = false;
            enemy.attackCooldown = 1.8 + Math.random() * 1.5;
            if (telegraph) telegraph.visible = false;
          }
        }
      }

      if (mesh) {
        mesh.position.set(enemy.x, 0, enemy.z);
        // Face toward trench
        const angle = Math.atan2((nearestSoldier as Soldier).x - enemy.x, (nearestSoldier as Soldier).z - enemy.z);
        mesh.rotation.y = angle;
      }

      // Check trench breach loss condition
      if (enemy.z >= 7.8) {
        // Enemy breached trench line
        (nearestSoldier as Soldier).hp -= 30;
        this.cameraTrauma = Math.min(1.0, this.cameraTrauma + 0.4);
        soundManager.playHitSound(false);
      }
    }

    // 8. Day Completion Check
    if (this.enemiesKilledThisDay >= this.totalEnemiesThisDay && this.enemies.length === 0) {
      if (this.currentDay >= 20) {
        this.setGameState('gameover');
        this.callbacks.onGameOver(true);
      } else {
        const nextDay = this.currentDay + 1;
        this.callbacks.onDayComplete(nextDay);
        this.setupDay(nextDay);
      }
    }

    this.updateRain(dt);
    this.updateParticles(dt);
    this.updateTracers(dt);
  }

  private soldierFireAt(soldier: Soldier, enemy: Enemy) {
    if (soldier.isDucking) return; // Can't shoot while ducking down in trench

    soldier.ammo -= (soldier.role === 'gunner' ? 3 : 1);
    soldier.attackCooldown = soldier.role === 'gunner' ? 0.28 : 1.1;

    if (soldier.role === 'gunner') {
      soundManager.playMachineGunBurst();
    } else {
      soundManager.playRifleShot(false);
    }

    const diffSetting = getDifficultySettings(this.difficulty);

    // Calculate hit probability and damage
    const dist = Math.hypot(enemy.x - soldier.x, enemy.z - soldier.z);
    const hitChance = calculateHitProbability(0.75, dist, 18, false, enemy.suppression > 0);
    const isHit = Math.random() < hitChance;

    // Add bullet tracer
    this.addTracer(soldier.x, 0.6, soldier.z, enemy.x, 0.6, enemy.z, false);

    if (isHit) {
      const dmg = calculateDamage(
        soldier.role === 'gunner' ? 22 : 36,
        false,
        Math.random() < 0.2,
        diffSetting.damageDealtMultiplier
      );
      enemy.hp -= dmg;
      enemy.suppression = 2.0;
      soundManager.playHitSound(true);

      // Hit sparks/blood particles
      for (let p = 0; p < 6; p++) {
        this.spawnParticle(enemy.x, 0.6, enemy.z, 'dirt');
      }

      if (enemy.hp <= 0 && !enemy.isDead) {
        enemy.isDead = true;
        this.enemiesKilledThisDay++;
        this.callbacks.onEnemiesCountUpdate(
          this.totalEnemiesThisDay - this.enemiesKilledThisDay,
          this.totalEnemiesThisDay
        );

        // Remove from scene after brief defeat topple
        const mesh = this.enemyMeshes.get(enemy.id);
        if (mesh) {
          mesh.rotation.x = Math.PI * 0.45;
          setTimeout(() => {
            this.scene.remove(mesh);
            const idx = this.enemies.indexOf(enemy);
            if (idx !== -1) this.enemies.splice(idx, 1);
          }, 350);
        }
      }
    }

    this.callbacks.onSquadUpdate([...this.squad]);
  }

  private enemyFireAt(enemy: Enemy, soldier: Soldier) {
    soundManager.playRifleShot(false);
    this.addTracer(enemy.x, 0.6, enemy.z, soldier.x, 0.6, soldier.z, true);

    const diffSetting = getDifficultySettings(this.difficulty);
    const dist = Math.hypot(soldier.x - enemy.x, soldier.z - enemy.z);
    const hitChance = calculateHitProbability(0.65, dist, 16, soldier.inCover, false);
    const isHit = Math.random() < hitChance;

    if (isHit) {
      let dmg = calculateDamage(
        enemy.damage,
        soldier.inCover,
        Math.random() < 0.15,
        diffSetting.damageTakenMultiplier
      );
      if (soldier.isDucking) {
        dmg = Math.max(1, Math.round(dmg * 0.4)); // Ducking in trench reduces bullet damage by 60%
      }

      soldier.hp -= dmg;
      soldier.morale = Math.max(0, soldier.morale + calculateMoraleDelta({
        friendlyCasualty: false,
        nearSquadLeader: true,
        enemyRepelled: false,
        pinnedUnderFire: true,
      }, diffSetting.moraleLossMultiplier));

      soundManager.playHitSound(soldier.inCover);
      this.cameraTrauma = Math.min(1.0, this.cameraTrauma + 0.25);

      if (soldier.hp <= 0 && !soldier.isDead) {
        soldier.isDead = true;
        soundManager.playHitSound(false);
        const mesh = this.soldierMeshes.get(soldier.id);
        if (mesh) mesh.rotation.x = -Math.PI * 0.45;
      }

      this.callbacks.onSquadUpdate([...this.squad]);
    }
  }

  private triggerArtilleryExplosion(strike: ArtilleryStrike) {
    this.hitstopTimer = 0.06; // Simulation hitstop freeze for high impact punch
    this.cameraTrauma = Math.min(1.0, this.cameraTrauma + 0.85);

    if (strike.isEnemyStrike) {
      // Enemy counter-battery mortar hitting the Allied trench
      this.squad.forEach((soldier) => {
        if (!soldier.isDead) {
          const dist = Math.hypot(soldier.x - strike.targetX, soldier.z - strike.targetZ);
          const { damage } = calculateArtilleryDamage(dist, strike.blastRadius, strike.maxDamage);
          if (damage > 0) {
            // Ducking in trench heavily mitigates shrapnel
            const finalDamage = soldier.isDucking ? Math.max(2, Math.round(damage * 0.25)) : damage;
            soldier.hp -= finalDamage;
            soldier.morale = Math.max(0, soldier.morale - (soldier.isDucking ? 6 : 18));
            soundManager.playHitSound(soldier.inCover);

            if (soldier.hp <= 0 && !soldier.isDead) {
              soldier.isDead = true;
              soundManager.playHitSound(false);
              const mesh = this.soldierMeshes.get(soldier.id);
              if (mesh) mesh.rotation.x = -Math.PI * 0.45;
            }
          }
        }
      });
      this.callbacks.onSquadUpdate([...this.squad]);
    } else {
      // Friendly artillery blast on enemies
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        if (enemy.isDead) continue;
        const dist = Math.hypot(enemy.x - strike.targetX, enemy.z - strike.targetZ);
        const { damage } = calculateArtilleryDamage(dist, strike.blastRadius, strike.maxDamage);
        if (damage > 0) {
          enemy.hp -= damage;
          enemy.suppression = 4.0;
          if (enemy.hp <= 0 && !enemy.isDead) {
            enemy.isDead = true;
            this.enemiesKilledThisDay++;
            const mesh = this.enemyMeshes.get(enemy.id);
            if (mesh) {
              mesh.rotation.x = Math.PI * 0.5;
              setTimeout(() => {
                this.scene.remove(mesh);
                const idx = this.enemies.indexOf(enemy);
                if (idx !== -1) this.enemies.splice(idx, 1);
              }, 300);
            }
          }
        }
      }
    }

    // Dirt and smoke particles fountain
    for (let i = 0; i < 45; i++) {
      this.spawnParticle(
        strike.targetX + (Math.random() - 0.5) * 1.5,
        0.2,
        strike.targetZ + (Math.random() - 0.5) * 1.5,
        Math.random() > 0.4 ? 'dirt' : 'smoke'
      );
    }
    this.callbacks.onEnemiesCountUpdate(
      this.totalEnemiesThisDay - this.enemiesKilledThisDay,
      this.totalEnemiesThisDay
    );
  }

  private addTracer(fx: number, fy: number, fz: number, tx: number, ty: number, tz: number, isHostile: boolean) {
    this.tracers.push({
      id: `tr_${Date.now()}_${Math.random()}`,
      fromX: fx,
      fromY: fy,
      fromZ: fz,
      toX: tx,
      toY: ty,
      toZ: tz,
      progress: 0,
      isHostile,
    });
  }

  private spawnParticle(x: number, y: number, z: number, type: Particle['type']) {
    if (this.particles.length > 220) return;
    this.particles.push({
      x,
      y,
      z,
      vx: (Math.random() - 0.5) * 4,
      vy: 3 + Math.random() * 5,
      vz: (Math.random() - 0.5) * 4,
      life: 0,
      maxLife: 0.6 + Math.random() * 0.5,
      color: type === 'dirt' ? '#4a3828' : type === 'spark' ? '#ffcc44' : '#888888',
      size: 0.15 + Math.random() * 0.2,
      type,
    });
  }

  private updateParticles(dt: number) {
    const dummy = new THREE.Object3D();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vy -= 9.8 * dt; // gravity

      dummy.position.set(p.x, Math.max(0.05, p.y), p.z);
      const scale = p.size * (1 - p.life / p.maxLife);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.particleMesh.setMatrixAt(i, dummy.matrix);
    }
    this.particleMesh.count = this.particles.length;
    this.particleMesh.instanceMatrix.needsUpdate = true;
  }

  private updateTracers(dt: number) {
    const positions = (this.tracerMesh.geometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array;
    let lineIdx = 0;

    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const tr = this.tracers[i];
      tr.progress += dt * 4.5;
      if (tr.progress >= 1.0) {
        this.tracers.splice(i, 1);
        continue;
      }

      if (lineIdx < 60) {
        positions[lineIdx * 6] = THREE.MathUtils.lerp(tr.fromX, tr.toX, tr.progress);
        positions[lineIdx * 6 + 1] = THREE.MathUtils.lerp(tr.fromY, tr.toY, tr.progress);
        positions[lineIdx * 6 + 2] = THREE.MathUtils.lerp(tr.fromZ, tr.toZ, tr.progress);

        positions[lineIdx * 6 + 3] = THREE.MathUtils.lerp(tr.fromX, tr.toX, Math.min(1.0, tr.progress + 0.15));
        positions[lineIdx * 6 + 4] = THREE.MathUtils.lerp(tr.fromY, tr.toY, Math.min(1.0, tr.progress + 0.15));
        positions[lineIdx * 6 + 5] = THREE.MathUtils.lerp(tr.fromZ, tr.toZ, Math.min(1.0, tr.progress + 0.15));
        lineIdx++;
      }
    }

    this.tracerMesh.geometry.setDrawRange(0, lineIdx * 2);
    (this.tracerMesh.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
  }

  private updateRain(dt: number) {
    if (!this.rainPoints) return;
    const positions = (this.rainGeometry.getAttribute('position') as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3 + 1] -= 22 * dt;
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 18;
      }
    }
    (this.rainGeometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
