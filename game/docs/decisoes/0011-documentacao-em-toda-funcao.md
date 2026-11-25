# 0011 — `##` em toda função, revisado quando a função muda

- **Data**: 2026-11
- **Status**: aceita; ferramentas atualizadas pela 0013

## Contexto
O desenvolvedor lê e revisa todo o código, e o hover do editor mostra o `##` de uma função em qualquer chamada dela. A convenção pedia `##` só em classes e métodos públicos. No the-beacon, criado a partir de uma versão anterior deste modelo, a regra só escrita não foi seguida: 85 de 238 funções públicas tinham `##`, e 98 de 465 no total. Lá a regra passou a valer para toda função, verificada pelo check (decisões 0021 e 0022 de lá), e este modelo a adota.

Além disso, um `##` descreve o que o código faz hoje, inclusive bugs: uma correção muitas vezes também exige mudar o comentário, e um `##` desatualizado engana mais que a falta dele.

## Decisão
- Toda função fora de `test/` e `addons/` tem `##` logo acima dela, inclusive privadas, virtuais e callbacks. O `##` é o contrato para quem chama: o que a função faz ou devolve, com efeitos, unidades e pré-condições. O `#` comum continua explicando o porquê, e nenhum dos dois repete o código.
- `scripts/check-docs.ps1` reprova função sem `##`.
- Ao alterar uma função (assinatura ou corpo), o `##` dela é revisado no mesmo passo. `scripts/check-doc-review.ps1` compara o código com o HEAD (`git diff`, mudanças preparadas ou não) e reprova a função de arquivo versionado com alguma linha da assinatura ou do corpo alterada e nenhuma linha do bloco `##` alterada.
- Quando o `##` continua correto, `-Reviewed "<arquivo>::<função>"` o confirma: o hash do corpo atual vai para `.doc-review`, ignorado pelo git. Mexer de novo na função invalida a confirmação. O agente cita as funções confirmadas no resumo.
- Os dois scripts rodam no `check.ps1`, inclusive no `-Fast`, depois do lint e antes do parse.
- O alerta de ~200 linhas por script passa a contar só linhas de código.

## Alternativas descartadas
- **Só a instrução, sem check**: no the-beacon, 36% de adesão nas funções públicas.
- **Só funções públicas**: as privadas também são chamadas e lidas, e continuariam sem descrição no hover.
- **Exceção para virtuais**: o hover ajuda pouco nelas, mas o comentário ajuda na leitura, e uma regra sem exceções é mais fácil de verificar.
- **Mudar algo no `##` só para marcar a revisão (ex.: espaço no fim)**: o `gdformat -Fix` remove o espaço, e seria uma mudança invisível no diff.

## Consequências
Toda chamada mostra uma descrição no hover. Em troca, cada mudança de comportamento tem mais um texto para manter. O check garante que o `##` existe e que foi revisto quando a função mudou, não que está certo: a coerência fica para a revisão (`.agents/fluxos/revisar.md`). Os testes ficam de fora, porque `test_<comportamento>` já descreve o caso. Código movido sem mudança, reformatação e a remoção de uma linha logo após o fim de uma função aparecem como alteração e pedem confirmação. Projeto já existente que adotar a regra precisa documentar as funções antes de ligar a checagem, senão o check reprova.
