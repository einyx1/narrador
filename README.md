# Bot Miraculous: A Nova Ordem

Bot em JavaScript/Discord.js com transformações, poderes, cooldowns, fusões por slash command e sentimonstros controlados pela Groq. As respostas só funcionam no servidor e nas quatro categorias configuradas no `.env`.

## Instalação

1. Instale o Node.js 22 ou mais recente.
2. Abra esta pasta em um terminal e execute `npm install`.
3. Preencha no `.env`:
   - `DISCORD_TOKEN`: token do bot.
   - `CLIENT_ID`: ID da aplicação do bot.
   - `GROQ_API_KEY`: chave da Groq.
   - Os IDs do servidor, categorias e cargo de bypass já estão preenchidos.
4. No Discord Developer Portal, ative **Server Members Intent** e **Message Content Intent**.
5. Convide o bot com os escopos `bot` e `applications.commands` e as permissões **Ver canais**, **Enviar mensagens**, **Inserir links**, **Gerenciar mensagens**, **Gerenciar cargos** e **Gerenciar webhooks**.
6. Na lista de cargos, coloque o cargo do bot acima de todos os cargos de fusão.
7. Execute `npm start`.

Ao iniciar, o bot abre primeiro o painel local e depois conecta ao Discord. Ele cria ou atualiza os comandos `/unificar` e `/dividir` e remove a versão antiga de `/ids-membros`. Se precisar registrar manualmente, use `npm run deploy`.

## Transformações e poderes

- A pessoa precisa dizer primeiro a frase de transformação correspondente ao seu cargo.
- Não é possível repetir a frase enquanto já estiver transformada.
- Sem o cargo correto ou sem transformação, o poder não é executado.
- Um poder com cooldown não pode ser repetido antes de cinco minutos, exceto pelo cargo de bypass configurado.
- Avisos de transformação repetida, poder repetido e contagem regressiva são enviados somente por DM.
- A destransformação automática publica apenas o GIF, sem marcar a pessoa.
- A frase manual de destransformação cancela os cooldowns e limpa todas as transformações da pessoa.
- Os estados de transformação e cooldown ficam em memória e zeram quando o bot reinicia.

## Dado automático dos poderes

Ao usar um poder que depende de acerto, o bot rola `1d20` internamente e publica o nome do poder, o número obtido e o resultado:

- `1–5`: errou e realizou uma ação prejudicial;
- `6–9`: errou;
- `10–15`: acertou;
- `16–20`: acertou com bônus na ação.

Não existe rolagem para acertos garantidos: Segunda Chance, Akumatização, Amokização, Toca do Coelho, Viagem, Miragem, Gênese, Sublimação e Talismã da Sorte. A regra também vale para esses poderes quando usados por uma fusão.

## Poderes dos Guardiões

Os cargos Guardião (`1525181701490212884`) e Guardião Celestial (`1525181746780438669`) podem usar estas frases para publicar os GIFs configurados: `Tempestade celestial, os milhares punhos de lhama derrubam os lesados no chão!`, `Garras de 100 mil dragões!`, `A ira da centopeia com unha encravada!`, `As garras do gato faminto são impotentes contra o punho de ferro do leiteiro!` e `Minha raiva é minha, mas eu não sou minha raiva!`.

## Segunda Chance

- Na primeira ativação, o bot salva a mensagem silenciosamente como primeiro marco.
- Na segunda ativação, apaga silenciosamente as mensagens posteriores no mesmo canal, preserva a mensagem do primeiro marco e publica apenas a animação da volta no tempo.
- O marco desaparece depois de cinco minutos, ao destransformar ou ao usar `/dividir`.
- Sem Grow Up, depois de voltar ao marco é preciso destransformar ou esperar o prazo restante para criar outro.
- Com o cargo Grow Up configurado em `BYPASS_ROLE_ID`, a segunda ativação consome o marco e a próxima utilização já pode salvar um novo primeiro marco.

## `/unificar`

Use `/unificar fusao:<nome>` dentro de uma categoria autorizada. O bot:

1. Confere se a pessoa possui os Miraculous necessários.
2. Cria um webhook temporário com o nome e avatar da própria pessoa.
3. Envia `X, Y, Combinar[!](link-do-gif)`, deixando o GIF oculto no `!` clicável.
4. Remove os cargos dos Miraculous usados e adiciona o cargo da fusão.
5. Remove o webhook temporário; a mensagem continua no canal.

Erros e impedimentos do slash command são efêmeros. As 19 fusões e seus cargos estão configurados em `src/config/miraculous.js`.

Para o Monarch V1, use o campo livre `texto`. Exemplo: `/unificar fusao:Monarch V1 texto:Sass, qualquer string`. O bot envia `Nooroo, Sass, qualquer string, Combinar[!](gif)` sem limitar o texto a uma lista predefinida. Os cargos do Monarch V1 continuam os mesmos.

## Painel para escolher Miraculous

Um administrador com a permissão **Gerenciar cargos** usa `/painel-miraculous publicar` no canal `#escolha-seu-miraculous`. O bot publica uma mensagem fixa com menu suspenso e atualiza a lista automaticamente.

Somente membros com o cargo `1525916812905025536` podem confirmar uma escolha. A confirmação aparece apenas para a pessoa, cada membro recebe no máximo um Miraculous e uma vaga não pode ser escolhida quando o cargo já pertence a alguém.

Administradores podem usar `/painel-miraculous fechar miraculous:...` para ocultar uma vaga, ou `/painel-miraculous abrir miraculous:...` para devolvê-la ao menu. Fechar uma vaga não remove o cargo de quem já a possui. Quando o portador sair do servidor, o painel se atualiza e libera a vaga automaticamente.

Ao confirmar a escolha, o bot entrega o cargo do Miraculous, adiciona **Civil** (`1525636717120454696`), remove **Sem miraculous** (`1525916812905025536`) e inicia uma entrevista na DM. Ela pergunta nome civil, nome de herói, idade, nacionalidade, personalidade, lado, altura, história, aparência civil e aparência heroica. A ficha pronta é publicada no canal `1528457721907642408`, com a marcação do portador, os nomes no formato `Civil / Herói` e as duas imagens anexadas abaixo. Cada pergunta expira após quinze minutos; cancelar ou deixar a entrevista expirar não remove o Miraculous já escolhido.

A segunda imagem é salva automaticamente como avatar da identidade heroica. Quando a pessoa estiver transformada nas categorias de RP, o webhook usará o nome depois da `/` e essa aparência heroica. A referência aponta para a cópia publicada no canal de fichas, permitindo renovar o link do anexo quando necessário.

Depois dos dois primeiros nomes, o bot altera o apelido para `𓈒 emoji 𓂂 ︶𝆹𝅥 Civil / Herói꒷emoji꒦`, usando os símbolos do animal correspondente ao Miraculous. Para isso, o bot precisa de **Gerenciar apelidos** e seu cargo deve estar acima do cargo do membro.

O painel também reage quando um administrador adiciona ou remove manualmente um cargo de Miraculous: a vaga some ou reaparece sem precisar reiniciar ou usar `/painel-miraculous abrir`.

## Comandos do Guardião e dos heróis

- `/guardião pessoa miraculous`: exige o cargo Guardião `1525181701490212884`. Entrega um dos 20 Miraculous atuais, troca **Sem miraculous** por **Civil** e faz a fala da cerimônia pelo webhook de quem executou o comando.
- `/renunciar`: remove todos os Miraculous-base da pessoa, limpa transformação, Segunda Chance e cooldowns, remove **Civil**, devolve **Sem miraculous** e publica a renúncia pelo webhook da própria pessoa. Os cinco GIFs fornecidos são usados para Tikki, Plagg, Nooroo, Fluff e Duusu.
- `/crescer pessoa`: exclusivo para administradores. O alvo fala pelo próprio webhook heroico, usando nome e imagem heroica configurados, e recebe **Portador Crescido** `1524990474560213113`.
- `/convocar pessoa`: usa o webhook de quem convocou no canal atual e envia uma DM ao alvo com o nome da pessoa, a menção do canal e um link direto para chegar até ele.
- `/monarch miraculous`: mostra somente o GIF do kwami escolhido pelo webhook de quem executou. Possui Longg, Trixx, Mullo, Kaalki, Daizzy, Barkk, Sass, Ziggy, Stompp, Roarr, Orikko, Xuppu, Wayzz e Pollen; não adiciona nem remove cargos.

## Revelação de Tikki e Plagg

Esta é uma função separada de `/unificar`. A pessoa com os cargos Ladybug e Gato Preto diz `Tikki, Plagg, revelem-se!`. O bot remove os dois cargos, adiciona o cargo `1525211458189656258`, publica `[.](https://imgur.com/QmV5uUw)`, espera sete segundos e envia a fala da Tikki por webhook. Após mais dois segundos, envia a fala do Plagg por webhook. Cooldowns e estados temporários dos Miraculous consumidos são limpos nessa troca.

## Desejo do Gimmi

Quem possui **Tikki & Plagg Revelados** (`1525211458189656258`) pode dizer `Gimmi, revele-se` (com ou sem `!`). Sem **Permissão do Supremo** (`1525215032357421196`), o bot envia a fala do Supremo, entrega o **Selo do Supremo** (`1525221946969817249`), remove Tikki & Plagg Revelados após quatro segundos e remove o Selo após quinze minutos. O ID antigo do código original também é tentado nesse momento, caso ainda exista no servidor.

Com a Permissão do Supremo, o bot entrega **Poder Supremo** (`1525221045651509379`), apresenta o Gimmi como Kwami da Realidade e cria um botão de desejo exclusivo para quem invocou. Depois do clique, o Gimmi pergunta o desejo e o sacrifício, aguardando até dois minutos por cada resposta. No fim, remove Tikki & Plagg Revelados e Poder Supremo.

## `/dividir`

`/dividir` não precisa de opções. Ele detecta qualquer um dos 19 cargos de fusão, fala a frase de divisão pelo webhook da pessoa, restaura os cargos dos Miraculous usados e remove o cargo fundido. Se houver mais de uma fusão, divide todas de uma vez.

## Identidades heroicas

Nas três categorias de RP configuradas para o proxy heroico, a primeira mensagem de transformação permanece com o nome civil. Enquanto a transformação estiver ativa, as mensagens seguintes são substituídas por um webhook com o avatar da pessoa e somente a parte do nome depois de `/`. A decoração externa do apelido é preservada. Quem não possui `/` no nome exibido é ignorado.

O webhook heroico é reutilizado durante 30 minutos em cada canal, evitando que o Discord repita nome e avatar em todas as falas consecutivas. Ao responder uma mensagem, o webhook inclui um quadro de contexto no estilo Tupperbox com o autor e o trecho respondido.

Ao destransformar ou usar `/dividir`, as mensagens voltam automaticamente para a identidade normal. A aba **Ícones dos heróis** do painel permite configurar uma URL HTTPS individual para cada membro; sem alteração, o webhook usa o avatar normal do Discord.

## Mensagens temporárias

Qualquer mensagem enviada neste servidor que terminar em `//`, com ou sem espaço antes ou depois, será apagada após cinco segundos, inclusive quando tiver sido reenviada pelo webhook heroico. Exemplos: `oi codex//` e `oi codex // `. O bot precisa da permissão **Gerenciar mensagens**.

## Sentimonstros com Groq

Quando o bot estiver ligado, abra `http://localhost:3000/` no mesmo computador. Se a página recusar a conexão, encerre o bot e execute `npm run painel` para testar somente o site. O painel permite definir:

- nome do sentimonstro;
- personalidade, origem, poderes, objetivos e jeito de falar;
- primeira fala opcional;
- direção visual;
- URL HTTPS do avatar usado pelo webhook.

O botão **Gerar descrição visual com Groq** cria um prompt visual detalhado para a futura imagem. A Groq usada aqui é um modelo de texto: ela escreve o conteúdo visual, mas não renderiza a imagem final. Coloque a imagem pronta no campo de avatar por uma URL HTTPS.

No Discord:

- `Apareça sentimonstro!` publica o GIF do Imgur e faz a criatura entrar no canal.
- Apenas usuários transformados com o Pavão ou Shadow Moth podem invocar; cada usuário pode manter um sentimonstro ativo.
- As falas usam webhook com o nome e o avatar configurados para o sentimonstro.
- Responder diretamente uma mensagem do sentimonstro faz a criatura responder, sem precisar chamá-la pelo nome.
- `Eu te liberto da realidade` publica o GIF de libertação e desfaz somente o sentimonstro pertencente a quem disse a frase.
- `amokatizar` envia a DM de configuração do painel apenas uma vez por usuário.
- `Sentimonstro, sua mensagem` conversa com a criatura. Se você mudar o nome no painel, também pode chamá-la pelo novo nome.
- `Desapareça sentimonstro!` encerra a aparição.
- A criatura só responde no canal em que foi invocada.

Os dados ficam em `data/sentimonster.json`. A chave da Groq existe apenas no processo do bot e nunca é enviada ao navegador.

## Akumatizado com conversa e combate

A aba **Akumatizado** do painel configura uma sessão completa: identidade e avatar civil, emoção anterior à transformação, nome e avatar de vilão, personalidade, poderes, fraqueza, objeto akumatizado e pontos de vida. A chave da Groq continua somente no processo do bot.

Fluxo no Discord:

1. Uma pessoa transformada com a Borboleta ou uma fusão compatível diz `Iniciar akumatização!`.
2. O alvo civil aparece por webhook. A portadora conversa respondendo ao webhook ou chamando `Alvo, ...` ou o nome configurado.
3. A portadora diz `Akumatização`, `Mega Akumatização` ou `Ultra Akumatização` para iniciar a forma de vilão.
4. Os membros podem responder ao webhook, chamar o nome do vilão ou usar diretamente `Atacar: descrição`.
5. Para atingir o objeto, usam `Quebrar objeto: descrição`, `Destruir objeto: descrição` ou `Atacar objeto: descrição`.
6. `Encerrar akumatizado!` termina manualmente a sessão.

Cada ataque rola `1d20`: `1–5` causa 2 de dano no atacante, `6–9` erra, `10–15` causa 2 de dano e `16–20` causa 4. O vilão contra-ataca automaticamente com a mesma tabela; a Groq narra a reação sem poder alterar o dado ou a vida. A quebra do objeto liberta o akuma e encerra a luta. Existe apenas uma sessão akumatizada ativa por vez.

Os dados ficam em `data/akumatized.json`.

## Histórico do painel

A aba **Histórico** mostra as sessões encerradas de sentimonstros e akumatizados, com personagem, responsável, canal, data e motivo do encerramento. Cada tipo mantém as 100 sessões mais recentes no computador onde o bot está rodando. O botão **Limpar histórico** remove somente os registros encerrados; não encerra nem altera sessões que ainda estejam ativas.

## Arquivos principais

- `index.js`: inicia o Discord, sincroniza `/unificar` e abre o painel local.
- `.env`: local para preencher tokens e configurações.
- `src/config/miraculous.js`: cargos, fusões, frases e GIFs.
- `src/akumatized-handler.js`: conversa civil, transformação e combate do akumatizado.
- `src/message-handler.js`: transformações, poderes e avisos privados.
- `src/commands/unificar.js`: slash command de fusão.
- `src/sentimonster-handler.js`: invocação e conversa do sentimonstro.
- `src/services/groq.js`: respostas e descrição visual com Groq.
- `src/services/webhooks.js`: webhooks pessoais, do sentimonstro e do akumatizado.
- `public/`: site local de configuração.

## Observação sobre GIFs

As 19 fusões possuem um GIF individual em `fusionAnimationByKey`; o `/unificar` não reutiliza mais animações pela quantidade de kwamis.

Todos os links fornecidos foram preservados. Alguns anexos antigos do Discord possuem URLs assinadas e podem expirar; se isso acontecer, substitua o link em `src/config/miraculous.js` por uma URL permanente.
