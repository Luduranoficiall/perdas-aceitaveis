# Perdas Aceitáveis (Acceptable Losses) - Documentação Oficial & Manual Técnico

> **Godot Engine 4.8 dev 6 Showcase & Campanha Tática de Trincheiras da 1ª Guerra Mundial**  
> *Inspirado na obra de Zann Archive e nas inovações gráficas da versão Godot 4.8 dev 6*  
> **Classificação de Documento:** Dossiê Técnico e Operacional QG 11ª Divisão  
> **Versão:** 4.8.6-PROD · **Data de Publicação:** 15 de Setembro de 1916 / 2026

---

## Sumário Executivo

**Perdas Aceitáveis** é uma simulação de comando tático de esquadrão em 3D em tempo real, ambientada no setor lamacento de Flandres durante a Primeira Guerra Mundial (1916). O jogador assume a responsabilidade direta pelo destino da 11ª Companhia de Infantaria em uma brutal campanha de 20 dias, precisando administrar posições de tiro, munição racionada, moral das tropas, primeiros socorros de campo e suporte de artilharia pesada enquanto suporta ataques de tropas de choque e bombardeios de contra-bateria.

O software também atua como vitrine tecnológica das inovações anunciadas na versão **Godot Engine 4.8 dev 6**, destacando a técnica de **Sombras de Contato em Espaço de Tela (Screen-Space Contact Shadows - SSCS)** implementada por Rudolph Bester (baseada na arquitetura da Bend Studios, GH-118045), além da revisão ergonômica da barra de ferramentas 3D por Jayden Sipe (GH-121065).

---

## 1. Níveis de Dificuldade & Matriz de Balanceamento

O jogo oferece quatro níveis de dificuldade rigorosamente calibrados no arquivo `src/game/combatRules.ts`. Cada modo altera a letalidade balística, a velocidade das ondas inimigas, a escassez de munição, o tempo de resposta do obus de artilharia e a presença de fogos de contra-bateria inimiga:

| Parâmetro de Combate | Fácil (Recruta) | Médio (Veterano) | Difícil (Comandante) | Hard Master (Verdun) |
| :--- | :---: | :---: | :---: | :---: |
| **Multiplicador de Dano Sofrido** | **0.70x** (-30%) | **1.00x** (Padrão) | **1.30x** (+30%) | **1.70x** (+70%) |
| **Multiplicador de Dano Causado** | **1.35x** (+35%) | **1.00x** (Padrão) | **0.90x** (-10%) | **0.85x** (-15%) |
| **Reserva Inicial de Munição** | **1.50x** (+50%) | **1.00x** (Padrão) | **0.85x** (-15%) | **0.65x** (-35%) |
| **Recarga da Artilharia Pesada** | **8.0 segundos** | **12.0 segundos** | **15.0 segundos** | **18.0 segundos** |
| **Velocidade de Avanço Inimigo** | **0.85x** | **1.00x** | **1.15x** | **1.30x** |
| **Contra-bateria de Morteiros** | Desativada | Desativada | Ativa (Ocasional) | Ativa (Barragem Contínua) |
| **Perda de Moral por Baixa Aliada** | -15% | -25% | -35% | -50% |
| **Classificação Máxima de Vitória** | Rank B / A | Rank A | Rank A+ | **Rank S (Lenda de Flandres)** |

---

### Detalhamento dos Níveis de Dificuldade

#### 1. Nível Fácil: Recruta / Cadet
- **Perfil do Jogador:** Indicado para novos operadores que desejam apreciar a narrativa militar, a ambientação histórica e as técnicas de renderização SSCS sem estresse punitivo.
- **Mecânicas:**
  - Tolerância elevada a disparos: proteção natural de 30% em todo o esquadrão.
  - Artilharia de resposta rápida (recarga de 8 segundos) permite limpar grupos inteiros de recrutas inimigos na Terra de Ninguém.
  - Reservas abundantes de munição eliminam a necessidade de racionamento restrito.
  - Nenhuma artilharia inimiga atinge o setor do jogador.

#### 2. Nível Médio: Veterano da Frente Ocidental (Experiência Canônica)
- **Perfil do Jogador:** A experiência recomendada pelos desenvolvedores para vivenciar a campanha completa de 20 dias com tensão tática e ritmo histórico.
- **Mecânicas:**
  - Valores nominais de dano (1.0x).
  - Progressão balanceada: os primeiros dias permitem consolidação e aprendizado de posicionamento; a partir do dia 10, surgem unidades especializadas (Lança-chamas e Snipers).
  - Vitória concedida caso a linha de frente seja mantida até o 20º dia com taxa de sobrevivência compatível com perdas aceitáveis.

#### 3. Nível Difícil: Comandante de Trincheira (Hardcore)
- **Perfil do Jogador:** Estrategistas que exigem posicionamento milimétrico, microgerenciamento de cobertura e racionamento severo.
- **Mecânicas:**
  - Inimigos disparam com precisão cirúrgica e causam 30% a mais de dano.
  - Tropas de choque (*Sturmtruppen*) correm em ritmo acelerado, encurtando o tempo de reação do jogador.
  - **Contra-bateria Inimiga:** morteiros alemães começam a bombardear a trincheira defensiva. Círculos de perigo vermelhos pulsam no solo acompanhados de silvos estridentes de projéteis, forçando o jogador a pressionar `[C]` para que a tropa agache no assoalho e não seja aniquilada por estilhaços.

#### 4. Nível Hard Master: Verdun 1916 (Master Legend)
- **Perfil do Jogador:** O teste supremo de microcomando tático em alta pressão. Apenas comandantes veteranos conseguem sobreviver aos 20 dias.
- **Mecânicas & Desafios:**
  - **Letalidade Extrema:** Disparos inimigos causam +70% de dano. Um soldado exposto fora do parapeito tomba com apenas 2 a 3 impactos.
  - **Escassez de Projéteis:** A munição inicial é reduzida em 35%. Tiros disparados a esmo levam o esquadrão ao desespero e ao combate corpo a corpo iminente.
  - **Barragens Incessantes:** A contra-bateria inimiga dispara rajadas contínuas de obuses pesados contra a trincheira. O comando de agachar (`[C]`) deve ser sincronizado aos milissegundos com os avisos sonoros e visuais do HUD.
  - **Queda Psicológica Acelerada:** A morte de um único companheiro drena 50% da barra de moral dos sobreviventes. O jogador deve manter o Cabo Arthur Price próximo às tropas para compensar com sua aura de liderança (+6 moral).
  - **Glória e Honra:** Ao triunfar sobre os 20 dias no modo Hard Master, o jogador desbloqueia o cobiçado **Rank 'S'** com relatório de honra militar especial.

---

## 2. Doutrina Tática & Guia de Sobrevivência

### A. Cobertura de Sacos de Areia (Parapet Cover)
- A trincheira possui um parapeito fortificado de sacos de areia no eixo Z (entre Z = 6.0 e Z = 7.5).
- **Efeito Matemático:** Soldados posicionados na área de parapeito recebem **-40% de dano direto** e **-50% de probabilidade de serem alvejados**, pois sua silhueta exposta diminui drasticamente.
- O HUD exibe um ícone azul de escudo fortificado nos cartões dos soldados em cobertura.

### B. Manobra de Agachamento na Trincheira (`[C]` - Duck on Duckboards)
- Quando a contra-bateria inimiga inicia seu bombardeio, um banner vermelho de alarme pisca no topo do HUD com a sirene de aviso e o som do projétil caindo.
- Pressionar a tecla `[C]` ou o botão do HUD faz os 4 soldados se jogarem no chão de madeira da trincheira.
- **Efeito Matemático:** Reduz o dano por estilhaço radial de explosões em **80%**, transformando impactos fatais em ferimentos leves. Quando o projétil detona, levante a tropa imediatamente para retomar o fogo de defesa.

### C. Apoio de Artilharia Pesada (`[Espaço]`)
- Aciona a bateria de obuses da divisão. Ao pressionar `[Espaço]`, um anel de mira verde de 5 metros de diâmetro é projetado sobre a Terra de Ninguém.
- Ao clicar no local de impacto, um assobio sônico é sintetizado, seguido pela detonação de alto explosivo (HE).
- **Fórmula de Dano por Área:**
  $$\text{Dano} = \text{Dano Base (120)} \times \left(1.0 - \frac{\text{Distância}}{\text{Raio}}\right)$$
- Neutraliza instantaneamente pelotões de recrutas aglomerados e quebra o avanço de infantarias blindadas.

### D. Tratamento Médico de Emergência (`[R]`)
- O Paramédico George Bailey carrega ataduras de campo e morfina.
- Ao pressionar `[R]`, aplica primeiros socorros em todos os companheiros a até 6 metros de distância:
  - Recupera **+35 HP**.
  - Restaura **+20 de Moral**.
  - Estabiliza soldados em estado crítico de pânico.

---

## 3. O Esquadrão da 11ª Companhia

1. **Cabo Arthur Price [1]** — Líder de Esquadrão  
   - *Armamento:* Fuzil Lee-Enfield Mk III (.303 British).  
   - *Papel:* Núcleo de comando. Mantém aura ativa de estabilização de moral para tropas adjacentes.
2. **Soldado Thomas Miller [2]** — Fuzileiro de Precisão  
   - *Armamento:* Fuzil com mira ajustada e baioneta calçada.  
   - *Papel:* Atirador de alta acurácia (85%). Especialista em eliminar snipers e tropas de choque em longa distância.
3. **Atirador Edward Vance [3]** — Metralhador Pesado  
   - *Armamento:* Metralhadora Lewis com tambor rotativo de 47 tiros.  
   - *Papel:* Fogo contínuo de supressão. Retarda e imobiliza pelotões inimigos na lama da Terra de Ninguém.
4. **Paramédico George Bailey [4]** — Médico de Combate  
   - *Armamento:* Pistola Webley de defesa e bolsa de primeiros socorros.  
   - *Papel:* Manutenção vital da tropa e suporte psicológico em momentos de crise.

---

## 4. Tabela Completa de Comandos e Atalhos

| Tecla / Atalho | Comando Operacional | Descrição Detalhada |
| :---: | :--- | :--- |
| **`[1]`** | Selecionar Cabo Arthur Price | Alterna o foco do jogador para o líder do esquadrão |
| **`[2]`** | Selecionar Fuzileiro Miller | Seleciona o fuzileiro para mirar alvos prioritários |
| **`[3]`** | Selecionar Metralhador Vance | Foca no atirador da metralhadora Lewis |
| **`[4]`** | Selecionar Médico Bailey | Foca no paramédico para manobras de socorro |
| **`W`, `A`, `S`, `D` / Setas** | Mover Câmera Tática | Panorâmica suave pela extensão da trincheira e Terra de Ninguém |
| **`Clique Esquerdo no Chão`** | Reposicionar Soldado | Ordena que o soldado selecionado caminhe até o local marcado |
| **`[Espaço]`** | Obus de Artilharia | Ativa mira circular de bombardeio pesado de obuses |
| **`[R]`** | Primeiros Socorros | Cura ferimentos do esquadrão (+35 HP e +20 Moral) |
| **`[C]`** | Agachar na Trincheira | Ordena proteção imediata contra estilhaços de artilharia |
| **`[D]`** | **Central de Documentação** | **Abre instantaneamente este dossiê e manual técnico** |
| **`[G]`** | Inspetor Godot 4.8 | Abre gaveta técnica com slider SSCS e notas de desenvolvimento |
| **`[M]`** | Alternar Som | Ativa ou silencia a síntese de áudio procedural Web Audio |
| **`[Esc]` / `[P]`** | Menu de Pausa | Congela a simulação de combate e exibe opções |

---

## 5. Destaques Técnicos do Godot Engine 4.8 dev 6

Esta simulação foi arquitetada para demonstrar e homenagear os avanços trazidos pelo anúncio do **Godot 4.8 dev 6**:

### A. Screen-Space Contact Shadows (SSCS) para Luzes Direcionais (GH-118045)
- **Autor da Contribuição:** Rudolph Bester.
- **Fundamento Técnico:** Inspirado na técnica da Bend Studios. Em mapas de sombras tradicionais (Cascaded Shadow Maps), objetos esguios e detalhes de contato (como o parapeito de sacos de areia, as bordas do capacete Brodie e as tábuas de madeira da trincheira) sofrem com *shadow acne* ou perda de definição em ângulos rasantes de sol poente.
- **Inovação:** O SSCS calcula a oclusão por raymarching no espaço de tela criando uma textura R8 de sombras de contato, mesclando-a perfeitamente aos mapas de sombra existentes com custo computacional mínimo.
- **No Jogo:** Pressione `[G]` ou use o botão na barra superior para alternar o SSCS e verificar a diferença nas frestas dos sacos de areia e nos relevos de lama.

### B. Nova Barra de Ferramentas 3D (GH-121065)
- **Autor da Contribuição:** Jayden Sipe.
- **Fundamento:** Terceira etapa da trilogia de refinamentos de interface do Godot (após Game Embed e 2D toolbar), proporcionando máxima clareza visual, redução de ruído cognitivo e manipuladores de transformação refinados.

### C. Correções Críticas de Plataforma
- **macOS Metal (GH-123439):** Resolução de crash imediato na inicialização em ambientes Apple Silicon e Metal API.
- **Android XR & Play Store (GH-123474):** Correções de exportação de pacotes e compatibilidade com o editor Android XR.
- **GDScript Highlighting (GH-123320):** Melhoria significativa de desempenho no analisador léxico de realce de sintaxe.

---

## 6. Arquitetura de Software & Qualidade de Código

O código do projeto foi desenvolvido seguindo rigorosamente os padrões de engenharia de software de alta performance:

```
/
├── DOCUMENTATION.md          # Este dossiê completo em Markdown
├── src/
│   ├── audio/
│   │   └── soundManager.ts   # Síntese sonora procedural Web Audio API (zero dependências externas de áudio)
│   ├── components/
│   │   ├── FieldManualModal.tsx # Central de Documentação e Manual Operacional in-app com cópia Markdown
│   │   ├── GameHUD.tsx          # HUD tático de baixa oclusão (<15% da tela)
│   │   ├── GameOverModal.tsx    # Relatório de vitória/derrota com cálculo de baixas e medalhas
│   │   ├── GodotDevDrawer.tsx   # Inspetor técnico Godot 4.8 (SSCS slider, changelog GH)
│   │   ├── PauseModal.tsx       # Menu de pausa tático com acesso à documentação
│   │   └── TitleScreen.tsx      # Tela de abertura com seletor dos 4 níveis e brasão vetorial
│   ├── game/
│   │   ├── combatRules.ts       # Lógica pura desacoplada: matriz de dificuldades, dano, moral e ranks
│   │   ├── combatRules.test.ts  # Testes unitários executados via Node test runner
│   │   ├── proceduralModels.ts  # Modelagem 3D procedural (soldados de 8 partes, trincheiras, arame farpado)
│   │   ├── sceneManager.ts      # Motor de cena Three.js 60fps, iluminação SSCS, detecção WebGL e física
│   │   └── types.ts             # Tipagem estrita TypeScript para todas as entidades
│   ├── App.tsx                  # Gerenciador de estado central e atalhos de teclado
│   ├── index.css                # Estilização com Tailwind CSS
│   └── main.tsx                 # Ponto de entrada da aplicação
```

### Garantia de Qualidade e Testes Automatizados
- **Testes Unitários:** O arquivo `src/game/combatRules.test.ts` valida todas as fórmulas de dano por dificuldade, mitigação de cobertura, raio de dispersão de artilharia e cálculo de Rank S para o modo Hard Master.
- **Comando de Teste:** `npx --yes tsx --test src/game/combatRules.test.ts`
- **Zero Assets Externos 404:** Toda a renderização 3D (malhas, capacetes, armas, trincheiras) e todos os efeitos sonoros (disparos de rifle, metralhadora Lewis, apitos de assalto, obuses e explosões de graves profundos) são gerados em tempo de execução via código procedural.
