import React, { useState } from 'react';
import {
  X,
  Layers,
  Sun,
  Eye,
  ExternalLink,
  Heart,
  CheckCircle2,
  Bug,
  Sparkles,
  MousePointer,
  Move,
  RotateCw,
  Maximize2,
} from 'lucide-react';
import { GodotEngineSettings } from '../game/types';

interface GodotDevDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GodotEngineSettings;
  onUpdateSettings: (settings: Partial<GodotEngineSettings>) => void;
  lang: 'pt' | 'en';
}

export const GodotDevDrawer: React.FC<GodotDevDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'sscs' | 'toolbar' | 'changelog' | 'download'>('sscs');
  const isPt = lang === 'pt';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#1e2227] border border-[#3b434d] rounded-lg shadow-2xl text-stone-200 overflow-hidden font-sans">
        {/* Header styled like Godot 4.8 Engine Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#171a1e] border-b border-[#303740]">
          <div className="flex items-center gap-2.5">
            {/* Godot Logo Icon inline */}
            <svg className="w-6 h-6 text-[#478cbf]" viewBox="0 0 48 48" fill="currentColor">
              <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-7 13a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm14 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm-7 11c5.52 0 10 2.24 10 5H14c0-2.76 4.48-5 10-5z" />
            </svg>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-white">Godot Engine 4.8 dev 6</span>
                <span className="bg-sky-950 text-sky-400 border border-sky-700/60 text-[10px] font-mono px-1.5 py-0.5 rounded">
                  {isPt ? 'Pré-lançamento' : 'Pre-release'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                {isPt ? 'Por Thaddeus Crews · 15 de setembro de 2026' : 'By Thaddeus Crews · September 15, 2026'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#2d343c] bg-[#1a1e23] px-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('sscs')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sscs'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>{isPt ? 'Sombras SSCS' : 'SSCS Shadows'}</span>
          </button>

          <button
            onClick={() => setActiveTab('toolbar')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'toolbar'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isPt ? 'Barra 3D Refatorada' : 'Clean 3D Toolbar'}</span>
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'changelog'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPt ? 'Destaques e Correções' : 'Highlights & Fixes'}</span>
          </button>

          <button
            onClick={() => setActiveTab('download')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'download'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Downloads & Zann Archive</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed">
          {activeTab === 'sscs' && (
            <div className="space-y-4">
              <div className="bg-[#15191d] border border-[#2b333c] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>
                      {isPt
                        ? 'Sombras de contato em espaço de tela para luzes direcionais (SSCS)'
                        : 'Screen-space contact shadows for directional lights (SSCS)'}
                    </span>
                  </h3>
                  <span className="font-mono text-[11px] text-sky-400">GH-118045</span>
                </div>

                <p className="text-stone-300 mb-3">
                  {isPt
                    ? 'Implementado por Rudolph Bester usando a abordagem da Bend Studios. Cria uma textura de sombra R8 para cada luz direcional na cena e a mescla com os shadow maps existentes. Resulta em sombras de contato profundas em capacetes, sacos de areia e fendas na lama sem comprometer a taxa de quadros.'
                    : 'Implemented by Rudolph Bester using Bend Studios\' approach. Creates an R8 shadow texture for each directional light and blends it with shadow maps, giving tight grounding shadows on helmets, sandbags, and trench crevices at high 60fps performance.'}
                </p>

                {/* Interactive Controls */}
                <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-stone-300">
                      {isPt ? 'Estado do Recurso:' : 'Feature State:'}
                    </span>
                    <button
                      onClick={() => onUpdateSettings({ sscsEnabled: !settings.sscsEnabled })}
                      className={`px-3 py-1.5 rounded font-mono font-bold transition cursor-pointer text-xs ${
                        settings.sscsEnabled
                          ? 'bg-sky-600 hover:bg-sky-500 text-white shadow'
                          : 'bg-stone-700 hover:bg-stone-600 text-stone-300'
                      }`}
                    >
                      {settings.sscsEnabled
                        ? (isPt ? 'Ativado (Enabled)' : 'Enabled')
                        : (isPt ? 'Desativado (Disabled)' : 'Disabled')}
                    </button>
                  </div>

                  {/* Intensity slider */}
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">{isPt ? 'Intensidade:' : 'Intensity:'}</span>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={settings.sscsIntensity}
                      onChange={(e) => onUpdateSettings({ sscsIntensity: parseFloat(e.target.value) })}
                      disabled={!settings.sscsEnabled}
                      className="cursor-pointer accent-sky-400 w-28"
                    />
                    <span className="font-mono text-stone-300 w-8 text-right">
                      {Math.round(settings.sscsIntensity * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Wireframe toggle */}
              <div className="flex items-center justify-between bg-[#15191d] border border-[#2b333c] p-3.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span className="font-medium text-stone-200">
                    {isPt ? 'Modo Aramado / Wireframe da Trincheira' : 'Trench Wireframe Inspection Mode'}
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ wireframe: !settings.wireframe })}
                  className={`px-3 py-1 rounded text-xs font-mono transition cursor-pointer ${
                    settings.wireframe ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {settings.wireframe ? (isPt ? 'Ligado' : 'On') : (isPt ? 'Desligado' : 'Off')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'toolbar' && (
            <div className="space-y-4">
              <div className="bg-[#15191d] border border-[#2b333c] p-4 rounded-lg">
                <h3 className="text-sm font-bold text-white mb-2">
                  {isPt ? 'Editor: Limpar e simplificar a barra de ferramentas 3D' : 'Editor: Clean and simplify 3D toolbar'}
                </h3>
                <p className="text-stone-300 mb-3">
                  {isPt
                    ? 'A terceira entrada na trilogia de modernização de Jayden Sipe chegou com a atualização GH-121065. Assim como as barras 2D e de incorporação, a barra 3D enfatiza a clareza visual e usabilidade.'
                    : 'The third entry in Jayden Sipe\'s toolbar overhauls arrived with GH-121065. The 3D toolbar has been given a fresh coat of paint, emphasizing visual clarity and usability.'}
                </p>

                {/* Godot 4.8 3D Toolbar Simulation */}
                <div className="bg-[#242930] border border-[#3c4652] p-2 rounded flex items-center gap-2 w-fit">
                  <button
                    onClick={() => onUpdateSettings({ godotToolbarMode: 'select' })}
                    className={`p-1.5 rounded transition ${
                      settings.godotToolbarMode === 'select' ? 'bg-[#478cbf] text-white' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Select Mode (Q)"
                  >
                    <MousePointer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ godotToolbarMode: 'move' })}
                    className={`p-1.5 rounded transition ${
                      settings.godotToolbarMode === 'move' ? 'bg-[#478cbf] text-white' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Move Mode (W)"
                  >
                    <Move className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ godotToolbarMode: 'rotate' })}
                    className={`p-1.5 rounded transition ${
                      settings.godotToolbarMode === 'rotate' ? 'bg-[#478cbf] text-white' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Rotate Mode (E)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ godotToolbarMode: 'scale' })}
                    className={`p-1.5 rounded transition ${
                      settings.godotToolbarMode === 'scale' ? 'bg-[#478cbf] text-white' : 'text-stone-400 hover:text-white'
                    }`}
                    title="Scale Mode (R)"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="space-y-3">
              <div className="bg-[#15191d] border border-[#2b333c] p-3 rounded">
                <span className="font-mono text-sky-400 font-bold">28 colaboradores · 56 correções</span>
                <p className="text-stone-400 text-[11px] mt-0.5">Commit 8898c2b3d</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 bg-[#181c20] p-2.5 rounded border border-stone-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-200">GDScript:</span>
                    <span className="text-stone-300 ml-1">
                      {isPt
                        ? 'Melhoria no desempenho para Syntax Highlighting (GH-123320)'
                        : 'Improve performance for Syntax Highlighting (GH-123320)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-[#181c20] p-2.5 rounded border border-stone-800">
                  <Bug className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-200">Rendering (Metal):</span>
                    <span className="text-stone-300 ml-1">
                      {isPt ? 'Correção de falha na inicialização no macOS (GH-123439)' : 'Fix crash on startup (GH-123439)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-[#181c20] p-2.5 rounded border border-stone-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-200">Platforms (Android XR):</span>
                    <span className="text-stone-300 ml-1">
                      {isPt
                        ? 'Pequenas correções para o editor Android XR e Google Play Store (GH-123474)'
                        : 'Minor bug fixes for Android XR and Google Play Store submission (GH-123474)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-[#181c20] p-2.5 rounded border border-stone-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-200">Thirdparty:</span>
                    <span className="text-stone-300 ml-1">Update SDL to 3.4.16 (GH-120373)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-4">
              {/* Acceptable Losses Tribute Box */}
              <div className="bg-amber-950/30 border border-amber-600/50 p-4 rounded-lg">
                <h3 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Acceptable Losses (Perdas Aceitáveis) - Zann Archive</span>
                </h3>
                <p className="text-stone-300 text-xs">
                  {isPt
                    ? 'A ilustração da capa desta versão é de Acceptable Losses, um jogo de comando e gerenciamento ambientado na Primeira Guerra Mundial, onde você lidera seus esquadrões em uma campanha curta, porém brutal, de 20 dias.'
                    : 'The cover illustration for this release is from Acceptable Losses, a WW1 command and squad management game where you lead your squads through a short yet brutal 20-day campaign.'}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <a
                    href="https://store.steampowered.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-amber-700 hover:bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
                  >
                    <span>Steam Demo & Game</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-[11px] text-stone-400">Bluesky & Discord @ZannArchive</span>
                </div>
              </div>

              {/* Godot Donation Fund */}
              <div className="bg-[#15191d] border border-sky-800/40 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-500 fill-current" />
                    <span>{isPt ? 'Apoie o Godot Development Fund' : 'Support Godot Development Fund'}</span>
                  </h4>
                  <p className="text-stone-400 text-[11px] mt-1">
                    {isPt
                      ? 'O Godot é mantido pelo trabalho de voluntários e colaboradores dedicados.'
                      : 'Godot is an open-source, non-profit engine funded by generous community donations.'}
                  </p>
                </div>
                <a
                  href="https://fund.godotengine.org"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-2 rounded transition flex items-center gap-1"
                >
                  <span>{isPt ? 'Fazer Doação' : 'Donate'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#171a1e] border-t border-[#303740] flex items-center justify-between text-[11px] text-stone-400">
          <span>Godot Foundation © 2007-2026 Juan Linietsky, Ariel Manzur & contributors</span>
          <button
            onClick={onClose}
            className="bg-stone-700 hover:bg-stone-600 text-white px-4 py-1.5 rounded text-xs font-medium transition cursor-pointer"
          >
            {isPt ? 'Fechar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
