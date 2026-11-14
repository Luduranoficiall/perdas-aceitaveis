import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Shield,
  Crosshair,
  Flame,
  Award,
  Zap,
  Sliders,
  Keyboard,
  FileText,
  Copy,
  Check,
  Cpu,
  Bookmark,
} from 'lucide-react';
import { DIFFICULTY_PRESETS, DifficultyLevel } from '../game/combatRules';

interface FieldManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'pt' | 'en';
  currentDifficulty: DifficultyLevel;
  onSelectDifficulty?: (level: DifficultyLevel) => void;
}

export const FieldManualModal: React.FC<FieldManualModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentDifficulty,
  onSelectDifficulty,
}) => {
  const [activeTab, setActiveTab] = useState<'difficulties' | 'architecture' | 'doctrine' | 'squad' | 'threats' | 'controls' | 'godot'>('difficulties');
  const [copied, setCopied] = useState<boolean>(false);
  const isPt = lang === 'pt';

  if (!isOpen) return null;

  const handleCopyDocumentation = () => {
    const docMarkdown = `# Perdas Aceitáveis (Acceptable Losses) - Documentação Oficial & Manual Técnico
Godot Engine 4.8 dev 6 Showcase & Campanha Tática de Trincheiras da 1ª Guerra Mundial
Dossiê Técnico e Operacional QG 11ª Divisão · Versão 4.8.6-PROD

## 1. Níveis de Dificuldade
- FÁCIL (Recruta): Dano recebido -30%, Dano causado +35%, Munição +50%, Artilharia 8s, Contra-bateria desativada.
- MÉDIO (Veterano): Calibração histórica autêntica 1.0x, 20 dias de atrito, artilharia 12s.
- DIFÍCIL (Comandante): Dano recebido +30%, Inimigos +15% velozes, Munição -15%, Artilharia 15s, Contra-bateria de morteiros ativa.
- HARD MASTER (Verdun 1916): Dano recebido +70%, Munição -35%, Artilharia 18s, Barragem contínua de morteiros, Recompensa Rank S.

## 2. Comandos Operacionais
- [1] [2] [3] [4]: Selecionar Cabo, Fuzileiro, Metralhador ou Paramédico.
- WASD / Setas: Panorâmica suave pela trincheira e Terra de Ninguém.
- Clique no Chão: Deslocar soldado selecionado.
- [Espaço]: Acionar obus de artilharia pesada.
- [R]: Primeiros socorros do médico (+35 HP, +20 Moral).
- [C]: Agachar na trincheira para evitar estilhaços de morteiros.
- [D]: Abrir Central de Documentação.
- [G]: Inspetor técnico Godot 4.8 (SSCS slider).
- [M]: Alternar áudio procedural Web Audio.
- [Esc] / [P]: Pausar jogo.

## 3. Destaques Godot 4.8 dev 6
- GH-118045: Screen-Space Contact Shadows (SSCS) para luzes direcionais (Rudolph Bester / Bend Studios approach).
- GH-121065: Barra de ferramentas 3D limpa e simplificada (Jayden Sipe).
- GH-123439: Correção de falha no arranque no macOS Metal.
- GH-123474: Suporte ao editor Android XR e Google Play Store.
- GH-123320: Otimização do realce de sintaxe em GDScript.`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(docMarkdown).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        });
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = docMarkdown;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 font-sans select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#161a1e] border border-[#3b4754] rounded-lg shadow-2xl text-stone-200 overflow-hidden">
        {/* Header - Military Manual Plaque */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111417] border-b border-[#2d3640]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wider uppercase text-white font-mono">
                  {isPt ? 'Central de Documentação & Manual Operacional' : 'Documentation Center & Field Manual'}
                </span>
                <span className="bg-amber-950/80 text-amber-300 border border-amber-600/60 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  [D] ATALHO
                </span>
                <span className="hidden sm:inline bg-stone-800 text-stone-300 border border-stone-600 text-[10px] font-mono px-2 py-0.5 rounded">
                  QG 11ª DIV · 1916
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {isPt
                  ? 'Dossiê Oficial Completo · 4 Dificuldades · Regras de Combate · Godot 4.8 dev 6'
                  : 'Complete Official Dossier · 4 Difficulties · Combat Mechanics · Godot 4.8 dev 6'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Documentation Button */}
            <button
              onClick={handleCopyDocumentation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition cursor-pointer border ${
                copied
                  ? 'bg-emerald-900/80 border-emerald-500 text-emerald-200'
                  : 'bg-stone-800/90 hover:bg-stone-700 border-stone-600 text-stone-300'
              }`}
              title="Copiar documentação completa para área de transferência"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? (isPt ? 'COPIADO!' : 'COPIED!') : (isPt ? 'Copiar Doc (MD)' : 'Copy Doc (MD)')}</span>
            </button>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1.5 rounded hover:bg-stone-800 transition cursor-pointer"
              aria-label="Fechar Manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#2d3640] bg-[#14181c] px-4 overflow-x-auto text-xs font-medium scrollbar-thin">
          <button
            onClick={() => setActiveTab('difficulties')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'difficulties'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isPt ? '1. Níveis de Dificuldade' : '1. Difficulty Levels'}</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isPt ? '2. Arquitetura & Fórmulas' : '2. Architecture & Formulas'}</span>
          </button>

          <button
            onClick={() => setActiveTab('doctrine')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'doctrine'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isPt ? '3. Doutrina & Cobertura' : '3. Doctrine & Cover'}</span>
          </button>

          <button
            onClick={() => setActiveTab('squad')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'squad'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isPt ? '4. Esquadrão Aliado' : '4. Allied Squad'}</span>
          </button>

          <button
            onClick={() => setActiveTab('threats')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'threats'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isPt ? '5. Ameaças Inimigas' : '5. Enemy Threats'}</span>
          </button>

          <button
            onClick={() => setActiveTab('controls')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'controls'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{isPt ? '6. Teclas & Atalhos' : '6. Controls & Keys'}</span>
          </button>

          <button
            onClick={() => setActiveTab('godot')}
            className={`py-3 px-3.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'godot'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isPt ? '7. Godot 4.8 SSCS' : '7. Godot 4.8 SSCS'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed">
          {/* TAB 1: DIFFICULTIES */}
          {activeTab === 'difficulties' && (
            <div className="space-y-4">
              <div className="bg-[#121518] p-4 rounded-lg border border-stone-800">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-amber-300 font-mono tracking-wide uppercase">
                    {isPt ? 'Quatro Níveis de Dificuldade Rigorosamente Calibrados' : 'Four Rigorously Calibrated Difficulty Levels'}
                  </h3>
                  <span className="text-[11px] font-mono text-stone-400">
                    {isPt ? 'Selecionado:' : 'Active:'}{' '}
                    <strong className="text-amber-400">
                      {DIFFICULTY_PRESETS[currentDifficulty][isPt ? 'namePt' : 'nameEn']}
                    </strong>
                  </span>
                </div>
                <p className="text-stone-300 text-xs">
                  {isPt
                    ? 'Cada nível calibra a letalidade balística, o tempo de resposta da artilharia, a quantidade de munição inicial e a presença de fogos de contra-bateria inimiga. Clique em "ESCOLHER" em qualquer cartão para alterar instantaneamente a dificuldade da partida.'
                    : 'Each difficulty scales bullet lethality, artillery response timers, starting ammunition, and incoming enemy mortar counter-battery strikes. Click "SELECT" on any card to update game difficulty.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Fácil */}
                <div
                  className={`p-4 rounded-lg border transition ${
                    currentDifficulty === 'facil'
                      ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/50'
                      : 'bg-[#14181c] border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <h4 className="font-bold text-sm text-emerald-300 font-mono">
                        {DIFFICULTY_PRESETS.facil.namePt}
                      </h4>
                    </div>
                    {onSelectDifficulty && (
                      <button
                        onClick={() => onSelectDifficulty('facil')}
                        className={`text-[11px] px-2.5 py-1 rounded font-mono font-semibold transition cursor-pointer ${
                          currentDifficulty === 'facil'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                        }`}
                      >
                        {currentDifficulty === 'facil' ? (isPt ? 'SELECIONADO' : 'ACTIVE') : (isPt ? 'ESCOLHER' : 'SELECT')}
                      </button>
                    )}
                  </div>
                  <p className="text-stone-300 mb-2.5 text-xs">
                    {isPt ? DIFFICULTY_PRESETS.facil.descriptionPt : DIFFICULTY_PRESETS.facil.descriptionEn}
                  </p>
                  <div className="space-y-1 text-[11px] text-stone-400 font-mono bg-[#101215] p-2.5 rounded border border-stone-800/80">
                    <p>• {isPt ? 'Dano sofrido: -30% (multiplicador 0.70x)' : 'Damage taken: -30% (0.70x multiplier)'}</p>
                    <p>• {isPt ? 'Dano causado: +35% (letalidade aumentada)' : 'Damage dealt: +35% (higher lethality)'}</p>
                    <p>• {isPt ? 'Obus de artilharia: recarga rápida em 8.0s' : 'Artillery strike: fast 8.0s recharge'}</p>
                    <p>• {isPt ? 'Munição inicial: +50% reservas' : 'Starting ammo: +50% reserve'}</p>
                    <p>• {isPt ? 'Contra-bateria inimiga: Desativada' : 'Enemy mortar counter-fire: Disabled'}</p>
                  </div>
                  <p className="mt-2 text-[10px] text-emerald-400/90 italic">
                    {isPt ? 'Dica: Ideal para focar na história e testar as sombras SSCS do Godot 4.8.' : 'Tip: Ideal for story focus and trying Godot 4.8 SSCS shadows.'}
                  </p>
                </div>

                {/* 2. Médio */}
                <div
                  className={`p-4 rounded-lg border transition ${
                    currentDifficulty === 'medio'
                      ? 'bg-sky-950/30 border-sky-500 ring-1 ring-sky-500/50'
                      : 'bg-[#14181c] border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      <h4 className="font-bold text-sm text-sky-300 font-mono">
                        {DIFFICULTY_PRESETS.medio.namePt}
                      </h4>
                    </div>
                    {onSelectDifficulty && (
                      <button
                        onClick={() => onSelectDifficulty('medio')}
                        className={`text-[11px] px-2.5 py-1 rounded font-mono font-semibold transition cursor-pointer ${
                          currentDifficulty === 'medio'
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                        }`}
                      >
                        {currentDifficulty === 'medio' ? (isPt ? 'SELECIONADO' : 'ACTIVE') : (isPt ? 'ESCOLHER' : 'SELECT')}
                      </button>
                    )}
                  </div>
                  <p className="text-stone-300 mb-2.5 text-xs">
                    {isPt ? DIFFICULTY_PRESETS.medio.descriptionPt : DIFFICULTY_PRESETS.medio.descriptionEn}
                  </p>
                  <div className="space-y-1 text-[11px] text-stone-400 font-mono bg-[#101215] p-2.5 rounded border border-stone-800/80">
                    <p>• {isPt ? 'Calibração histórica autêntica (1.00x)' : 'Authentic historical calibration (1.00x)'}</p>
                    <p>• {isPt ? '20 dias completos de atrito em Flandres' : 'Full 20-day attrition campaign in Flanders'}</p>
                    <p>• {isPt ? 'Recarga da artilharia pesada: 12.0s' : 'Artillery strike recharge: 12.0s'}</p>
                    <p>• {isPt ? 'Cadência padrão de tropas de choque' : 'Standard wave cadence of shock troops'}</p>
                  </div>
                  <p className="mt-2 text-[10px] text-sky-400/90 italic">
                    {isPt ? 'Dica: Posicione o metralhador no centro para supressão contínua.' : 'Tip: Station the Lewis gunner at center for continuous suppression.'}
                  </p>
                </div>

                {/* 3. Difícil */}
                <div
                  className={`p-4 rounded-lg border transition ${
                    currentDifficulty === 'dificil'
                      ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/50'
                      : 'bg-[#14181c] border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <h4 className="font-bold text-sm text-amber-300 font-mono">
                        {DIFFICULTY_PRESETS.dificil.namePt}
                      </h4>
                    </div>
                    {onSelectDifficulty && (
                      <button
                        onClick={() => onSelectDifficulty('dificil')}
                        className={`text-[11px] px-2.5 py-1 rounded font-mono font-semibold transition cursor-pointer ${
                          currentDifficulty === 'dificil'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                        }`}
                      >
                        {currentDifficulty === 'dificil' ? (isPt ? 'SELECIONADO' : 'ACTIVE') : (isPt ? 'ESCOLHER' : 'SELECT')}
                      </button>
                    )}
                  </div>
                  <p className="text-stone-300 mb-2.5 text-xs">
                    {isPt ? DIFFICULTY_PRESETS.dificil.descriptionPt : DIFFICULTY_PRESETS.dificil.descriptionEn}
                  </p>
                  <div className="space-y-1 text-[11px] text-stone-400 font-mono bg-[#101215] p-2.5 rounded border border-stone-800/80">
                    <p>• {isPt ? 'Dano sofrido: +30% letalidade (1.30x)' : 'Damage taken: +30% lethality (1.30x)'}</p>
                    <p>• {isPt ? 'Velocidade inimiga: +15% aceleração' : 'Enemy advance speed: +15%'}</p>
                    <p>• {isPt ? 'Munição inicial: -15% racionada' : 'Starting ammo: -15% rationed'}</p>
                    <p>• {isPt ? 'Contra-bateria ativa: morteiros caem na trincheira!' : 'Counter-battery active: mortar shells hit trenches!'}</p>
                    <p>• {isPt ? 'Perda de companheiros abala mais a moral (-35%)' : 'Casualties severely impact morale (-35%)'}</p>
                  </div>
                  <p className="mt-2 text-[10px] text-amber-400/90 italic">
                    {isPt ? 'Dica: Agache imediatamente com [C] ao ouvir o silvo do morteiro.' : 'Tip: Duck immediately with [C] when the mortar screech sounds.'}
                  </p>
                </div>

                {/* 4. Hard Master */}
                <div
                  className={`p-4 rounded-lg border transition ${
                    currentDifficulty === 'hard_master'
                      ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500/50'
                      : 'bg-[#14181c] border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <h4 className="font-bold text-sm text-red-400 font-mono tracking-wider">
                        {DIFFICULTY_PRESETS.hard_master.namePt}
                      </h4>
                    </div>
                    {onSelectDifficulty && (
                      <button
                        onClick={() => onSelectDifficulty('hard_master')}
                        className={`text-[11px] px-2.5 py-1 rounded font-mono font-semibold transition cursor-pointer ${
                          currentDifficulty === 'hard_master'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                        }`}
                      >
                        {currentDifficulty === 'hard_master' ? (isPt ? 'SELECIONADO' : 'ACTIVE') : (isPt ? 'ESCOLHER' : 'SELECT')}
                      </button>
                    )}
                  </div>
                  <p className="text-stone-300 mb-2.5 text-xs">
                    {isPt ? DIFFICULTY_PRESETS.hard_master.descriptionPt : DIFFICULTY_PRESETS.hard_master.descriptionEn}
                  </p>
                  <div className="space-y-1 text-[11px] text-red-300/90 font-mono bg-[#1a0f12] p-2.5 rounded border border-red-900/60">
                    <p>• {isPt ? 'Letalidade implacável: +70% dano sofrido (1.70x)' : 'Extreme lethality: +70% damage taken (1.70x)'}</p>
                    <p>• {isPt ? 'Munição severamente racionada (-35%)' : 'Severely rationed ammunition (-35%)'}</p>
                    <p>• {isPt ? 'Artilharia pesada: 18.0s de recarga' : 'Heavy artillery: 18.0s recharge timer'}</p>
                    <p>• {isPt ? 'Barragens contínuas de morteiros pesados' : 'Constant heavy mortar barrages on player positions'}</p>
                    <p>• {isPt ? 'Queda psicológica brutal (-50% moral por baixa)' : 'Severe psychological drop (-50% morale per casualty)'}</p>
                  </div>
                  <p className="mt-2 text-[10px] text-red-400 font-bold uppercase tracking-wider">
                    {isPt ? '🏆 Recompensa: Vitória concede Rank "S" com Distinção Militar Suprema.' : '🏆 Reward: Victory awards Rank "S" with Supreme Military Distinction.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & FORMULAS */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800 space-y-2">
                <h3 className="text-sm font-bold text-amber-300 font-mono uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>{isPt ? 'Arquitetura do Sistema & Modelos Matemáticos' : 'System Architecture & Mathematical Models'}</span>
                </h3>
                <p className="text-stone-300 text-xs">
                  {isPt
                    ? 'A simulação é desacoplada entre regras lógicas puras (TypeScript testável em src/game/combatRules.ts) e o motor de renderização 3D (Three.js em src/game/sceneManager.ts). Todas as interações balísticas e explosões obedecem a equações determinísticas.'
                    : 'The simulation is decoupled between pure logic rules (testable TypeScript in src/game/combatRules.ts) and 3D rendering engine (Three.js in src/game/sceneManager.ts). All ballistic interactions follow deterministic equations.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-200 text-xs font-mono text-sky-400">
                    {isPt ? '1. Fórmula de Dano Balístico' : '1. Ballistic Damage Formula'}
                  </h4>
                  <div className="bg-[#101215] p-3 rounded font-mono text-[11px] text-stone-300">
                    <p>Dano_Final = Dano_Base × Mult_Dificuldade × Mult_Cobertura</p>
                    <p className="mt-1 text-stone-400">• Mult_Cobertura = 0.60 (se Z ≤ 7.5)</p>
                    <p className="text-stone-400">• Mult_Dificuldade = 0.70 (Fácil) a 1.70 (Hard Master)</p>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    {isPt
                    ? 'Soldados no parapeito têm 50% de chance a menos de serem atingidos e sofrem 40% a menos de dano quando o tiro penetra a proteção.'
                    : 'Parapet cover grants 50% less chance of being hit and 40% damage reduction when penetrated.'}
                  </p>
                </div>

                <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-200 text-xs font-mono text-amber-400">
                    {isPt ? '2. Atenuação Radial do Obus (Artilharia)' : '2. Artillery Radial Falloff'}
                  </h4>
                  <div className="bg-[#101215] p-3 rounded font-mono text-[11px] text-stone-300">
                    <p>Dano_Explosao = Dano_Max × (1.0 - Distancia / Raio_Impacto)</p>
                    <p className="mt-1 text-stone-400">• Raio_Impacto = 5.0 metros</p>
                    <p className="text-stone-400">• Dano_Max = 120 HP (centro do impacto)</p>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    {isPt
                    ? 'Inimigos no centro da explosão sofrem dano fatal imediato. Inimigos na borda recebem abalo de moral e desaceleração.'
                    : 'Enemies at epicenter take instant fatal damage; peripheral enemies take partial damage and heavy morale suppression.'}
                  </p>
                </div>

                <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-200 text-xs font-mono text-emerald-400">
                    {isPt ? '3. Dinâmica de Moral & Supressão' : '3. Morale & Suppression Dynamics'}
                  </h4>
                  <div className="bg-[#101215] p-3 rounded font-mono text-[11px] text-stone-300">
                    <p>Moral_Delta = Aura_Cabo (+6) - Baixa_Companheiro (-15% a -50%)</p>
                    <p className="mt-1 text-stone-400">• Se Moral &lt; 30%: Tremores e -30% precisão</p>
                    <p className="text-stone-400">• Paramédico [R]: +20 Moral restaurada</p>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    {isPt
                    ? 'Manter o esquadrão coeso e próximo ao Cabo Price impede que os soldados entrem em pânico durante bombardeios.'
                    : 'Keeping troops clustered near Corporal Price prevents panic and combat breakdown.'}
                  </p>
                </div>

                <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800 space-y-2">
                  <h4 className="font-bold text-stone-200 text-xs font-mono text-red-400">
                    {isPt ? '4. Critério de Vitória & Ranks' : '4. Victory Criteria & Ranks'}
                  </h4>
                  <div className="bg-[#101215] p-3 rounded font-mono text-[11px] text-stone-300">
                    <p>Sobreviventes = Soldados_Vivos / 4</p>
                    <p className="mt-1 text-stone-400">• Hard Master + Sobreviventes ≥ 50% = Rank S</p>
                    <p className="text-stone-400">• Sobreviventes ≥ 75% = Rank A</p>
                    <p className="text-stone-400">• Sobreviventes ≥ 50% = Rank B (Perdas Aceitáveis)</p>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    {isPt
                    ? 'A doutrina de "Perdas Aceitáveis" considera vitória se pelo menos metade da guarnição resistir até o 20º dia.'
                    : 'The "Acceptable Losses" doctrine awards victory if at least 50% of the garrison survives the 20 days.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCTRINE */}
          {activeTab === 'doctrine' && (
            <div className="space-y-4">
              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800 space-y-2">
                <h3 className="text-sm font-bold text-amber-300 font-mono uppercase">
                  {isPt ? '1. O Conceito Histórico de Perdas Aceitáveis' : '1. The Historical Concept of Acceptable Losses'}
                </h3>
                <p className="text-stone-300 text-xs">
                  {isPt
                    ? 'Na guerra de trincheiras de 1916 em Flandres, o Alto Comando não esperava sobrevivência imaculada: a ordem era segurar a linha contra a ofensiva alemã durante 20 dias a qualquer custo. Concluir a campanha com mais de 50% da unidade em pé é classificado como Vitória Tática com Perdas Aceitáveis.'
                    : 'In the Flanders trench warfare of 1916, High Command did not expect zero casualties: the order was to hold the trench against the German offensive for 20 days at all costs. Finishing with over 50% of the unit standing qualifies as a Tactical Victory with Acceptable Losses.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                  <h4 className="font-bold text-stone-200 text-xs flex items-center gap-2 mb-2 font-mono">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>{isPt ? 'Cobertura de Sacos de Areia' : 'Sandbag Parapet Cover'}</span>
                  </h4>
                  <p className="text-stone-300 text-xs mb-2">
                    {isPt
                      ? 'Soldados posicionados atrás do parapeito (Z <= 7.5) recebem proteção física: 40% de redução de dano direto e 50% de redução na chance de acerto inimigo.'
                      : 'Soldiers stationed behind the parapet (Z <= 7.5) gain physical protection: 40% direct damage reduction and 50% lower chance of enemy hits.'}
                  </p>
                  <span className="text-[11px] font-mono text-sky-400">
                    {isPt ? 'Status visual: Ícone de escudo azul no HUD' : 'Visual clue: Blue shield icon on soldier card'}
                  </span>
                </div>

                <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                  <h4 className="font-bold text-stone-200 text-xs flex items-center gap-2 mb-2 font-mono">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{isPt ? 'Agachar na Trincheira [C]' : 'Trench Duck [C]'}</span>
                  </h4>
                  <p className="text-stone-300 text-xs mb-2">
                    {isPt
                      ? 'Quando o silvo de artilharia inimiga soar, ordene agachamento (`[C]`). Os soldados deitam no assoalho de madeira, reduzindo drasticamente os estilhaços de explosões radiais.'
                      : 'When enemy mortar incoming screeches, order soldiers to duck (`[C]`). They crouch low on duckboards, heavily mitigating shrapnel damage.'}
                  </p>
                  <span className="text-[11px] font-mono text-amber-400">
                    {isPt ? 'Atalho: Tecla C ou botão de cobertura' : 'Shortcut: Key C or cover button'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALLIED SQUAD */}
          {activeTab === 'squad' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                <span className="font-mono text-amber-400 text-xs font-bold">[1] CABO ARTHUR PRICE</span>
                <p className="text-stone-200 font-semibold text-xs mt-1">Líder do Esquadrão · Lee-Enfield Mk III</p>
                <p className="text-stone-400 text-xs mt-1">
                  {isPt
                    ? 'Mantém a moral da guarnição elevada através de sua aura de liderança (+6 moral por turno para aliados próximos). Dispara com rifle por ação de ferrolho com alta cadência.'
                    : 'Maintains squad morale through leadership aura (+6 morale per turn to nearby comrades). Rapid bolt-action rifle fire.'}
                </p>
              </div>

              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                <span className="font-mono text-amber-400 text-xs font-bold">[2] SOLDADO THOMAS MILLER</span>
                <p className="text-stone-200 font-semibold text-xs mt-1">Fuzileiro de Precisão · Fuzil & Baioneta</p>
                <p className="text-stone-400 text-xs mt-1">
                  {isPt
                    ? 'Atirador disciplinado com 85% de precisão base. Capaz de abater recrutas e tropas de choque antes de alcançarem o arame farpado.'
                    : 'Disciplined rifleman with 85% base accuracy. Ideal for taking down incoming shock troops before they breach barbed wire.'}
                </p>
              </div>

              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                <span className="font-mono text-amber-400 text-xs font-bold">[3] ATIRADOR EDWARD VANCE</span>
                <p className="text-stone-200 font-semibold text-xs mt-1">Metralhador Pesado · Metralhadora Lewis (Pan Magazine)</p>
                <p className="text-stone-400 text-xs mt-1">
                  {isPt
                    ? 'Arma automática com tambor de 47 tiros. Dispara rajadas contínuas de fogo de supressão, prendendo inimigos na lama e desacelerando seu avanço.'
                    : 'Automatic gun with top drum magazine. Rapid suppressive fire bursts that pin enemy units in the mud and halt charges.'}
                </p>
              </div>

              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                <span className="font-mono text-amber-400 text-xs font-bold">[4] PARAMÉDICO GEORGE BAILEY</span>
                <p className="text-stone-200 font-semibold text-xs mt-1">Médico de Combate · Bolsa da Cruz Vermelha [R]</p>
                <p className="text-stone-400 text-xs mt-1">
                  {isPt
                    ? 'Estabiliza ferimentos com ataduras de campo, restaurando +35 HP e +20 de moral para todo o esquadrão ferido na trincheira.'
                    : 'Applies field dressings to stabilize wounds, restoring +35 HP and +20 morale to wounded comrades in the trench.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: ENEMY THREATS */}
          {activeTab === 'threats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-200 text-xs font-mono">RECRUTAS DE INFANTARIA (CONSCRIPTS)</h4>
                  <span className="text-[10px] font-mono text-stone-400">HP 45</span>
                </div>
                <p className="text-stone-400 text-xs mt-1.5">
                  {isPt
                    ? 'Avançam em ondas contínuas armados com fuzis Gewehr 98. Vulneráveis a disparos concentrados e artilharia de obus.'
                    : 'Advance in swarming waves armed with Gewehr 98 rifles. Easily neutralized by artillery and Lewis gun bursts.'}
                </p>
              </div>

              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-400 text-xs font-mono">STURMTRUPPEN (TROPAS DE CHOQUE)</h4>
                  <span className="text-[10px] font-mono text-amber-400">HP 65 · VEL 1.9</span>
                </div>
                <p className="text-stone-400 text-xs mt-1.5">
                  {isPt
                    ? 'Infanteristas de elite que correm em zigue-zague com granadas de cabo Stielhandgranate. Alta prioridade de alvo!'
                    : 'Elite trench raiders charging with stick grenades. High movement speed; prioritize fire before they reach the parapet.'}
                </p>
              </div>

              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-red-400 text-xs font-mono">FLAMMENWERFER (LANÇA-CHAMAS)</h4>
                  <span className="text-[10px] font-mono text-red-400">HP 110 · BLINDADO</span>
                </div>
                <p className="text-stone-400 text-xs mt-1.5">
                  {isPt
                    ? 'Equipados com tanques duplos de combustível e couraça de aço. Exibem um anel de telégrafo vermelho antes de disparar jato devastador de fogo.'
                    : 'Heavy armored troopers with fuel tanks on their back. Displays an attack windup telegraph ring before spewing flame cones.'}
                </p>
              </div>

              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sky-400 text-xs font-mono">SCHARFSCHÜTZE (SNIPER)</h4>
                  <span className="text-[10px] font-mono text-sky-400">ALCANCE 22m</span>
                </div>
                <p className="text-stone-400 text-xs mt-1.5">
                  {isPt
                    ? 'Ficam agachados próximos a crateras distantes e miram soldados que saem da cobertura. Dano crítico elevado.'
                    : 'Crouches near distant shell craters, taking high-damage potshots at soldiers in the open. Neutralize with artillery.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: CONTROLS */}
          {activeTab === 'controls' && (
            <div className="space-y-3">
              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-800 text-amber-400 font-mono">
                      <th className="pb-2">{isPt ? 'Comando / Tecla' : 'Command / Key'}</th>
                      <th className="pb-2">{isPt ? 'Ação Tática' : 'Tactical Action'}</th>
                      <th className="pb-2">{isPt ? 'Efeito no Jogo' : 'Gameplay Effect'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-mono text-stone-300">
                    <tr className="bg-amber-500/10">
                      <td className="py-2.5 text-amber-300 font-bold">[D]</td>
                      <td className="text-white font-bold">{isPt ? 'Central de Documentação' : 'Documentation Center'}</td>
                      <td>{isPt ? 'Abre este dossiê completo a qualquer instante' : 'Opens this comprehensive dossier anytime'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-white font-bold">[1] [2] [3] [4]</td>
                      <td>{isPt ? 'Selecionar Soldado' : 'Select Soldier'}</td>
                      <td>Cabo, Fuzileiro, Metralhador ou Médico</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-white font-bold">W, A, S, D / Setas</td>
                      <td>{isPt ? 'Mover Câmera' : 'Pan Camera'}</td>
                      <td>Navega pela trincheira e Terra de Ninguém</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-white font-bold">{isPt ? 'Clique no Chão' : 'Click Ground'}</td>
                      <td>{isPt ? 'Reposicionar Soldado' : 'Move Soldier'}</td>
                      <td>Ordena deslocamento ao longo da trincheira</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-amber-300 font-bold">[Espaço]</td>
                      <td>{isPt ? 'Obus de Artilharia' : 'Artillery Strike'}</td>
                      <td>Ativa anel de mira para disparar projétil explosivo</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-emerald-300 font-bold">[R]</td>
                      <td>{isPt ? 'Curativo Médico' : 'First Aid'}</td>
                      <td>Cura ferimentos de todo o esquadrão próximo</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-sky-300 font-bold">[C]</td>
                      <td>{isPt ? 'Agachar / Cobertura' : 'Duck / Cover'}</td>
                      <td>Abaixa os soldados contra estilhaços e morteiros</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-white font-bold">[G]</td>
                      <td>{isPt ? 'Inspetor Godot 4.8' : 'Godot 4.8 Drawer'}</td>
                      <td>Abre slider de sombras SSCS e changelog</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-white font-bold">[Esc] ou [P]</td>
                      <td>{isPt ? 'Pausar Jogo' : 'Pause Game'}</td>
                      <td>Congela simulação e abre menu tático</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-white font-bold">[M]</td>
                      <td>{isPt ? 'Alternar Áudio' : 'Toggle Mute'}</td>
                      <td>Silencia ou liga efeitos sonoros procedurais</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: GODOT SSCS */}
          {activeTab === 'godot' && (
            <div className="space-y-4">
              <div className="bg-[#14181c] p-4 rounded-lg border border-stone-800 space-y-2">
                <h3 className="text-sm font-bold text-sky-400 font-mono flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  <span>Godot Engine 4.8 dev 6 · Screen-Space Contact Shadows</span>
                </h3>
                <p className="text-stone-300 text-xs">
                  {isPt
                    ? 'A versão 4.8 dev 6 do motor Godot introduziu as sombras de contato em espaço de tela (SSCS) para luzes direcionais, desenvolvidas por Rudolph Bester utilizando a abordagem do Bend Studios (GH-118045). O recurso gera uma textura de oclusão de contato R8 em tempo real mesclada com shadow maps convencionais, fornecendo profundidade nas ranhuras de capacetes e sacos de areia.'
                    : 'Godot 4.8 dev 6 introduced screen-space contact shadows (SSCS) for directional lights, created by Rudolph Bester using Bend Studios\' technique (GH-118045). It generates an R8 contact shadow texture blended with standard shadow maps for rich crevice depth without framerate hits.'}
                </p>
              </div>

              <div className="bg-[#121518] p-3.5 rounded border border-stone-800 text-[11px] text-stone-400 font-mono space-y-1">
                <p>• GH-118045: Screen-space contact shadows for directional lights (Rudolph Bester / Bend Studios)</p>
                <p>• GH-121065: Clean and simplify 3D toolbar (Jayden Sipe)</p>
                <p>• GH-123320: GDScript syntax highlighting performance boost</p>
                <p>• GH-123439: macOS Metal initialization crash fix</p>
                <p>• GH-123474: Android XR export and Google Play Store fix</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#111417] border-t border-[#2d3640] flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyDocumentation}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-mono cursor-pointer transition text-[11px]"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? (isPt ? 'Documentação Copiada!' : 'Documentation Copied!') : (isPt ? 'Copiar Documentação (Markdown)' : 'Copy Documentation (Markdown)')}</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="bg-amber-700 hover:bg-amber-600 text-stone-100 px-5 py-2 rounded text-xs font-bold transition cursor-pointer"
          >
            {isPt ? 'FECHAR MANUAL [ESC]' : 'CLOSE MANUAL [ESC]'}
          </button>
        </div>
      </div>
    </div>
  );
};
