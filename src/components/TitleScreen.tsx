import React from 'react';
import { Volume2, VolumeX, Shield, Play, Info, BookOpen, Award } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { DifficultyLevel, DIFFICULTY_PRESETS } from '../game/combatRules';

interface TitleScreenProps {
  onStart: () => void;
  lang: 'pt' | 'en';
  onToggleLang: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenDevDrawer: () => void;
  onOpenManual: () => void;
  difficulty: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  lang,
  onToggleLang,
  isMuted,
  onToggleMute,
  onOpenDevDrawer,
  onOpenManual,
  difficulty,
  onSelectDifficulty,
}) => {
  const isPt = lang === 'pt';

  const diffLevels: DifficultyLevel[] = ['facil', 'medio', 'dificil', 'hard_master'];

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between pointer-events-none p-5 sm:p-7 select-none">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Godot 4.8 dev snapshot badge */}
        <div className="flex items-center gap-2 bg-[#1b2229]/95 border border-[#3b4754] px-3.5 py-1.5 rounded text-xs text-[#a0b0c0] shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
          <span className="font-mono tracking-wider font-semibold text-white">GODOT 4.8 DEV 6</span>
          <span className="text-[#64748b]">|</span>
          <span className="hidden sm:inline">Spotlight: Zann Archive</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Field Manual / Documentation Center Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenManual();
            }}
            className="flex items-center gap-1.5 bg-[#25201b]/95 hover:bg-[#382f25] border border-amber-600/70 text-xs text-amber-300 px-3 py-1.5 rounded transition cursor-pointer shadow-md"
            aria-label="Abrir Central de Documentação"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{isPt ? 'Documentação [F1]' : 'Documentation [F1]'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenDevDrawer();
            }}
            className="flex items-center gap-1.5 bg-[#1e293b]/95 hover:bg-[#334155] border border-[#475569] text-xs text-sky-300 px-3 py-1.5 rounded transition cursor-pointer shadow-md"
            aria-label="Abrir Notas do Godot 4.8"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-medium hidden sm:inline">{isPt ? 'Recursos Godot 4.8' : 'Godot 4.8 Features'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleLang();
            }}
            className="bg-[#1e293b]/95 hover:bg-[#334155] border border-[#475569] text-xs font-mono font-bold text-slate-200 px-2.5 py-1.5 rounded transition cursor-pointer shadow-md"
            aria-label="Alternar idioma"
          >
            {isPt ? 'PT' : 'EN'}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleMute();
            }}
            className="bg-[#1e293b]/95 hover:bg-[#334155] border border-[#475569] text-slate-300 hover:text-white p-2 rounded transition cursor-pointer shadow-md"
            aria-label={isMuted ? 'Desmutar' : 'Mutar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hero Title Lockup & 35% Negative Space */}
      <div className="my-auto max-w-3xl pointer-events-auto">
        {/* Bespoke inline SVG Title Insignia */}
        <div className="mb-3">
          <svg className="w-24 h-12 text-[#94a3b8]" viewBox="0 0 100 40" fill="none">
            {/* Allied Trench Insignia */}
            <path d="M10 20 L50 4 L90 20 L50 36 Z" stroke="currentColor" strokeWidth="2" fill="#1e242a" fillOpacity="0.8" />
            <path d="M25 20 L50 10 L75 20 L50 30 Z" stroke="#c29b38" strokeWidth="1.5" />
            <circle cx="50" cy="20" r="3" fill="#e2c044" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-stone-100 uppercase drop-shadow-md">
          {isPt ? 'Perdas Aceitáveis' : 'Acceptable Losses'}
        </h1>

        <p className="mt-2 text-base sm:text-lg text-amber-200/90 font-serif italic tracking-wide">
          {isPt
            ? 'Um jogo de comando e sobrevivência na 1ª Guerra Mundial por Zann Archive'
            : 'A WW1 tactical squad command & management campaign by Zann Archive'}
        </p>

        <p className="mt-2.5 text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
          {isPt
            ? 'Lidere a 11ª Companhia em uma campanha brutal de 20 dias nas trincheiras de Flandres. Reposicione tropas, economize munição, chame apoio de artilharia pesada e suporte o avanço das tropas de choque.'
            : 'Lead the 11th Company in a brutal 20-day campaign in the trenches of Flanders. Reposition soldiers, manage ammunition, call artillery barrages, and endure shock trooper assaults.'}
        </p>

        {/* Difficulty Level Selector */}
        <div className="mt-6 bg-[#14181c]/90 border border-stone-800 p-3 rounded-lg max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{isPt ? 'Nível de Dificuldade:' : 'Difficulty Level:'}</span>
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              {DIFFICULTY_PRESETS[difficulty][isPt ? 'namePt' : 'nameEn']}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {diffLevels.map((lvl) => {
              const preset = DIFFICULTY_PRESETS[lvl];
              const isSelected = difficulty === lvl;

              return (
                <button
                  key={lvl}
                  onClick={() => {
                    soundManager.playClick();
                    onSelectDifficulty(lvl);
                  }}
                  className={`py-2 px-2.5 rounded border text-xs font-mono font-bold transition cursor-pointer flex flex-col items-center text-center ${
                    isSelected
                      ? lvl === 'hard_master'
                        ? 'bg-red-950/80 border-red-500 text-red-300 ring-1 ring-red-500'
                        : lvl === 'dificil'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                        : lvl === 'medio'
                        ? 'bg-sky-950/80 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                        : 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                      : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  <span className="text-[10px] opacity-75 font-normal tracking-wide">
                    {preset.badge}
                  </span>
                  <span className="truncate w-full text-[11px]">
                    {lvl === 'facil'
                      ? isPt ? 'FÁCIL' : 'EASY'
                      : lvl === 'medio'
                      ? isPt ? 'MÉDIO' : 'MEDIUM'
                      : lvl === 'dificil'
                      ? isPt ? 'DIFÍCIL' : 'HARD'
                      : 'HARD MASTER'}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-[11px] text-stone-400 italic">
            {DIFFICULTY_PRESETS[difficulty][isPt ? 'descriptionPt' : 'descriptionEn']}
          </p>
        </div>

        {/* Start Game CTA buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3.5">
          <button
            data-start="true"
            onClick={() => {
              soundManager.playClick();
              soundManager.playTrenchWhistle();
              onStart();
            }}
            className="flex items-center gap-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-100 font-bold px-8 py-3.5 rounded-md shadow-lg border border-amber-500/40 transition transform active:scale-95 cursor-pointer text-base sm:text-lg"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isPt ? 'INICIAR CAMPANHA (20 DIAS)' : 'START CAMPAIGN (20 DAYS)'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenManual();
            }}
            className="flex items-center gap-2 bg-stone-900/90 hover:bg-stone-800 border border-amber-600/70 text-amber-200 px-5 py-3.5 rounded-md text-sm font-semibold transition cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>{isPt ? 'Central de Documentação & Doutrina [F1]' : 'Documentation Center & Doctrine [F1]'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenDevDrawer();
            }}
            className="flex items-center gap-2 bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-300 px-4 py-3.5 rounded-md text-sm font-medium transition cursor-pointer shadow-md"
          >
            <Shield className="w-4 h-4 text-sky-400" />
            <span>{isPt ? 'Vitrine Godot 4.8 [G]' : 'Godot 4.8 [G]'}</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hints in safe margin */}
      <div className="flex items-center justify-between text-xs text-stone-400/90 font-mono tracking-wider pt-3 border-t border-stone-800/60 pointer-events-auto">
        <span>{isPt ? 'WASD / Setas Navegar · 1-4 Selecionar · Clique Mover · C Agachar · Espaço Artilharia · F1/H Documentação · Esc Pausa' : 'WASD / Arrows Pan · 1-4 Select · Click Move · C Duck · Space Artillery · F1/H Documentation · Esc Pause'}</span>
        <span className="hidden sm:inline text-amber-500/80">{isPt ? 'Pressione Enter ou Espaço para iniciar' : 'Press Enter or Space to Start'}</span>
      </div>
    </div>
  );
};
