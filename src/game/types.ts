/**
 * Data structures and types for Perdas Aceitáveis (Acceptable Losses)
 */

import { DifficultyLevel } from './combatRules';

export type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export type SoldierRole = 'corporal' | 'rifleman' | 'gunner' | 'medic';

export type EnemyType = 'conscript' | 'sturmtrupp' | 'flamethrower' | 'sniper';

export interface Soldier {
  id: string;
  name: string;
  role: SoldierRole;
  rank: string;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  hp: number;
  maxHp: number;
  morale: number; // 0 - 100
  ammo: number;
  maxAmmo: number;
  inCover: boolean;
  isDucking: boolean; // Trench duck to dodge artillery/shrapnel
  selected: boolean;
  isDead: boolean;
  isAttacking: boolean;
  attackCooldown: number;
  suppression: number;
  medicCooldown: number;
  bayonetChargeCooldown: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  windupTimer: number; // Telegraph time before attack
  isWindingUp: boolean;
  isAttacking: boolean;
  isDead: boolean;
  suppression: number;
}

export interface ArtilleryStrike {
  id: string;
  targetX: number;
  targetZ: number;
  delayTimer: number; // Time until shell lands (seconds)
  blastRadius: number;
  maxDamage: number;
  hasExploded: boolean;
  isEnemyStrike?: boolean; // Counter-battery mortar in Hard/Master
}

export interface BulletTracer {
  id: string;
  fromX: number;
  fromY: number;
  fromZ: number;
  toX: number;
  toY: number;
  toZ: number;
  progress: number; // 0 to 1
  isHostile: boolean;
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'smoke' | 'spark' | 'dirt' | 'blood' | 'flare';
}

export interface CampaignStats {
  currentDay: number;
  totalDays: number;
  enemiesKilled: number;
  soldiersLost: number;
  barragesCalled: number;
  difficulty: DifficultyLevel;
  ratingGrade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  isVictory: boolean;
}

export interface GodotEngineSettings {
  sscsEnabled: boolean; // Screen-Space Contact Shadows
  sscsIntensity: number; // 0.0 to 1.0
  wireframe: boolean;
  directionalShadowBias: number;
  godotToolbarMode: 'select' | 'move' | 'rotate' | 'scale';
  showDevNotes: boolean;
}
