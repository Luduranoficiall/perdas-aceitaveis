/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { TrenchSceneManager } from './game/sceneManager';
import { GameState, Soldier, GodotEngineSettings } from './game/types';
import { DifficultyLevel } from './game/combatRules';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { GodotDevDrawer } from './components/GodotDevDrawer';
import { FieldManualModal } from './components/FieldManualModal';
import { soundManager } from './audio/soundManager';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<TrenchSceneManager | null>(null);

  // High-level App / Game States
  const [gameState, setGameState] = useState<GameState>('title');
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medio');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDevDrawerOpen, setIsDevDrawerOpen] = useState<boolean>(false);
  const [isFieldManualOpen, setIsFieldManualOpen] = useState<boolean>(false);

  // Live HUD States updated from simulation
  const [squad, setSquad] = useState<Soldier[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [totalDays] = useState<number>(20);
  const [enemiesRemaining, setEnemiesRemaining] = useState<number>(6);
  const [totalEnemies, setTotalEnemies] = useState<number>(6);
  const [artilleryCooldownRatio, setArtilleryCooldownRatio] = useState<number>(1.0);
  const [isArtilleryTargeting, setIsArtilleryTargeting] = useState<number>(0);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isDucking, setIsDucking] = useState<boolean>(false);
  const [incomingMortarAlert, setIncomingMortarAlert] = useState<boolean>(false);

  // Godot 4.8 Settings
  const [engineSettings, setEngineSettings] = useState<GodotEngineSettings>({
    sscsEnabled: true,
    sscsIntensity: 0.85,
    wireframe: false,
    directionalShadowBias: -0.0005,
    godotToolbarMode: 'select',
    showDevNotes: false,
  });

  // Mount 3D Scene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const manager = new TrenchSceneManager(canvasMountRef.current, {
      onSquadUpdate: (newSquad) => {
        setSquad(newSquad);
        const anyDucking = newSquad.some((s) => s.isDucking && !s.isDead);
        setIsDucking(anyDucking);
      },
      onEnemiesCountUpdate: (remaining, total) => {
        setEnemiesRemaining(remaining);
        setTotalEnemies(total);
      },
      onDayComplete: (nextDay) => {
        setCurrentDay(nextDay);
      },
      onGameOver: (victory) => {
        setIsVictory(victory);
        setGameState('gameover');
      },
      onArtilleryCooldownUpdate: (ratio) => {
        setArtilleryCooldownRatio(ratio);
      },
      onIncomingMortarAlert: (alert) => {
        setIncomingMortarAlert(alert);
      },
    });

    sceneManagerRef.current = manager;

    // Check for ?autostart=1 and ?diff=... in URL
    const urlParams = new URLSearchParams(window.location.search);
    const diffParam = urlParams.get('diff') as DifficultyLevel;
    if (['facil', 'medio', 'dificil', 'hard_master'].includes(diffParam)) {
      setDifficulty(diffParam);
      manager.setDifficulty(diffParam);
    }

    if (urlParams.get('autostart') === '1') {
      manager.setGameState('playing');
      setGameState('playing');
    }

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Global Keyboard listener for Pause, Manual & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (isFieldManualOpen) {
          setIsFieldManualOpen(false);
          return;
        }
        if (isDevDrawerOpen) {
          setIsDevDrawerOpen(false);
          return;
        }

        if (gameState === 'playing') {
          handlePause();
        } else if (gameState === 'paused') {
          handleResume();
        }
      }

      // Key 'F1' or 'KeyH' (or 'KeyD' on Title screen) for Field Manual / Documentation Center
      if (e.code === 'F1' || e.code === 'KeyH' || (gameState === 'title' && e.code === 'KeyD')) {
        e.preventDefault();
        setIsFieldManualOpen((prev) => !prev);
        return;
      }

      // Key 'G' for Godot Dev Drawer
      if (e.code === 'KeyG') {
        setIsDevDrawerOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isFieldManualOpen, isDevDrawerOpen]);

  // Handlers
  const handleStartGame = () => {
    setGameState('playing');
    sceneManagerRef.current?.setGameState('playing');
  };

  const handlePause = () => {
    setGameState('paused');
    sceneManagerRef.current?.setGameState('paused');
  };

  const handleResume = () => {
    setGameState('playing');
    sceneManagerRef.current?.setGameState('playing');
  };

  const handleRestart = () => {
    setCurrentDay(1);
    setGameState('playing');
    sceneManagerRef.current?.setupDay(1, difficulty);
    sceneManagerRef.current?.setGameState('playing');
  };

  const handleGoToTitle = () => {
    setGameState('title');
    sceneManagerRef.current?.setGameState('title');
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'pt' ? 'en' : 'pt'));
  };

  const handleSelectDifficulty = (level: DifficultyLevel) => {
    setDifficulty(level);
    sceneManagerRef.current?.setDifficulty(level);
  };

  const handleToggleDuck = () => {
    const ducked = sceneManagerRef.current?.toggleTrenchDuck();
    setIsDucking(!!ducked);
  };

  const handleToggleSSCS = () => {
    const newSSCS = !engineSettings.sscsEnabled;
    const updated = { ...engineSettings, sscsEnabled: newSSCS };
    setEngineSettings(updated);
    sceneManagerRef.current?.updateEngineSettings(updated);
  };

  const handleUpdateEngineSettings = (newSettings: Partial<GodotEngineSettings>) => {
    const updated = { ...engineSettings, ...newSettings };
    setEngineSettings(updated);
    sceneManagerRef.current?.updateEngineSettings(updated);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#181c20]">
      {/* Isolated WebGL 3D Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        data-testid="threejs-trench-viewport"
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          lang={lang}
          onToggleLang={handleToggleLang}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenDevDrawer={() => setIsDevDrawerOpen(true)}
          onOpenManual={() => setIsFieldManualOpen(true)}
          difficulty={difficulty}
          onSelectDifficulty={handleSelectDifficulty}
        />
      )}

      {/* In-Game World-Matched HUD */}
      {gameState === 'playing' && (
        <GameHUD
          squad={squad}
          currentDay={currentDay}
          totalDays={totalDays}
          enemiesRemaining={enemiesRemaining}
          totalEnemies={totalEnemies}
          difficulty={difficulty}
          artilleryCooldownRatio={artilleryCooldownRatio}
          isArtilleryTargeting={isArtilleryTargeting > 0}
          isDucking={isDucking}
          incomingMortarAlert={incomingMortarAlert}
          onSelectSoldier={(id) => sceneManagerRef.current?.selectSoldierById(id)}
          onCallArtillery={() => sceneManagerRef.current?.toggleArtilleryTargeting()}
          onOrderMedicHeal={() => sceneManagerRef.current?.orderMedicHeal()}
          onOrderVolleyFire={() => sceneManagerRef.current?.orderVolleyFire()}
          onToggleDuck={handleToggleDuck}
          onPause={handlePause}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenDevDrawer={() => setIsDevDrawerOpen(true)}
          onOpenManual={() => setIsFieldManualOpen(true)}
          sscsEnabled={engineSettings.sscsEnabled}
          onToggleSSCS={handleToggleSSCS}
          lang={lang}
        />
      )}

      {/* Pause Modal */}
      <PauseModal
        isOpen={gameState === 'paused'}
        onResume={handleResume}
        onRestart={handleRestart}
        onGoToTitle={handleGoToTitle}
        onOpenManual={() => setIsFieldManualOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        difficulty={difficulty}
        lang={lang}
      />

      {/* Game Over / Victory Modal */}
      <GameOverModal
        isOpen={gameState === 'gameover'}
        isVictory={isVictory}
        day={currentDay}
        squad={squad}
        difficulty={difficulty}
        onRestart={handleRestart}
        onGoToTitle={handleGoToTitle}
        lang={lang}
      />

      {/* Godot 4.8 Dev 6 Showcase Drawer */}
      <GodotDevDrawer
        isOpen={isDevDrawerOpen}
        onClose={() => setIsDevDrawerOpen(false)}
        settings={engineSettings}
        onUpdateSettings={handleUpdateEngineSettings}
        lang={lang}
      />

      {/* Field Manual & Doctrine Modal */}
      <FieldManualModal
        isOpen={isFieldManualOpen}
        onClose={() => setIsFieldManualOpen(false)}
        lang={lang}
        currentDifficulty={difficulty}
        onSelectDifficulty={(lvl) => {
          handleSelectDifficulty(lvl);
        }}
      />
    </div>
  );
}
