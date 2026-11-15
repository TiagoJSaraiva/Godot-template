# godot-template

Modelo para jogos em **Godot 4.7 + GDScript**, pronto para trabalhar com agentes de IA (Claude Code, Codex, Gemini CLI).

## O que vem no modelo

```
godot-template\
  README.md             este guia (substituído pelo setup)
  setup.ps1             aplica o nome do jogo (remove a si mesmo)
  game.code-workspace   workspace do VS Code: pastas "Jogo" e "Notas"
  notes\                anotações livres: GDD, referências, imagens
  game\                 projeto Godot
    project.godot
    AGENTS.md           instruções para agentes (CLAUDE.md e GEMINI.md importam)
    .agents\fluxos\     fluxos inicio / planejar / revisar / fim / multiagente
    .claude\  .gemini\  comandos e hook de cada agente
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

O `setup.ps1` troca o placeholder `__GAME_NAME__` e ajusta o workspace. Se preferir fazer à mão:

1. `game\project.godot`: `config/name="__GAME_NAME__"` → nome do jogo.
2. `game\AGENTS.md`: título `# AGENTS.md — __GAME_NAME__` → nome do jogo.
3. Renomear `game.code-workspace` para `<nome-do-jogo>.code-workspace` e, se o Godot estiver em outro caminho, ajustar `godotTools.editorPath.godot4` (o setup usa `GODOT_PATH`, se definido).
4. Substituir este `README.md` pelo README do jogo e apagar `setup.ps1`.

## Depois do setup

- `game\docs\status.md` já descreve o ponto de partida. O próximo passo é definir o escopo do jogo em `game\docs\arquitetura.md`.
- Os agentes fazem commit ao fim de cada módulo, direto na `main`, e o `/fim` faz push (decisão `0007`; modelo de mensagem em `game\AGENTS.md`). `/multiagente <modelo>: <pedido>` divide uma tarefa entre subagentes em branches locais e integra tudo na `main` no final.
- As decisões `0001`–`0007` em `game\docs\decisoes\` valem para todo projeto criado pelo modelo. Mude-as com uma nova decisão, não editando as antigas.
- `notes\` é livre (GDD, imagens, links). Os agentes usam `game\docs\` como memória.

## Atualizar a versão do Godot

`config/features` em `project.godot` fixa a versão (decisão `0002`). Para migrar, registre uma nova decisão, atualize o Godot e altere a versão em `config/features` no mesmo passo. O check falha enquanto as duas versões forem diferentes.

## Solução de problemas

- **Hook ou check acusa `GODOT_PATH não definido`**: defina a variável (acima) e reabra o terminal/VS Code.
- **Janela do jogo preta**: nesta máquina, o Vulkan cai no Mesa Dozen e não renderiza. Mantenha `rendering_device/driver.windows="d3d12"` em `project.godot`.
- **`ERROR: Remote Debugger ... port` na saída dos testes**: ruído conhecido, não é falha.
- **`gdformat` não encontrado**: a pasta `Scripts` do Python precisa estar no `PATH`.
