import React from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Target,
  Sparkles,
  Sliders,
  Crosshair,
  Shield,
  CloudRain,
  Sun,
  CloudFog,
  Moon,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Award,
  AlertOctagon,
  ArrowDownToDot,
} from 'lucide-react';
import { Soldier } from '../game/types';
import { DifficultyLevel, DIFFICULTY_PRESETS } from '../game/combatRules';
import { soundManager } from '../audio/soundManager';

interface GameHUDProps {
  squad: Soldier[];
  currentDay: number;
  totalDays: number;
  enemiesRemaining: number;
  totalEnemies: number;
  difficulty: DifficultyLevel;
  artilleryCooldownRatio: number; // 0 to 1 (1 = ready)
  isArtilleryTargeting: boolean;
  isDucking: boolean;
  incomingMortarAlert?: boolean;
  onSelectSoldier: (id: string) => void;
  onCallArtillery: () => void;
  onOrderMedicHeal: () => void;
  onOrderVolleyFire: () => void;
  onToggleDuck: () => void;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenDevDrawer: () => void;
  onOpenManual: () => void;
  sscsEnabled: boolean;
  onToggleSSCS: () => void;
  lang: 'pt' | 'en';
}

export const GameHUD: React.FC<GameHUDProps> = ({
  squad,
  currentDay,
  totalDays,
  enemiesRemaining,
  totalEnemies,
  difficulty,
  artilleryCooldownRatio,
  isArtilleryTargeting,
  isDucking,
  incomingMortarAlert,
  onSelectSoldier,
  onCallArtillery,
  onOrderMedicHeal,
  onOrderVolleyFire,
  onToggleDuck,
  onPause,
  isMuted,
  onToggleMute,
  onOpenDevDrawer,
  onOpenManual,
  sscsEnabled,
  onToggleSSCS,
  lang,
}) => {
  const [dockCollapsed, setDockCollapsed] = React.useState(false);
  const isPt = lang === 'pt';

  const getWeatherIcon = (day: number) => {
    const mod = day % 4;
    if (mod === 1) return <CloudRain className="w-4 h-4 text-sky-400" />;
    if (mod === 2) return <CloudFog className="w-4 h-4 text-stone-300" />;
    if (mod === 3) return <Sun className="w-4 h-4 text-amber-400" />;
    return <Moon className="w-4 h-4 text-indigo-400" />;
  };

  const deadCount = squad.filter((s) => s.isDead).length;
  const diffPreset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.medio;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-5 select-none font-sans">
      {/* Top Status Bar: Minimal & Low-Occlusion */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Left: Day & Assault Progress & Difficulty Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 bg-[#181c20]/95 border border-[#3b434a] px-3.5 py-2 rounded text-xs text-stone-300 shadow-md">
          <div className="flex items-center gap-1.5 font-mono">
            {getWeatherIcon(currentDay)}
            <span className="font-bold text-amber-400 text-sm tracking-wider tabular-nums">
              {isPt ? `DIA ${currentDay < 10 ? '0' : ''}${currentDay}` : `DAY ${currentDay < 10 ? '0' : ''}${currentDay}`}
            </span>
            <span className="text-stone-500 font-normal">/ {totalDays}</span>
          </div>

          <div className="h-4 w-px bg-stone-700" />

          {/* Difficulty Badge */}
          <div
            onClick={onOpenManual}
            className={`flex items-center gap-1 font-mono font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded border cursor-pointer ${
              difficulty === 'hard_master'
                ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                : difficulty === 'dificil'
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : difficulty === 'facil'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-sky-950/80 border-sky-500 text-sky-300'
            }`}
            title="Clique para ver o Manual e Doutrina Tática"
          >
            <Award className="w-3 h-3" />
            <span>{diffPreset.badge}</span>
            <span className="hidden sm:inline">
              {difficulty === 'hard_master'
                ? 'MASTER'
                : difficulty === 'dificil'
                ? isPt ? 'DIFÍCIL' : 'HARD'
                : difficulty === 'facil'
                ? isPt ? 'FÁCIL' : 'EASY'
                : isPt ? 'MÉDIO' : 'MED'}
            </span>
          </div>

          <div className="h-4 w-px bg-stone-700" />

          {/* Enemy Assault Counter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Crosshair className="w-3.5 h-3.5 text-red-400" />
            <span className="text-stone-400 hidden sm:inline">{isPt ? 'Inimigos:' : 'Enemies:'}</span>
            <span className="font-mono font-bold text-red-300 tabular-nums">
              {enemiesRemaining} / {totalEnemies}
            </span>
          </div>

          <div className="h-4 w-px bg-stone-700 hidden sm:block" />

          {/* Casualties / Losses Indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-400 hidden sm:inline">{isPt ? 'Baixas:' : 'Casualties:'}</span>
            <span className={`font-mono font-bold tabular-nums ${deadCount > 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {deadCount}/4
            </span>
            <span className="text-[10px] text-stone-500 hidden md:inline">
              ({isPt ? 'Perdas Aceitáveis' : 'Acceptable Losses'})
            </span>
          </div>
        </div>

        {/* Right: Quick Utilities */}
        <div className="flex items-center gap-2">
          {/* Documentation Center button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenManual();
            }}
            className="flex items-center gap-1.5 bg-[#25201b]/95 hover:bg-[#382f25] border border-amber-600/70 text-xs text-amber-300 px-2.5 py-1.5 rounded transition cursor-pointer shadow-md"
            aria-label="Abrir Documentação"
            title="Central de Documentação e Manual Tático (Atalho: F1 ou H)"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold hidden sm:inline">{isPt ? 'Documentação [F1]' : 'Docs [F1]'}</span>
          </button>

          {/* SSCS Screen-Space Contact Shadow quick toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSSCS();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-mono font-medium transition cursor-pointer shadow-sm ${
              sscsEnabled
                ? 'bg-[#1b2b3a]/95 border-sky-600 text-sky-300'
                : 'bg-[#22262a]/90 border-stone-700 text-stone-400'
            }`}
            title="Godot 4.8 Screen-Space Contact Shadows (Bend Studios technique)"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${sscsEnabled ? 'bg-sky-400' : 'bg-stone-500'}`} />
            <span className="font-bold">SSCS:</span>
            <span>{sscsEnabled ? (isPt ? 'ATIVO' : 'ON') : (isPt ? 'DESAT.' : 'OFF')}</span>
          </button>

          {/* Godot Dev Inspector Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenDevDrawer();
            }}
            className="flex items-center gap-1 bg-[#1e242a]/95 hover:bg-[#2a323a] border border-[#3f4a54] text-stone-300 hover:text-white px-2.5 py-1.5 rounded text-xs transition cursor-pointer"
            aria-label="Abrir Inspetor Godot 4.8"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline font-mono">Godot 4.8</span>
          </button>

          {/* Mute button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleMute();
            }}
            className="bg-[#1e242a]/95 hover:bg-[#2a323a] border border-[#3f4a54] text-stone-300 p-2 rounded transition cursor-pointer"
            aria-label={isMuted ? 'Desmutar' : 'Mutar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Pause button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onPause();
            }}
            className="bg-[#1e242a]/95 hover:bg-[#2a323a] border border-[#3f4a54] text-stone-300 p-2 rounded transition cursor-pointer"
            aria-label="Pausar jogo"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning: Incoming Enemy Mortar Alert (Hard / Hard Master) */}
      {incomingMortarAlert && (
        <div className="mx-auto bg-red-950/95 border-2 border-red-500 px-5 py-2.5 rounded-lg text-center text-xs text-red-200 pointer-events-auto shadow-2xl animate-bounce">
          <div className="flex items-center justify-center gap-2 font-black font-mono tracking-wider text-sm text-red-400">
            <AlertOctagon className="w-5 h-5 text-red-500 animate-spin" />
            <span>{isPt ? 'ALERTA: MORTEIRO INIMIGO EM APROXIMAÇÃO!' : 'ALERT: INCOMING ENEMY MORTAR!'}</span>
          </div>
          <p className="text-[11px] text-stone-300 mt-0.5">
            {isPt ? 'Pressione [C] para agachar e mitigar estilhaços!' : 'Press [C] to duck in trench and mitigate shrapnel!'}
          </p>
        </div>
      )}

      {/* Crosshair / Targeting Notice if Artillery is active */}
      {isArtilleryTargeting && (
        <div className="mx-auto bg-red-950/90 border border-red-600 px-4 py-2 rounded text-center text-xs text-red-200 pointer-events-auto shadow-lg animate-pulse">
          <p className="font-bold font-mono tracking-wider">
            {isPt ? 'MIRA DE ARTILHARIA ATIVA' : 'ARTILLERY TARGETING ACTIVE'}
          </p>
          <p className="text-[11px] text-stone-300">
            {isPt ? 'Clique na Terra de Ninguém para disparar o obus' : 'Click in No Man\'s Land to call shell strike'}
          </p>
        </div>
      )}

      {/* Unified Bottom Dock: Squad Status & Command Strip */}
      <div className="w-full flex flex-col items-center pointer-events-auto">
        {/* Collapse toggle */}
        <button
          onClick={() => setDockCollapsed(!dockCollapsed)}
          className="mb-1 text-[11px] text-stone-400 hover:text-stone-200 bg-[#161a1e]/90 border border-[#323940] px-3 py-0.5 rounded-t flex items-center gap-1 cursor-pointer transition"
          aria-label={dockCollapsed ? 'Expandir painel' : 'Recolher painel'}
        >
          {dockCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{dockCollapsed ? (isPt ? 'Mostrar Comandos' : 'Show Controls') : (isPt ? 'Ocultar' : 'Hide')}</span>
        </button>

        {!dockCollapsed && (
          <div className="w-full max-w-5xl bg-[#14181c]/95 border border-[#343c44] rounded-lg p-2.5 sm:p-3 shadow-2xl flex flex-col md:flex-row items-stretch justify-between gap-3">
            {/* Left: Squad Roster Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
              {squad.map((soldier, idx) => {
                const hpPercent = Math.max(0, Math.round((soldier.hp / soldier.maxHp) * 100));
                const isSelected = soldier.selected;

                return (
                  <button
                    key={soldier.id}
                    onClick={() => {
                      soundManager.playClick();
                      onSelectSoldier(soldier.id);
                    }}
                    className={`flex flex-col text-left p-2 rounded border transition cursor-pointer relative ${
                      soldier.isDead
                        ? 'bg-red-950/30 border-stone-800 opacity-60'
                        : isSelected
                        ? 'bg-[#252f38] border-amber-500 shadow-md ring-1 ring-amber-500/50'
                        : 'bg-[#1a2026] border-stone-700 hover:bg-[#20272f]'
                    }`}
                  >
                    {/* Key badge */}
                    <span className="absolute top-1 right-1.5 text-[10px] font-mono font-bold text-stone-500">
                      [{idx + 1}]
                    </span>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-amber-400/90 uppercase font-semibold">
                        {soldier.rank}
                      </span>
                      {soldier.inCover && !soldier.isDead && (
                        <span title="Em trincheira">
                          <Shield className="w-2.5 h-2.5 text-sky-400 inline" />
                        </span>
                      )}
                      {soldier.isDucking && !soldier.isDead && (
                        <span title="Agachado" className="text-[9px] bg-amber-900/60 text-amber-300 px-1 rounded font-mono">
                          {isPt ? 'ABAIXADO' : 'DUCKED'}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-stone-200 truncate">
                      {soldier.name}
                    </span>

                    {soldier.isDead ? (
                      <span className="text-[10px] font-mono text-red-500 font-bold mt-1">
                        {isPt ? 'MORTO EM AÇÃO' : 'K.I.A.'}
                      </span>
                    ) : (
                      <>
                        {/* HP Bar */}
                        <div className="mt-1.5 w-full bg-stone-900 rounded-xs h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-200 ${
                              hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>

                        {/* Morale and Ammo stats */}
                        <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-stone-400">
                          <span>HP {soldier.hp}</span>
                          <span>{soldier.ammo} rnds</span>
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Tactical Action Buttons */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 border-t md:border-t-0 md:border-l border-stone-700/60 pt-2 md:pt-0 md:pl-3">
              {/* Trench Duck / Cover [C] */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleDuck();
                }}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 py-2.5 rounded border text-xs font-semibold transition cursor-pointer ${
                  isDucking
                    ? 'bg-amber-700 border-amber-400 text-stone-100 shadow-md ring-1 ring-amber-400'
                    : 'bg-[#1c2228] hover:bg-[#252e36] border-stone-700 text-stone-300'
                }`}
                aria-label="Agachar na Trincheira"
                title="Reduz estilhaços de morteiros e dano por bala em 60%"
              >
                <ArrowDownToDot className="w-4 h-4 text-amber-300" />
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span>{isDucking ? (isPt ? 'LEVANTAR' : 'STAND') : (isPt ? 'AGACHAR' : 'DUCK')}</span>
                    <span className="font-mono text-[10px] text-stone-400">[C]</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {isDucking ? (isPt ? 'Posição de tiro' : 'Firing stance') : (isPt ? 'Atenua estilhaço' : 'Dodge shrapnel')}
                  </span>
                </div>
              </button>

              {/* Artillery Strike Button [Space] */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onCallArtillery();
                }}
                disabled={artilleryCooldownRatio < 1}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded border text-xs font-bold transition cursor-pointer ${
                  artilleryCooldownRatio >= 1
                    ? 'bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 border-amber-500 text-stone-100 shadow-lg'
                    : 'bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed'
                }`}
                aria-label="Bombardeio de Artilharia"
              >
                <Target className="w-4 h-4 text-amber-300" />
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span>{isPt ? 'OBUS ARTILHARIA' : 'ARTILLERY STRIKE'}</span>
                    <span className="font-mono text-[10px] opacity-75">[Espaço]</span>
                  </div>
                  <div className="text-[10px] font-mono font-normal opacity-85">
                    {artilleryCooldownRatio >= 1
                      ? isPt ? 'Pronto para fogo' : 'Ready to fire'
                      : `${Math.round(artilleryCooldownRatio * 100)}% recarregando`}
                  </div>
                </div>
              </button>

              {/* Medic First Aid [R] */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOrderMedicHeal();
                }}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-[#202824] hover:bg-[#28352e] border border-emerald-700/60 text-emerald-300 px-3 py-2.5 rounded text-xs font-semibold transition cursor-pointer"
                aria-label="Primeiros Socorros do Médico"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span>{isPt ? 'CURATIVO' : 'FIRST AID'}</span>
                    <span className="font-mono text-[10px] text-stone-400">[R]</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {isPt ? 'Curar esquadrão' : 'Heal wounded'}
                  </span>
                </div>
              </button>

              {/* Volley Fire */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOrderVolleyFire();
                }}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-[#29221d] hover:bg-[#382d24] border border-amber-700/60 text-amber-300 px-3 py-2.5 rounded text-xs font-semibold transition cursor-pointer"
                aria-label="Fogo Concentrado"
              >
                <Crosshair className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <span>{isPt ? 'FOGO COLETIVO' : 'VOLLEY FIRE'}</span>
                  <div className="text-[10px] text-stone-400 font-normal">
                    {isPt ? 'Salva sincronizada' : 'All rifles volley'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
