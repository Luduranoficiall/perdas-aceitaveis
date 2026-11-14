import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, BookOpen, Award } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { DifficultyLevel, DIFFICULTY_PRESETS } from '../game/combatRules';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onGoToTitle: () => void;
  onOpenManual: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  difficulty: DifficultyLevel;
  lang: 'pt' | 'en';
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onGoToTitle,
  onOpenManual,
  isMuted,
  onToggleMute,
  difficulty,
  lang,
}) => {
  if (!isOpen) return null;
  const isPt = lang === 'pt';
  const diffPreset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medio;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 font-sans select-none">
      <div className="w-full max-w-sm bg-[#161a1e] border border-[#39424c] rounded-lg p-6 shadow-2xl text-stone-200 text-center">
        <h2 className="text-xl font-bold font-mono tracking-wider text-amber-400 uppercase">
          {isPt ? 'JOGO PAUSADO' : 'GAME PAUSED'}
        </h2>

        {/* Difficulty Badge Indicator */}
        <div className="mt-2 inline-flex items-center gap-1.5 bg-[#121518] px-2.5 py-1 rounded border border-stone-800 text-[11px] font-mono text-stone-300">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>{isPt ? 'Dificuldade:' : 'Difficulty:'}</span>
          <span className="font-bold text-amber-300">{diffPreset[isPt ? 'namePt' : 'nameEn']}</span>
        </div>

        <p className="mt-2 text-xs text-stone-400">
          {isPt ? 'A trincheira aguarda suas ordens táticas' : 'The trench awaits your tactical orders'}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-100 font-bold py-2.5 px-4 rounded text-sm transition cursor-pointer shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isPt ? 'Continuar [Esc / P]' : 'Resume [Esc / P]'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenManual();
            }}
            className="flex items-center justify-center gap-2 bg-[#25201b] hover:bg-[#322a22] border border-amber-600/60 text-amber-300 font-semibold py-2 px-4 rounded text-xs transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{isPt ? 'Central de Documentação & Doutrina [F1]' : 'Documentation Center & Doctrine [F1]'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium py-2 px-4 rounded text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isPt ? 'Reiniciar Campanha' : 'Restart Campaign'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onGoToTitle();
            }}
            className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium py-2 px-4 rounded text-xs transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isPt ? 'Menu Principal' : 'Main Menu'}</span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-800 flex items-center justify-center">
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleMute();
            }}
            className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-200 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? (isPt ? 'Áudio Mutado' : 'Audio Muted') : (isPt ? 'Áudio Ligado' : 'Audio On')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
