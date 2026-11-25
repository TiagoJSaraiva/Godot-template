# 0012 — Tipo sempre explícito, sem inferência por `:=`

- **Data**: 2026-11
- **Status**: aceita (amplia 0001)

## Contexto
A 0001 exige tipagem estática, e a convenção aceitava `:=` só com literal ou construtor à direita. A própria convenção contradizia a regra nos exemplos (`:= MAX_JUMPS`, `:= body as Enemy`), e nada a verificava: no Month-of-horror-01, das 158 declarações com `:=`, 58 eram cast com `as`, 17 chamada de função e 12 literal numérico.

`:=` não enfraquece a tipagem: o tipo fica fixo na compilação, e o Godot dá erro quando não consegue inferi-lo. O problema é a clareza e uma armadilha:
- o tipo só aparece para quem lê se estiver escrito à direita (construtor ou `as`); com constante ou chamada de função, é preciso procurar a declaração, e o tipo da variável muda sozinho se o retorno da função mudar;
- `var speed := 200` vira `int`, e um `speed = 150.5` posterior compila e trunca para `150` (verificado no Godot 4.7.2). Justamente o literal era permitido.

O desenvolvedor quer tipagem explícita e forte em todo o projeto.

## Decisão
- Nenhuma inferência de tipo: variáveis (locais, membros, `@onready`, dentro de lambdas), constantes, parâmetros com valor padrão e iteradores de `for` têm o tipo escrito à esquerda, inclusive em `test/`.
- `project.godot` liga `gdscript/warnings/inferred_declaration=2` (aviso tratado como erro), ao lado do `untyped_declaration=2` que já existia. Com isso, o parse do check reprova qualquer `:=` e o editor marca o erro ao digitar. Os addons ficam de fora (`gdscript/warnings/exclude_addons`, ligado por padrão).

## Alternativas descartadas
- **`:=` só com o tipo escrito à direita (construtor ou `as`)**: quase tão claro, mas o Godot não tem um aviso tão específico, e a regra dependeria só da revisão. A regra antiga, também só escrita, não era seguida.
- **`:=` também com constante**: mantém o tipo escondido em vários casos.

## Consequências
Código mais verboso nos casos em que o tipo já aparece à direita (`var timer: Timer = Timer.new()`), em troca de todo tipo visível na declaração e verificado pelo check. O `scripts/parse_check.gd` roda com os avisos do projeto e segue a mesma regra. Projeto já existente que adotar a regra precisa trocar todo `:=` antes de ligar o aviso, senão o check reprova.
