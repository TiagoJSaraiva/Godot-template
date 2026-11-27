# godot-template

Modelo para jogos em **Godot 4.7 + GDScript**, pronto para trabalhar com agentes de IA (Claude Code, Codex, Gemini CLI), em **Windows ou Linux**.

*English version: [README.md](README.md).*

## O que vem no modelo

```
godot-template/
  README.md             este guia em inglês (substituído pelo setup)
  LEIA-ME.md            este guia (removido pelo setup)
  COLABORAR-SEM-IA.md   guia do colaborador sem agente de IA
  setup.mjs             aplica o nome do jogo (remove a si mesmo)
  game.code-workspace   workspace do VS Code: pastas "Jogo" e "Notas"
  .gitattributes        finais de linha iguais em Windows e Linux
  .github/workflows/    CI: check em Linux a cada pull request e push na main
  notes/                anotações livres: GDD, referências, imagens
  game/                 projeto Godot
    project.godot
    AGENTS.md           instruções para agentes (CLAUDE.md e GEMINI.md importam)
    .agents/fluxos/     fluxos inicio / planejar / revisar / fim / configurar / colaborar / integrar
    .claude/  .gemini/  comandos, subagente de revisão, hook e configurações de cada agente
    .mcp.json           MCP godot (rodar o jogo e ler o console)
    .env.example        modelo da configuração local (caminho do Godot)
    requirements.txt    versão fixa do gdtoolkit
    docs/               memória do projeto: status, arquitetura, sistemas, decisões
    scripts/            check.mjs (pipeline de verificação) e as etapas que ele chama; auditoria.mjs (preparo da revisão)
    test/               testes gdUnit4 (unit/ e scenes/)
    addons/gdUnit4/     gdUnit4 6.2.0
```

Os detalhes de convenção e fluxo estão em `game/AGENTS.md` e `game/docs/`.

## Pré-requisitos (uma vez por máquina)

| Ferramenta | Para quê | Como conferir |
|---|---|---|
| Godot **4.7.x**, de qualquer fonte (Steam ou [site oficial](https://godotengine.org/download)). No Linux, use o executável do site, não o Flatpak | engine | abrir o Godot e ver a versão |
| Node.js **18+** | check, hook e MCP `godot` | `node --version` |
| Python 3 + gdtoolkit na versão de `game/requirements.txt` | `gdformat` e `gdlint` | `gdformat --version` |
| Git, com acesso de push a um repositório remoto (ex.: GitHub) | commits e push dos agentes | `git --version` |
| VS Code + extensão godot-tools (opcional) | editar GDScript no VS Code | — |

Instalar o gdtoolkit (a partir de `game/`):

```sh
# Windows
pip install -r requirements.txt

# Linux: o pip global costuma ser bloqueado (PEP 668); instale só para o seu usuário
pip3 install --user --break-system-packages -r requirements.txt
# e confira se ~/.local/bin está no PATH (reabra o terminal depois da primeira instalação)
```

No VS Code, a extensão godot-tools precisa do caminho do Godot. Defina-o nas **configurações de usuário** (não no workspace, que é versionado): `godotTools.editorPath.godot4`.

## Criar um jogo novo

```sh
# 1. Copiar o modelo (nunca trabalhe dentro do próprio godot-template)
#    Windows: Copy-Item -Recurse C:\Programacao\godot-template C:\Programacao\meu-jogo
#    Linux:   cp -r ~/godot-template ~/meu-jogo
cd meu-jogo

# 2. Aplicar o nome (cria também game/.env)
node setup.mjs --name "Meu Jogo"

# 3. Configurar o caminho do Godot: edite game/.env e preencha GODOT_PATH com o caminho do
#    executável (o arquivo, não a pasta). Exemplos em game/.env.example.

# 4. Versionar (repositório na raiz, cobrindo game/ e notes/; a branch precisa se chamar main)
git init -b main
git add .
git commit -m "chore: cria projeto a partir do godot-template"

# 5. Remoto (o /fim dos agentes faz push para origin/main)
git remote add origin <url-do-repositorio>
git push -u origin main

# 6. Primeiro check completo (gera .godot/ e confere toda a cadeia)
cd game
node scripts/check.mjs
```

Depois, abra `meu-jogo.code-workspace` no VS Code. No Claude Code, abra a sessão dentro de `game/` e aprove o MCP `godot` na primeira vez (a aprovação fica em `.claude/settings.local.json`, que não é versionado). Comece com `/configurar` (papel **dono**) e depois `/inicio`.

### O que o setup faz

O `setup.mjs` troca o placeholder `__GAME_NAME__`, renomeia o workspace, substitui os guias do modelo e cria o `game/.env`. Se preferir fazer à mão:

1. `game/project.godot`: `config/name="__GAME_NAME__"` → nome do jogo.
2. `game/AGENTS.md`: título `# AGENTS.md — __GAME_NAME__` → nome do jogo.
3. Renomear `game.code-workspace` para `<nome-do-jogo>.code-workspace`.
4. Substituir `README.md` pelo README do jogo e apagar `LEIA-ME.md` e `setup.mjs`.
5. Copiar `game/.env.example` para `game/.env` e preencher `GODOT_PATH`.

## Configuração local (`game/.env`)

O `game/.env` guarda o que muda de uma máquina para outra e **não vai para o git**; o modelo versionado é o `game/.env.example`. Hoje ele tem só o `GODOT_PATH`, lido pelo check, pelo hook do Claude Code e pelo MCP. Quem preferir pode definir `GODOT_PATH` como variável de ambiente do sistema: ela vale mais que o `.env`.

## Trabalhando com os agentes

Os fluxos estão em `game/.agents/fluxos/` e aparecem como comandos no Claude Code e no Gemini CLI:

| Comando | O que faz |
|---|---|
| `/inicio` | Confere a versão do Godot e o estado do git, lê `docs/status.md` e resume onde paramos. |
| `/planejar` | Monta um plano (arquivos, cenas, testes, commits previstos) e espera aprovação antes de codar. |
| `/revisar` | Revisa o diff atual ou os commits não enviados, por categoria. Não altera nada. |
| `/fim` | Roda o check completo, atualiza `docs/`, revisa os commits da sessão e faz push (dono: `main`; colaborador: a branch, para o fork). |
| `/configurar` | Uma vez por máquina: confere os pré-requisitos, cria o `.env` e define o papel (dono ou colaborador). |
| `/colaborar` | Colaborador: começa uma contribuição, numa branch com missão, a partir da `main` do repositório original. |
| `/integrar` | Dono: revisa e integra um pull request na `main`, reconciliando a documentação. |

Regras de git do dono (decisão `0010`; detalhes na seção **Git** de `game/AGENTS.md`):

- Todo trabalho acontece direto na `main`. O agente só cria branch a seu pedido (ex.: testar uma feature à parte) e nunca faz push dela.
- O agente faz um commit ao fim de cada módulo, com o check passando, no modelo `<tipo>(<escopo>): <resumo>` (ex.: `feat(player): adiciona pulo com coyote time`). Sem rodapé de coautoria.
- O push só acontece no `/fim`, depois do check completo e da revisão. Nunca com `--force`.

## Colaborar num projeto feito com o modelo

Para quem contribui com o projeto de outra pessoa (decisão `0014`; regras na seção **Colaboração** de `game/AGENTS.md`):

1. No GitHub, faça um **fork** do repositório e clone o **seu fork** (`git clone <url-do-seu-fork>`).
2. Instale os pré-requisitos (acima) e abra o agente dentro de `game/`.
3. Rode `/configurar`, escolha o papel **colaborador** e informe a URL do repositório original (vira o remoto `upstream`). Uma vez por máquina.
4. A cada contribuição, rode `/colaborar`: o agente pede a missão (objetivo, o que inclui e não inclui, pastas), propõe o nome da branch (`<tipo>/<descricao>`, ex.: `fix/corrige-pulo-duplo`) e cria a branch a partir da `main` original, sem precisar atualizar o fork antes.
5. Trabalhe normalmente (`/planejar`, implementação). Uma branch tem **um propósito**: o agente alerta quando um pedido não cabe na missão, e o check reprova commit de outro tipo (ex.: `feat` numa `fix/`) e alteração em arquivo protegido (memória compartilhada, instruções, ferramentas, addons).
6. Rode `/fim`: o agente atualiza a missão, roda o check, envia a branch para o seu fork e entrega o texto do pull request.
7. No GitHub, abra o pull request do seu fork para a `main` do original. O CI roda o check em Linux.

**Sem agente de IA** (decisão `0016`): siga o [COLABORAR-SEM-IA.md](COLABORAR-SEM-IA.md). Os mesmos passos rodam como scripts dentro de `game/`: `node scripts/configurar.mjs` uma vez; depois `node scripts/colaborar.mjs` (guiado: pergunta a missão, cria a branch e faz o commit da missão) e, no fim, `node scripts/fim-colaborador.mjs` (check, atualização da missão, envio para o fork e texto do pull request). Os dois caminhos se misturam: uma branch começada à mão pode ser terminada pelo agente, e vice-versa.

## Integrar contribuições (dono)

1. Leia o pull request no GitHub e confira o resultado do CI. **Não use o botão de merge.**
2. Rode `/integrar <número do PR>`. O agente busca a branch sem trocar para ela e analisa sem executar nada dela: commits, missão, infraestrutura alterada, scripts `@tool`, APIs sensíveis (execução de programas, rede) e documentação. Ele para e pede a sua aprovação.
3. Aprovado, ele faz o merge, roda o check, numera as decisões propostas, incorpora o estado da missão ao `status.md`, apaga a pasta da branch e faz push. O GitHub marca o pull request como integrado.

## CI (GitHub Actions)

`.github/workflows/check.yml` roda o check completo em Linux a cada pull request (com as regras de colaborador) e a cada push na `main`. Ele instala Node, Python, o gdtoolkit fixado, o Godot oficial e uma tela virtual (Xvfb), porque os testes de cena abrem janela. A versão exata do Godot fica em `GODOT_VERSION` no workflow.

## Depois do setup

- `game/docs/status.md` já descreve o ponto de partida. O próximo passo é definir o escopo do jogo em `game/docs/arquitetura.md`.
- As decisões `0001`–`0014` em `game/docs/decisoes/` valem para todo projeto criado pelo modelo. Mude-as com uma nova decisão, não editando as antigas.
- `notes/` é livre (GDD, imagens, links). Os agentes usam `game/docs/` como memória.

## Atualizar a versão do Godot

`config/features` em `project.godot` fixa a versão (decisão `0002`). Para migrar, registre uma nova decisão, atualize o Godot e altere a versão em `config/features` e o `GODOT_VERSION` do CI (`.github/workflows/check.yml`) no mesmo passo. O check falha enquanto as versões forem diferentes.

## Renderizador e D3D12 no Windows

`project.godot` define `rendering_device/driver.windows="d3d12"`. A configuração só vale no Windows e só nos renderizadores Forward+ e Mobile (o modelo começa no Compatibility, que usa OpenGL e a ignora). Ela existe porque, em algumas máquinas, o Vulkan cai no Mesa Dozen (uma camada da Microsoft que simula Vulkan sobre D3D12) e a janela do jogo fica preta; com D3D12 direto, funciona. Ela fica no projeto, para todos: deixá-la só numa máquina via `override.cfg` não funciona, porque o editor grava o valor de volta no `project.godot` ao salvar as configurações (decisão `0013`).

## Solução de problemas

- **Hook ou check acusa `GODOT_PATH não definido`**: preencha `GODOT_PATH` em `game/.env` (veja `game/.env.example`).
- **Janela do jogo preta no Windows**: veja "Renderizador e D3D12 no Windows" acima.
- **`ERROR: Remote Debugger ... port` na saída dos testes**: ruído conhecido, não é falha.
- **`gdformat` não encontrado**: instale com `requirements.txt` (acima) e confira se a pasta de scripts do Python está no `PATH` (`Scripts` no Windows, `~/.local/bin` no Linux).
- **Check avisa que o gdtoolkit é de outra versão**: rode de novo a instalação com `requirements.txt`; versões diferentes podem formatar diferente.
- **Check acusa função com o `##` sem revisão**: a função mudou e o comentário dela não. Atualize o `##` ou, se ele continua correto, confirme com o comando que o check sugere (`node scripts/check-doc-review.mjs --reviewed "<arquivo>::<função>"`). Decisão `0011`.
- **Check acusa "Sem tela gráfica para os testes" no Linux**: os testes de cena abrem janela. Rode numa sessão gráfica ou instale o Xvfb (`sudo apt install xvfb`); o check usa a tela virtual sozinho. No WSL, a tela vem do WSLg; se ela cair, `wsl --shutdown` e abrir de novo a restaura.
- **`git status` mostra arquivos `.import` alterados sem diferença real**: cópia de trabalho criada antes do `.gitattributes` atual (`eol=lf`). Rode `git add --renormalize .` uma vez: nada muda no conteúdo e o status fica limpo.
- **`/fim` não faz push**: confira se o remoto existe (`git remote -v`) e se a branch é `main` (`git branch --show-current`). Sem `origin`, os commits ficam só locais.
