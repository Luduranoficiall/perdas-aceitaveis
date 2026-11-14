import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDayParameters,
  calculateHitProbability,
  calculateDamage,
  calculateArtilleryDamage,
  calculateMoraleDelta,
  evaluateCampaignOutcome,
  getDifficultySettings,
  DIFFICULTY_PRESETS,
} from './combatRules';

test('difficulty presets contain all 4 requested difficulty levels with correct tunings', () => {
  const levels = ['facil', 'medio', 'dificil', 'hard_master'] as const;
  levels.forEach((lvl) => {
    const setting = getDifficultySettings(lvl);
    assert.ok(setting, `Setting for ${lvl} should exist`);
    assert.ok(setting.namePt.length > 0);
    assert.ok(setting.nameEn.length > 0);
    assert.ok(setting.badge.length > 0);
  });

  // Hard Master must be significantly more challenging than Fácil
  const facil = getDifficultySettings('facil');
  const master = getDifficultySettings('hard_master');
  assert.ok(master.damageTakenMultiplier > facil.damageTakenMultiplier);
  assert.ok(master.enemySpeedMultiplier > facil.enemySpeedMultiplier);
  assert.ok(master.artilleryCooldownMultiplier > facil.artilleryCooldownMultiplier);
  assert.equal(master.counterBatteryMortars, true);
});

test('getDayParameters scales accurately from Day 1 to Day 20 across difficulties', () => {
  const day1Normal = getDayParameters(1, 'medio');
  const day20Normal = getDayParameters(20, 'medio');
  const day20HardMaster = getDayParameters(20, 'hard_master');

  assert.equal(day1Normal.day, 1);
  assert.equal(day20Normal.day, 20);
  assert.ok(day20Normal.enemyCount > day1Normal.enemyCount);
  assert.ok(day20HardMaster.enemyCount >= day20Normal.enemyCount);
});

test('calculateDamage applies difficulty multipliers and cover correctly', () => {
  const baseDmg = 20;
  const normalDmg = calculateDamage(baseDmg, false, false, 1.0);
  const masterDmg = calculateDamage(baseDmg, false, false, 1.7);
  const coveredDmg = calculateDamage(baseDmg, true, false, 1.0);

  assert.equal(normalDmg, 20);
  assert.equal(masterDmg, 34);
  assert.equal(coveredDmg, 12);
});

test('calculateArtilleryDamage handles blast radius and minimum damage properly', () => {
  const epicenter = calculateArtilleryDamage(0, 10, 80);
  assert.equal(epicenter.damage, 80);
  assert.equal(epicenter.knockbackForce, 12);

  const edge = calculateArtilleryDamage(8, 10, 80);
  assert.ok(edge.damage > 0 && edge.damage < 15);

  const outside = calculateArtilleryDamage(11, 10, 80);
  assert.equal(outside.damage, 0);
});

test('evaluateCampaignOutcome accounts for Hard Master S-grade evaluation', () => {
  const masterVictory = evaluateCampaignOutcome(20, 4, 0, 'hard_master');
  assert.equal(masterVictory.isVictory, true);
  assert.equal(masterVictory.ratingGrade, 'S');
  assert.ok(masterVictory.summaryPt.includes('Hard Master'));

  const defeat = evaluateCampaignOutcome(5, 0, 4, 'dificil');
  assert.equal(defeat.isVictory, false);
  assert.equal(defeat.ratingGrade, 'F');
});
