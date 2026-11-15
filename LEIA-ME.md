# godot-template

Modelo para jogos em **Godot 4.7 + GDScript**, pronto para trabalhar com agentes de IA (Claude Code, Codex, Gemini CLI).

*English version: [README.md](README.md).*

## O que vem no modelo

```
godot-template\
  README.md             este guia em inglês (substituído pelo setup)
  LEIA-ME.md            este guia (removido pelo setup)
  setup.ps1             aplica o nome do jogo (remove a si mesmo)
  game.code-workspace   workspace do VS Code: pastas "Jogo" e "Notas"
  notes\                anotações livres: GDD, referências, imagens
  game\                 projeto Godot
    project.godot
    AGENTS.md           instruções para agentes (CLAUDE.md e GEMINI.md importam)
    .agents\fluxos\     fluxos inicio / planejar / revisar / fim / multiagente
    .claude\  .gemini\  comandos, hook e configurações de cada agente
    .mcp.json           MCP godot (rodar o jogo e ler o console)
    docs\               memória do projeto: status, arquitetura, sistemas, decisões
    scripts\            check.ps1 (pipeline de verificação) e check-godot-version.ps1
    test\               testes gdUnit4 (unit\ e scenes\)
    addons\gdUnit4\     gdUnit4 6.2.0
```

Os detalhes de convenção e fluxo estão em `game\AGENTS.md` e `game\docs\`.

## Pré-requisitos (uma vez por máquina)

| Ferramenta | Para quê | Como conferir |
|---|---|---|
| Godot **4.7.x** (Steam, branch `stable-4.7`) | engine | `& $env:GODOT_PATH --version` |
| Variável de ambiente `GODOT_PATH` apontando para o **.exe** do Godot (não para a pasta) | check, hook e MCP | `echo $env:GODOT_PATH` |
| Python + gdtoolkit 4 (`pip install "gdtoolkit==4.*"`; testado com 4.5.0) | `gdformat` e `gdlint` | `gdformat --version` |
| Node.js (com `npx`) | MCP `godot` (`@coding-solo/godot-mcp`) | `npx --version` |
| Git, com acesso de push a um repositório remoto (ex.: GitHub) | commits e push dos agentes | `git --version` |
| VS Code + extensão godot-tools (opcional) | editar GDScript no VS Code | — |

Para definir `GODOT_PATH` de forma permanente (PowerShell, depois reabra o terminal):

```powershell
[Environment]::SetEnvironmentVariable("GODOT_PATH", "C:\Program Files (x86)\Steam\steamapps\common\Godot Engine\godot.windows.opt.tools.64.exe", "User")
```

## Criar um jogo novo

```powershell
# 1. Copiar o modelo (nunca trabalhe dentro do próprio godot-template)
Copy-Item -Recurse C:\Programacao\godot-template C:\Programacao\meu-jogo
cd C:\Programacao\meu-jogo

# 2. Aplicar o nome
powershell -NoProfile -ExecutionPolicy Bypass -File setup.ps1 -Name "Meu Jogo"

# 3. Versionar (repositório na raiz, cobrindo game\ e notes\; a branch precisa se chamar main)
git init -b main
git add .
git commit -m "chore: cria projeto a partir do godot-template"

# 4. Remoto (o /fim dos agentes faz push para origin/main)
git remote add origin <url-do-repositorio>
git push -u origin main

# 5. Primeiro check completo (gera .godot\ e confere toda a cadeia)
cd game
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check.ps1
```

Depois, abra `meu-jogo.code-workspace` no VS Code. No Claude Code, abra a sessão dentro de `game\` e aprove o MCP `godot` na primeira vez (a aprovação fica em `.claude\settings.local.json`, que não é versionado). Comece com `/inicio`.

### O que o setup faz

O `setup.ps1` troca o placeholder `__GAME_NAME__`, ajusta o workspace e substitui os guias do modelo. Se preferir fazer à mão:

1. `game\project.godot`: `config/name="__GAME_NAME__"` → nome do jogo.
2. `game\AGENTS.md`: título `# AGENTS.md — __GAME_NAME__` → nome do jogo.
3. Renomear `game.code-workspace` para `<nome-do-jogo>.code-workspace` e, se o Godot estiver em outro caminho, ajustar `godotTools.editorPath.godot4` (o setup usa `GODOT_PATH`, se definido).
4. Substituir `README.md` pelo README do jogo e apagar `LEIA-ME.md` e `setup.ps1`.

## Trabalhando com os agentes

Os fluxos estão em `game\.agents\fluxos\` e aparecem como comandos no Claude Code e no Gemini CLI:

| Comando | O que faz |
|---|---|
| `/inicio` | Confere a versão do Godot e o estado do git, lê `docs\status.md` e resume onde paramos. |
| `/planejar` | Monta um plano (arquivos, cenas, testes, commits previstos) e espera aprovação antes de codar. |
| `/revisar` | Revisa o diff atual ou os commits não enviados, por categoria. Não altera nada. |
| `/fim` | Roda o check completo, atualiza `docs\`, revisa os commits da sessão e faz push da `main`. |
| `/multiagente <modelo>: <pedido>` | Divide a tarefa entre subagentes (ex.: `sonnet`, `haiku`) que trabalham em paralelo, cada um na própria branch; revisa, integra tudo na `main`, faz push e apaga as branches locais. |

Regras de git (decisão `0007`; detalhes na seção **Git** de `game\AGENTS.md`):

- Todo trabalho acontece direto na `main`. Branches só existem no `/multiagente`, são locais e nunca vão para o remoto.
- O agente faz um commit ao fim de cada módulo, com o check passando, no modelo `<tipo>(<escopo>): <resumo>` (ex.: `feat(player): adiciona pulo com coyote time`). Sem rodapé de coautoria.
- O push só acontece no `/fim`, depois do check completo e da revisão. Nunca com `--force`.

## Depois do setup

- `game\docs\status.md` já descreve o ponto de partida. O próximo passo é definir o escopo do jogo em `game\docs\arquitetura.md`.
- As decisões `0001`–`0007` em `game\docs\decisoes\` valem para todo projeto criado pelo modelo. Mude-as com uma nova decisão, não editando as antigas.
- `notes\` é livre (GDD, imagens, links). Os agentes usam `game\docs\` como memória.

## Atualizar a versão do Godot

`config/features` em `project.godot` fixa a versão (decisão `0002`). Para migrar, registre uma nova decisão, atualize o Godot e altere a versão em `config/features` no mesmo passo. O check falha enquanto as duas versões forem diferentes.

## Solução de problemas

- **Hook ou check acusa `GODOT_PATH não definido`**: defina a variável (acima) e reabra o terminal/VS Code.
- **Janela do jogo preta**: nesta máquina, o Vulkan cai no Mesa Dozen e não renderiza. Mantenha `rendering_device/driver.windows="d3d12"` em `project.godot`.
- **`ERROR: Remote Debugger ... port` na saída dos testes**: ruído conhecido, não é falha.
- **`gdformat` não encontrado**: a pasta `Scripts` do Python precisa estar no `PATH`.
- **`/fim` não faz push**: confira se o remoto existe (`git remote -v`) e se a branch é `main` (`git branch --show-current`). Sem `origin`, os commits ficam só locais.
- **Sobrou pasta em `game\.worktrees\`**: um `/multiagente` foi interrompido. `git worktree list` mostra o que ficou. Integre ou descarte cada branch `agente/*` e remova a worktree com `git worktree remove`.
