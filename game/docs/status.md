# Status

## Onde paramos
- Projeto criado a partir do modelo `godot-template`: Godot 4.7, pipeline `scripts/check.mjs`, em Node, para Windows e Linux (versão, regras de colaboração, gdtoolkit, gdformat, gdlint, `##` das funções, parse, gdUnit4), godot-mcp, instruções para agentes, colaboração por fork com `/configurar`, `/colaborar` e `/integrar`, e CI no GitHub Actions.
- Nenhuma mecânica implementada ainda.

## Próximo passo
- Rodar `/configurar` nesta máquina (papel dono).
- Definir o escopo do MVP e registrar em `docs/arquitetura.md` (visão geral).
- Criar a cena principal e defini-la como Main Scene.

## Bloqueios
- Nenhum.

## Pendências de infraestrutura
- Nenhuma. O check foi validado por sabotagem, em Windows e Linux: reprova teste falhando, erro de tipo em script sem uso, declaração sem tipo, `:=` (também em teste), formatação, lint, gdtoolkit ausente, função sem `##`, função alterada com o `##` sem revisão e, em modo colaborador, branch fora do padrão, missão ausente, arquivo protegido alterado e commit de tipo que a branch não aceita.
