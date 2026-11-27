# godot-template

Template for **Godot 4.7 + GDScript** games, ready to work with AI agents (Claude Code, Codex, Gemini CLI), on **Windows or Linux**.

*Versão em português: [LEIA-ME.md](LEIA-ME.md).*

> The agent instructions, workflows and project docs inside `game/` are written in Portuguese, and the agents answer in Portuguese. Code identifiers, file names and node names are in English.

## What's in the template

```
godot-template/
  README.md             this guide (replaced by setup)
  LEIA-ME.md            Portuguese guide (removed by setup)
  COLABORAR-SEM-IA-WINDOWS.md  collaborator guide without an AI agent, Windows (Portuguese)
  COLABORAR-SEM-IA-LINUX.md    the same guide for Linux (Portuguese)
  setup.mjs             applies the game name (deletes itself)
  game.code-workspace   VS Code workspace: "Jogo" and "Notas" folders
  .gitattributes        same line endings on Windows and Linux
  .github/workflows/    CI: check on Linux for every pull request and push to main
  notes/                free-form notes: GDD, references, images
  game/                 Godot project
    project.godot
    AGENTS.md           agent instructions (imported by CLAUDE.md and GEMINI.md)
    .agents/fluxos/     workflows: inicio / planejar / revisar / fim / configurar / colaborar / integrar
    .claude/  .gemini/  commands, review subagent, hook and settings for each agent
    .mcp.json           godot MCP (run the game and read the console)
    .env.example        template for the local settings (Godot path)
    requirements.txt    pinned gdtoolkit version
    docs/               project memory: status, architecture, systems, decisions
    scripts/            check.mjs (verification pipeline) and the steps it calls; auditoria.mjs (review prep)
    test/               gdUnit4 tests (unit/ and scenes/)
    addons/gdUnit4/     gdUnit4 6.2.0
```

Conventions and workflow details live in `game/AGENTS.md` and `game/docs/`.

## Prerequisites (once per machine)

| Tool | Used for | How to check |
|---|---|---|
| Godot **4.7.x**, from any source (Steam or the [official site](https://godotengine.org/download)). On Linux, use the executable from the site, not Flatpak | engine | open Godot and check the version |
| Node.js **18+** | check, hook and `godot` MCP | `node --version` |
| Python 3 + gdtoolkit at the version in `game/requirements.txt` | `gdformat` and `gdlint` | `gdformat --version` |
| Git, with push access to a remote repository (e.g. GitHub) | agent commits and pushes | `git --version` |
| VS Code + godot-tools extension (optional) | edit GDScript in VS Code | — |

Installing gdtoolkit (from `game/`):

```sh
# Windows
pip install -r requirements.txt

# Linux: global pip is usually blocked (PEP 668); install for your user only
pip3 install --user --break-system-packages -r requirements.txt
# and make sure ~/.local/bin is on PATH (reopen the terminal after the first install)
```

In VS Code, the godot-tools extension needs the Godot path. Set it in your **user settings** (not in the workspace, which is versioned): `godotTools.editorPath.godot4`.

## Creating a new game

```sh
# 1. Copy the template (never work inside godot-template itself)
#    Windows: Copy-Item -Recurse C:\Programacao\godot-template C:\Programacao\my-game
#    Linux:   cp -r ~/godot-template ~/my-game
cd my-game

# 2. Apply the name (also creates game/.env)
node setup.mjs --name "My Game"

# 3. Set the Godot path: edit game/.env and fill GODOT_PATH with the path to the executable
#    (the file, not the folder). Examples in game/.env.example.

# 4. Version it (repository at the root, covering game/ and notes/; the branch must be main)
git init -b main
git add .
git commit -m "chore: cria projeto a partir do godot-template"

# 5. Remote (the agents' /fim pushes to origin/main)
git remote add origin <repository-url>
git push -u origin main

# 6. First full check (generates .godot/ and exercises the whole pipeline)
cd game
node scripts/check.mjs
```

Then open `my-game.code-workspace` in VS Code. In Claude Code, start the session inside `game/` and approve the `godot` MCP the first time (the approval is stored in `.claude/settings.local.json`, which is not versioned). Start with `/configurar` (role **dono**, owner) and then `/inicio`.

### What setup does

`setup.mjs` replaces the `__GAME_NAME__` placeholder, renames the workspace, replaces the template guides and creates `game/.env`. To do it by hand:

1. `game/project.godot`: `config/name="__GAME_NAME__"` → game name.
2. `game/AGENTS.md`: title `# AGENTS.md — __GAME_NAME__` → game name.
3. Rename `game.code-workspace` to `<game-name>.code-workspace`.
4. Replace `README.md` with the game's own README and delete `LEIA-ME.md` and `setup.mjs`.
5. Copy `game/.env.example` to `game/.env` and fill `GODOT_PATH`.

## Local settings (`game/.env`)

`game/.env` holds what changes from one machine to another and is **not versioned**; the versioned template is `game/.env.example`. Today it only has `GODOT_PATH`, read by the check, the Claude Code hook and the MCP. If you prefer, set `GODOT_PATH` as a system environment variable: it takes precedence over `.env`.

## Working with the agents

The workflows live in `game/.agents/fluxos/` and are exposed as commands in Claude Code and Gemini CLI:

| Command | What it does |
|---|---|
| `/inicio` (start) | Checks the Godot version and git state, reads `docs/status.md` and summarizes where things stand. |
| `/planejar` (plan) | Drafts a plan (files, scenes, tests, planned commits) and waits for approval before coding. |
| `/revisar` (review) | Reviews the current diff or unpushed commits, by category. Changes nothing. |
| `/fim` (end) | Runs the full check, updates `docs/`, reviews the session's commits and pushes (owner: `main`; collaborator: the branch, to the fork). |
| `/configurar` (setup) | Once per machine: checks prerequisites, creates `.env` and sets the role (owner or collaborator). |
| `/colaborar` (contribute) | Collaborator: starts a contribution, on a branch with a mission, from the original repository's `main`. |
| `/integrar` (integrate) | Owner: reviews and merges a pull request into `main`, reconciling the docs. |

Owner git rules (decision `0010`; details in the **Git** section of `game/AGENTS.md`):

- All work happens directly on `main`. The agent only creates a branch when you ask (e.g. to try out a feature separately) and never pushes it.
- The agent commits at the end of each module, with the check passing, using the `<tipo>(<escopo>): <resumo>` format with Portuguese summaries (e.g. `feat(player): adiciona pulo com coyote time`). No co-author trailers.
- Push only happens in `/fim`, after the full check and the review. Never with `--force`.

## Contributing to a project made from the template

For someone contributing to another person's project (decision `0014`; rules in the **Colaboração** section of `game/AGENTS.md`):

1. On GitHub, **fork** the repository and clone **your fork** (`git clone <your-fork-url>`).
2. Install the prerequisites (above) and open the agent inside `game/`.
3. Run `/configurar`, choose the **colaborador** (collaborator) role and give the original repository URL (it becomes the `upstream` remote). Once per machine.
4. For each contribution, run `/colaborar`: the agent asks for the mission (goal, what it includes and excludes, folders), proposes the branch name (`<type>/<description>`, e.g. `fix/corrige-pulo-duplo`) and creates the branch from the original `main`, with no need to update the fork first.
5. Work as usual (`/planejar`, implementation). A branch has **one purpose**: the agent warns when a request does not fit the mission, and the check rejects commits of another type (e.g. `feat` on a `fix/` branch) and changes to protected files (shared memory, instructions, tools, addons).
6. Run `/fim`: the agent updates the mission, runs the check, pushes the branch to your fork and hands you the pull request text.
7. On GitHub, open the pull request from your fork to the original `main`. CI runs the check on Linux.

**Without an AI agent** (decision `0016`): follow the guide for [Windows](COLABORAR-SEM-IA-WINDOWS.md) or [Linux](COLABORAR-SEM-IA-LINUX.md). The same steps run as scripts inside `game/`: `node scripts/configurar.mjs` once, then `node scripts/colaborar.mjs` (guided: asks the mission, creates the branch and commits the mission) and, at the end, `node scripts/fim-colaborador.mjs` (check, mission update, push to the fork and pull request text). Both paths mix: a branch started by hand can be finished by an agent, and vice versa.

## Integrating contributions (owner)

1. Read the pull request on GitHub and check the CI result. **Do not use the merge button.**
2. Run `/integrar <PR number>`. The agent fetches the branch without switching to it and analyzes it without running any of its code: commits, mission, changed infrastructure, `@tool` scripts, sensitive APIs (running programs, network) and docs. It stops and asks for your approval.
3. Once approved, it merges, runs the check, numbers the proposed decisions, folds the mission's state into `status.md`, deletes the branch folder and pushes. GitHub marks the pull request as merged.

## CI (GitHub Actions)

`.github/workflows/check.yml` runs the full check on Linux for every pull request (with the collaborator rules) and every push to `main`. It installs Node, Python, the pinned gdtoolkit, the official Godot and a virtual display (Xvfb), because scene tests open a window. The exact Godot version is `GODOT_VERSION` in the workflow.

## After setup

- `game/docs/status.md` already describes the starting point. The next step is defining the game's scope in `game/docs/arquitetura.md`.
- Decisions `0001`–`0014` in `game/docs/decisoes/` apply to every project created from the template. Change them with a new decision instead of editing the old ones.
- `notes/` is free-form (GDD, images, links). Agents use `game/docs/` as their memory.

## Updating the Godot version

`config/features` in `project.godot` pins the version (decision `0002`). To migrate, record a new decision, update Godot and change the version in `config/features` and the CI `GODOT_VERSION` (`.github/workflows/check.yml`) in the same step. The check fails while the versions differ.

## Renderer and D3D12 on Windows

`project.godot` sets `rendering_device/driver.windows="d3d12"`. It only applies on Windows and only to the Forward+ and Mobile renderers (the template starts on Compatibility, which uses OpenGL and ignores it). It exists because on some machines Vulkan falls back to Mesa Dozen (a Microsoft layer that emulates Vulkan on top of D3D12) and the game window stays black; using D3D12 directly works. It stays in the project, for everyone: keeping it on a single machine through `override.cfg` does not work, because the editor writes the value back into `project.godot` when it saves the project settings (decision `0013`).

## Troubleshooting

- **Hook or check reports `GODOT_PATH não definido`** (not set): fill `GODOT_PATH` in `game/.env` (see `game/.env.example`).
- **Black game window on Windows**: see "Renderer and D3D12 on Windows" above.
- **`ERROR: Remote Debugger ... port` in the test output**: known noise, not a failure.
- **`gdformat` not found**: install it with `requirements.txt` (above) and make sure Python's scripts folder is on `PATH` (`Scripts` on Windows, `~/.local/bin` on Linux).
- **Check warns that gdtoolkit is a different version**: reinstall with `requirements.txt`; different versions may format differently.
- **Check reports a function whose `##` was not reviewed**: the function changed and its doc comment did not. Update the `##` or, if it is still correct, confirm it with the command the check suggests (`node scripts/check-doc-review.mjs --reviewed "<file>::<function>"`). Decision `0011`.
- **Check reports "Sem tela gráfica para os testes" (no display) on Linux**: scene tests open a window. Run in a graphical session or install Xvfb (`sudo apt install xvfb`); the check uses the virtual display on its own. On WSL the display comes from WSLg; if it goes down, `wsl --shutdown` and reopening restores it.
- **`git status` shows `.import` files changed with no real difference**: working copy created before the current `.gitattributes` (`eol=lf`). Run `git add --renormalize .` once: no content changes and the status becomes clean.
- **`/fim` does not push**: check that the remote exists (`git remote -v`) and that the branch is `main` (`git branch --show-current`). Without `origin`, commits stay local.
