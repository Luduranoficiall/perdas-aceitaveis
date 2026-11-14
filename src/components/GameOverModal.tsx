import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Skull, RotateCcw, Home, ShieldAlert } from 'lucide-react';
import { evaluateCampaignOutcome, DifficultyLevel, DIFFICULTY_PRESETS } from '../game/combatRules';
import { Soldier } from '../game/types';
import { soundManager } from '../audio/soundManager';

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  day: number;
  squad: Soldier[];
  difficulty: DifficultyLevel;
  onRestart: () => void;
  onGoToTitle: () => void;
  lang: 'pt' | 'en';
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isVictory,
  day,
  squad,
  difficulty,
  onRestart,
  onGoToTitle,
  lang,
}) => {
  const isPt = lang === 'pt';

  const survivingCount = squad.filter((s) => !s.isDead).length;
  const casualtiesCount = squad.length - survivingCount;

  const outcome = evaluateCampaignOutcome(day, survivingCount, casualtiesCount, difficulty);
  const diffPreset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medio;

  useEffect(() => {
    if (isOpen && isVictory) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c29b38', '#478cbf', '#ffffff', '#e04434'],
      });
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 font-sans select-none">
      <div className="w-full max-w-md bg-[#161a1e] border border-[#3b4550] rounded-lg p-6 shadow-2xl text-stone-200 text-center">
        {/* Outcome Header Icon */}
        <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3">
          {isVictory ? (
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
              <Award className="w-8 h-8 text-amber-400" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-700/60 flex items-center justify-center">
              <Skull className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black font-mono tracking-wider uppercase text-white">
          {isVictory
            ? isPt ? 'ARMISTÍCIO DECLARADO!' : 'ARMISTICE SIGNED!'
            : isPt ? 'TRINCHEIRA ROMPIDA' : 'TRENCH OVERRUN'}
        </h2>

        {/* Difficulty Badge */}
        <div className="mt-1.5 inline-flex items-center gap-1.5 bg-[#121518] px-2.5 py-0.5 rounded border border-stone-800 text-[11px] font-mono text-stone-400">
          <span>{isPt ? 'Dificuldade:' : 'Difficulty:'}</span>
          <span className="font-bold text-amber-300">{diffPreset[isPt ? 'namePt' : 'nameEn']}</span>
        </div>

        {/* Evaluation Summary */}
        <p className="mt-2 text-xs text-stone-300 leading-relaxed font-serif italic">
          {isPt ? outcome.summaryPt : outcome.summaryEn}
        </p>

        {/* Metrics Grid */}
        <div className="mt-5 grid grid-cols-3 gap-2 bg-[#121518] p-3 rounded-lg border border-stone-800 text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-stone-400">
              {isPt ? 'DIAS SOBREVIVIDOS' : 'DAYS SURVIVED'}
            </span>
            <span className="text-lg font-black font-mono text-amber-400 tabular-nums">
              {day} / 20
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-stone-400">
              {isPt ? 'BAIXAS DO ESQUADRÃO' : 'CASUALTIES'}
            </span>
            <span className={`text-lg font-black font-mono tabular-nums ${casualtiesCount > 1 ? 'text-red-400' : 'text-emerald-400'}`}>
              {casualtiesCount} / 4
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-stone-400">
              {isPt ? 'CLASSIFICAÇÃO' : 'GRADE'}
            </span>
            <span className="text-lg font-black font-mono text-sky-400 tabular-nums">
              Rank {outcome.ratingGrade}
            </span>
          </div>
        </div>

        {/* Losses Note */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {isPt ? `Índice de Baixas: ${outcome.lossAcceptabilityPct}%` : `Loss Rate: ${outcome.lossAcceptabilityPct}%`}
            {' · '}
            <span className="text-amber-300">
              {outcome.lossAcceptabilityPct <= 50
                ? isPt ? 'Dentro das Perdas Aceitáveis' : 'Acceptable Losses Met'
                : isPt ? 'Baixas Críticas' : 'Heavy Losses'}
            </span>
          </span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            data-start="true"
            onClick={() => {
              soundManager.playClick();
              soundManager.playTrenchWhistle();
              onRestart();
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-100 font-bold py-3 px-6 rounded-md text-sm transition cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isPt ? 'JOGAR NOVAMENTE' : 'TRY AGAIN'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onGoToTitle();
            }}
            className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium py-2 px-4 rounded text-xs transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isPt ? 'Voltar ao Menu Principal' : 'Back to Title'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
