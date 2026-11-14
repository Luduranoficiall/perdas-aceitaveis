/**
 * Combat Rules and Simulation Logic for Perdas Aceitáveis (Acceptable Losses)
 * Pure, decoupled functions for game mechanics, cover, morale, difficulty levels, and campaign pacing.
 */

export type DifficultyLevel = 'facil' | 'medio' | 'dificil' | 'hard_master';

export interface DifficultySettings {
  level: DifficultyLevel;
  namePt: string;
  nameEn: string;
  badge: string;
  descriptionPt: string;
  descriptionEn: string;
  damageTakenMultiplier: number;
  damageDealtMultiplier: number;
  startingAmmoMultiplier: number;
  enemySpawnDelayMultiplier: number;
  enemySpeedMultiplier: number;
  artilleryCooldownMultiplier: number;
  counterBatteryMortars: boolean;
  medicCooldownMultiplier: number;
  moraleLossMultiplier: number;
}

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultySettings> = {
  facil: {
    level: 'facil',
    namePt: 'Fácil (Recruta)',
    nameEn: 'Easy (Cadet)',
    badge: 'REC',
    descriptionPt: 'Maior tolerância a dano (-30%), recarga rápida de artilharia (-35%), munição abundante e moral estável.',
    descriptionEn: 'Higher damage tolerance (-30%), faster artillery cooldown (-35%), abundant ammunition and resilient morale.',
    damageTakenMultiplier: 0.7,
    damageDealtMultiplier: 1.35,
    startingAmmoMultiplier: 1.5,
    enemySpawnDelayMultiplier: 1.35,
    enemySpeedMultiplier: 0.85,
    artilleryCooldownMultiplier: 0.65,
    counterBatteryMortars: false,
    medicCooldownMultiplier: 0.7,
    moraleLossMultiplier: 0.5,
  },
  medio: {
    level: 'medio',
    namePt: 'Médio (Veterano)',
    nameEn: 'Medium (Veteran)',
    badge: 'VET',
    descriptionPt: 'Experiência histórica e autêntica de atrito na 1ª Guerra. Balanço tático padrão de 20 dias.',
    descriptionEn: 'Authentic historical WW1 attrition experience. Standard tactical 20-day balance.',
    damageTakenMultiplier: 1.0,
    damageDealtMultiplier: 1.0,
    startingAmmoMultiplier: 1.0,
    enemySpawnDelayMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    artilleryCooldownMultiplier: 1.0,
    counterBatteryMortars: false,
    medicCooldownMultiplier: 1.0,
    moraleLossMultiplier: 1.0,
  },
  dificil: {
    level: 'dificil',
    namePt: 'Difícil (Comandante)',
    nameEn: 'Hard (Commander)',
    badge: 'CMD',
    descriptionPt: 'Inimigos mais rápidos e agressivos (+15% velocidade, +30% dano). Fogo esporádico de contra-bateria inimiga.',
    descriptionEn: 'Faster, more aggressive enemies (+15% speed, +30% damage). Sporadic enemy counter-battery mortar fire.',
    damageTakenMultiplier: 1.3,
    damageDealtMultiplier: 0.9,
    startingAmmoMultiplier: 0.85,
    enemySpawnDelayMultiplier: 0.8,
    enemySpeedMultiplier: 1.15,
    artilleryCooldownMultiplier: 1.25,
    counterBatteryMortars: true,
    medicCooldownMultiplier: 1.25,
    moraleLossMultiplier: 1.35,
  },
  hard_master: {
    level: 'hard_master',
    namePt: 'Hard Master (Verdun 1916)',
    nameEn: 'Hard Master (Verdun 1916)',
    badge: 'MASTER',
    descriptionPt: 'Brutalidade implacável: dano letal (+70%), munição escassa (-35%), rajadas pesadas de morteiros inimigos e choque psicológico.',
    descriptionEn: 'Relentless brutality: lethal damage (+70%), scarce ammo (-35%), heavy enemy mortar barrages, and severe shell shock.',
    damageTakenMultiplier: 1.7,
    damageDealtMultiplier: 0.8,
    startingAmmoMultiplier: 0.65,
    enemySpawnDelayMultiplier: 0.65,
    enemySpeedMultiplier: 1.3,
    artilleryCooldownMultiplier: 1.5,
    counterBatteryMortars: true,
    medicCooldownMultiplier: 1.5,
    moraleLossMultiplier: 1.75,
  },
};

export function getDifficultySettings(level: DifficultyLevel): DifficultySettings {
  return DIFFICULTY_PRESETS[level] || DIFFICULTY_PRESETS.medio;
}

export interface DayConfig {
  day: number;
  titlePt: string;
  titleEn: string;
  weather: 'rain' | 'fog' | 'dawn' | 'dusk' | 'night';
  enemyCount: number;
  enemyWaveDelay: number; // in seconds
  sturmtruppProbability: number;
  flamethrowerProbability: number;
  sniperProbability: number;
  ambientLightLevel: number;
}

export interface SoldierStats {
  id: string;
  name: string;
  role: 'corporal' | 'rifleman' | 'gunner' | 'medic';
  hp: number;
  maxHp: number;
  morale: number; // 0 - 100
  ammo: number; // rounds
  maxAmmo: number;
  inCover: boolean;
  isPanicking: boolean;
}

export function getDayParameters(day: number, difficulty: DifficultyLevel = 'medio'): DayConfig {
  const clampedDay = Math.max(1, Math.min(20, day));
  const diff = getDifficultySettings(difficulty);
  
  // Weather schedule throughout the 20-day campaign
  const weathers: DayConfig['weather'][] = [
    'rain', 'rain', 'fog', 'dawn', 'rain',
    'fog', 'dusk', 'rain', 'night', 'dawn',
    'rain', 'fog', 'dusk', 'rain', 'night',
    'fog', 'rain', 'dusk', 'night', 'dawn'
  ];
  
  const weather = weathers[(clampedDay - 1) % weathers.length];

  const titlesPt = [
    'Primeiro Batismo de Fogo',
    'A Lama das Trincheiras',
    'Avisos de Gás e Nevoeiro',
    'Ataque de Madrugada',
    'Chuva Implacável',
    'Bombardeio Preliminar',
    'Infiltração ao Entardecer',
    'Guerra de Atrito',
    'Noite dos Sinalizadores',
    'Ruptura na Linha de Frente',
    'Fogo Cruzado no Parapeito',
    'Névoa da Terra de Ninguém',
    'Sob o Cerco dos Caçadores',
    'O Barulho das Metralhadoras',
    'Noite Escura sem Estrelas',
    'Resistência Desesperada',
    'Tempestade de Chumbo',
    'Últimas Munições',
    'Véspera do Armistício',
    'A Batalha Final: Dia 20'
  ];

  const titlesEn = [
    'First Baptism of Fire',
    'Trench Mud & Wire',
    'Gas Warnings in the Mist',
    'Dawn Counter-Assault',
    'Relentless Rain',
    'Preliminary Artillery Barrage',
    'Dusk Infiltration',
    'War of Attrition',
    'Night of the Flares',
    'Frontline Breach',
    'Crossfire on the Parapet',
    'Mist over No Man\'s Land',
    'Besieged by Sturmtruppen',
    'Rattle of the Maxim Guns',
    'Starless Black Night',
    'Desperate Stand',
    'Storm of Lead',
    'Last Reserves of Ammo',
    'Eve of Armistice',
    'The Final Stand: Day 20'
  ];

  // Progressive difficulty scaling adjusted by DifficultyLevel
  const baseCount = 4 + Math.floor(clampedDay * 1.8);
  const enemyCount = Math.max(3, Math.round(baseCount * (difficulty === 'facil' ? 0.8 : difficulty === 'hard_master' ? 1.4 : difficulty === 'dificil' ? 1.2 : 1.0)));
  
  const sturmtruppProbability = Math.min(0.6, (0.05 + clampedDay * 0.025) * (difficulty === 'hard_master' ? 1.4 : 1.0));
  const flamethrowerProbability = clampedDay >= 6 ? Math.min(0.4, (0.05 + (clampedDay - 6) * 0.025) * (difficulty === 'hard_master' ? 1.3 : 1.0)) : 0;
  const sniperProbability = clampedDay >= 3 ? Math.min(0.35, (0.05 + (clampedDay - 3) * 0.02) * (difficulty === 'hard_master' ? 1.3 : 1.0)) : 0;
  const enemyWaveDelay = Math.max(1.2, (4.5 - (clampedDay * 0.12)) * diff.enemySpawnDelayMultiplier);

  let ambientLightLevel = 1.0;
  if (weather === 'night') ambientLightLevel = 0.35;
  else if (weather === 'rain' || weather === 'fog') ambientLightLevel = 0.7;
  else if (weather === 'dusk') ambientLightLevel = 0.6;

  return {
    day: clampedDay,
    titlePt: titlesPt[clampedDay - 1],
    titleEn: titlesEn[clampedDay - 1],
    weather,
    enemyCount,
    enemyWaveDelay,
    sturmtruppProbability,
    flamethrowerProbability,
    sniperProbability,
    ambientLightLevel,
  };
}

/**
 * Calculates weapon hit probability based on range, cover, and suppression
 */
export function calculateHitProbability(
  baseAccuracy: number,
  distance: number,
  effectiveRange: number,
  targetInCover: boolean,
  targetSuppressed: boolean
): number {
  let chance = baseAccuracy;

  // Range falloff
  if (distance > effectiveRange) {
    const rangeRatio = distance / effectiveRange;
    chance -= (rangeRatio - 1.0) * 0.35;
  }

  // Cover modifier (trench sandbags reduce hit chance by 50%)
  if (targetInCover) {
    chance *= 0.5;
  }

  // Suppressed targets are pinned and easier to hit
  if (targetSuppressed) {
    chance += 0.15;
  }

  return Math.max(0.08, Math.min(0.95, chance));
}

/**
 * Calculates raw and mitigated damage from attacks, incorporating difficulty multipliers
 */
export function calculateDamage(
  baseDamage: number,
  targetInCover: boolean,
  isCritical: boolean = false,
  damageMultiplier: number = 1.0
): number {
  let dmg = baseDamage * damageMultiplier;
  if (targetInCover) {
    // 40% damage reduction behind sandbags/in trench
    dmg *= 0.6;
  }
  if (isCritical) {
    dmg *= 1.75;
  }
  return Math.max(1, Math.round(dmg));
}

/**
 * Calculates artillery barrage damage based on distance from impact center
 */
export function calculateArtilleryDamage(
  distanceFromEpicenter: number,
  blastRadius: number,
  maxDamage: number = 85
): { damage: number; knockbackForce: number } {
  if (distanceFromEpicenter >= blastRadius) {
    return { damage: 0, knockbackForce: 0 };
  }

  const factor = 1 - (distanceFromEpicenter / blastRadius);
  // Quadratic falloff from blast center
  const damage = Math.max(1, Math.round(maxDamage * Math.pow(factor, 1.6)));
  const knockbackForce = Number((factor * 12).toFixed(1));

  return { damage, knockbackForce };
}

/**
 * Evaluates squad morale changes with difficulty scaling
 */
export function calculateMoraleDelta(
  params: {
    friendlyCasualty: boolean;
    nearSquadLeader: boolean;
    enemyRepelled: boolean;
    pinnedUnderFire: boolean;
  },
  moraleMultiplier: number = 1.0
): number {
  let delta = 0;
  if (params.friendlyCasualty) delta -= 18 * moraleMultiplier;
  if (params.pinnedUnderFire) delta -= 8 * moraleMultiplier;
  if (params.nearSquadLeader) delta += 6;
  if (params.enemyRepelled) delta += 12;

  return Math.round(delta);
}

/**
 * Evaluates campaign outcome metrics
 */
export function evaluateCampaignOutcome(
  day: number,
  survivingSoldiers: number,
  totalCasualties: number,
  difficulty: DifficultyLevel = 'medio'
): {
  isVictory: boolean;
  ratingGrade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  lossAcceptabilityPct: number;
  summaryPt: string;
  summaryEn: string;
} {
  const isVictory = day >= 20 && survivingSoldiers > 0;
  const initialTotal = survivingSoldiers + totalCasualties;
  const lossAcceptabilityPct = initialTotal > 0 ? Math.round((totalCasualties / initialTotal) * 100) : 0;

  let ratingGrade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
  if (isVictory) {
    if (difficulty === 'hard_master' && lossAcceptabilityPct <= 25) ratingGrade = 'S';
    else if (lossAcceptabilityPct <= 20) ratingGrade = 'A';
    else if (lossAcceptabilityPct <= 45) ratingGrade = 'B';
    else ratingGrade = 'C';
  } else {
    if (day >= 15) ratingGrade = 'D';
    else ratingGrade = 'F';
  }

  const diffLabel = getDifficultySettings(difficulty).namePt;
  let summaryPt = '';
  let summaryEn = '';

  if (isVictory) {
    summaryPt = `Vitória memorável na dificuldade ${diffLabel}! A 11ª Companhia manteve o setor de Flandres até o Armistício no Dia 20. Taxa de baixas: ${lossAcceptabilityPct}% (Perdas Aceitáveis pelo Alto Comando).`;
    summaryEn = `Memorable victory on ${getDifficultySettings(difficulty).nameEn}! The 11th Company held the Flanders sector until the Armistice on Day 20. Casualty rate: ${lossAcceptabilityPct}% (Acceptable Losses by High Command).`;
  } else {
    summaryPt = `Setor Perdido no Dia ${day} (${diffLabel}). As trincheiras foram rompidas pelas tropas de choque antes do armistício.`;
    summaryEn = `Sector Lost on Day ${day} (${getDifficultySettings(difficulty).nameEn}). The trenches were overrun by shock troops before the armistice.`;
  }

  return {
    isVictory,
    ratingGrade,
    lossAcceptabilityPct,
    summaryPt,
    summaryEn,
  };
}
