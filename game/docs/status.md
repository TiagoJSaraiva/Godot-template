# Status

## Onde paramos
- Projeto criado a partir do modelo `godot-template`: Godot 4.7, pipeline `scripts/check.mjs`, em Node, para Windows e Linux (versão, gdtoolkit, gdformat, gdlint, `##` das funções, parse, gdUnit4), godot-mcp, instruções para agentes.
- Nenhuma mecânica implementada ainda.

## Próximo passo
- Definir o escopo do MVP e registrar em `docs/arquitetura.md` (visão geral).
- Criar a cena principal e defini-la como Main Scene.

## Bloqueios
- Nenhum.

## Pendências de infraestrutura
- Nenhuma. O check foi validado por sabotagem: reprova teste falhando, erro de tipo em script sem uso, declaração sem tipo, `:=` (também em teste), formatação, lint, gdtoolkit ausente, função sem `##` e função alterada com o `##` sem revisão.
