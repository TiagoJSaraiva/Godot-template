# godot-template

Template for **Godot 4.7 + GDScript** games, ready to work with AI agents (Claude Code, Codex, Gemini CLI).

*Versão em português: [LEIA-ME.md](LEIA-ME.md).*

> The agent instructions, workflows and project docs inside `game\` are written in Portuguese, and the agents answer in Portuguese. Code identifiers, file names and node names are in English.

## What's in the template

```
godot-template\
  README.md             this guide (replaced by setup)
  LEIA-ME.md            this guide in Portuguese (removed by setup)
  setup.ps1             applies the game name (deletes itself)
  game.code-workspace   VS Code workspace: "Jogo" (game) and "Notas" (notes) folders
  notes\                free-form notes: GDD, references, images
  game\                 Godot project
    project.godot
    AGENTS.md           agent instructions (imported by CLAUDE.md and GEMINI.md)
    .agents\fluxos\     workflows: inicio / planejar / revisar / fim
    .claude\  .gemini\  commands, hook and settings for each agent
    .mcp.json           godot MCP (run the game and read the console)
    docs\               project memory: status, architecture, systems, decisions
    scripts\            check.ps1 (verification pipeline) and check-godot-version.ps1
    test\               gdUnit4 tests (unit\ and scenes\)
    addons\gdUnit4\     gdUnit4 6.2.0
```

Conventions and workflows are detailed in `game\AGENTS.md` and `game\docs\`.

## Prerequisites (once per machine)

| Tool | Used for | How to check |
|---|---|---|
| Godot **4.7.x** (Steam, `stable-4.7` branch) | engine | `& $env:GODOT_PATH --version` |
| `GODOT_PATH` environment variable pointing to the Godot **.exe** (not the folder) | check, hook and MCP | `echo $env:GODOT_PATH` |
| Python + gdtoolkit 4 (`pip install "gdtoolkit==4.*"`; tested with 4.5.0) | `gdformat` and `gdlint` | `gdformat --version` |
| Node.js (with `npx`) | `godot` MCP (`@coding-solo/godot-mcp`) | `npx --version` |
| Git, with push access to a remote repository (e.g. GitHub) | agent commits and push | `git --version` |
| VS Code + godot-tools extension (optional) | editing GDScript in VS Code | — |

To set `GODOT_PATH` permanently (PowerShell, then reopen the terminal):

```powershell
[Environment]::SetEnvironmentVariable("GODOT_PATH", "C:\Program Files (x86)\Steam\steamapps\common\Godot Engine\godot.windows.opt.tools.64.exe", "User")
```

## Creating a new game

```powershell
# 1. Copy the template (never work inside godot-template itself)
Copy-Item -Recurse C:\Programacao\godot-template C:\Programacao\my-game
cd C:\Programacao\my-game

# 2. Apply the name
powershell -NoProfile -ExecutionPolicy Bypass -File setup.ps1 -Name "My Game"

# 3. Version control (repository at the root, covering game\ and notes\; the branch must be named main)
git init -b main
git add .
git commit -m "chore: cria projeto a partir do godot-template"

# 4. Remote (the agents' /fim pushes to origin/main)
git remote add origin <repository-url>
git push -u origin main

# 5. First full check (generates .godot\ and exercises the whole pipeline)
cd game
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check.ps1
```

Then open `my-game.code-workspace` in VS Code. In Claude Code, start the session inside `game\` and approve the `godot` MCP the first time (the approval is stored in `.claude\settings.local.json`, which is not versioned). Start with `/inicio`.

### What setup does

`setup.ps1` replaces the `__GAME_NAME__` placeholder, adjusts the workspace and replaces the template guides. To do it by hand:

1. `game\project.godot`: `config/name="__GAME_NAME__"` → game name.
2. `game\AGENTS.md`: title `# AGENTS.md — __GAME_NAME__` → game name.
3. Rename `game.code-workspace` to `<game-name>.code-workspace` and, if Godot lives elsewhere, adjust `godotTools.editorPath.godot4` (setup uses `GODOT_PATH` when set).
4. Replace `README.md` with the game's own README and delete `LEIA-ME.md` and `setup.ps1`.

## Working with the agents

The workflows live in `game\.agents\fluxos\` and are exposed as commands in Claude Code and Gemini CLI:

| Command | What it does |
|---|---|
| `/inicio` (start) | Checks the Godot version and git state, reads `docs\status.md` and summarizes where things stand. |
| `/planejar` (plan) | Drafts a plan (files, scenes, tests, planned commits) and waits for approval before coding. |
| `/revisar` (review) | Reviews the current diff or unpushed commits, by category. Changes nothing. |
| `/fim` (end) | Runs the full check, updates `docs\`, reviews the session's commits and pushes `main`. |

Git rules (decision `0008`; details in the **Git** section of `game\AGENTS.md`):

- All work happens directly on `main`, with no branches.
- The agent commits at the end of each module, with the check passing, using the `<tipo>(<escopo>): <resumo>` format with Portuguese summaries (e.g. `feat(player): adiciona pulo com coyote time`). No co-author trailers.
- Push only happens in `/fim`, after the full check and the review. Never with `--force`.

## After setup

- `game\docs\status.md` already describes the starting point. The next step is defining the game's scope in `game\docs\arquitetura.md`.
- Decisions `0001`–`0008` in `game\docs\decisoes\` apply to every project created from the template. Change them with a new decision instead of editing the old ones.
- `notes\` is free-form (GDD, images, links). Agents use `game\docs\` as their memory.

## Updating the Godot version

`config/features` in `project.godot` pins the version (decision `0002`). To migrate, record a new decision, update Godot and change the version in `config/features` in the same step. The check fails while the two versions differ.

## Troubleshooting

- **Hook or check reports `GODOT_PATH não definido`** (not set): set the variable (above) and reopen the terminal/VS Code.
- **Black game window**: on this machine, Vulkan falls back to Mesa Dozen and does not render. Keep `rendering_device/driver.windows="d3d12"` in `project.godot`.
- **`ERROR: Remote Debugger ... port` in the test output**: known noise, not a failure.
- **`gdformat` not found**: Python's `Scripts` folder must be on `PATH`.
- **`/fim` does not push**: check that the remote exists (`git remote -v`) and that the branch is `main` (`git branch --show-current`). Without `origin`, commits stay local.
