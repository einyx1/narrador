import 'dotenv/config';
import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
} from 'discord.js';
import { env } from './src/env.js';
import { handleAkumatizedMessage } from './src/akumatized-handler.js';
import { handleGimmiButton, handleGimmiMessage } from './src/gimmi-handler.js';
import { handleMessage } from './src/message-handler.js';
import { handleUnificar, unificarCommandData } from './src/commands/unificar.js';
import { dividirCommandData, handleDividir } from './src/commands/dividir.js';
import { handleMonarch, monarchCommandData } from './src/commands/monarch.js';
import {
  convocarCommandData,
  crescerCommandData,
  guardiaoCommandData,
  handleConvocar,
  handleCrescer,
  handleGuardiao,
  handleRenunciar,
  renunciarCommandData,
} from './src/commands/guardian-tools.js';
import {
  handleMiraculousMemberLeave,
  handleMiraculousRoleUpdate,
  handleMiraculousSelectionInteraction,
  handlePainelMiraculous,
  painelMiraculousCommandData,
  refreshMiraculousPanels,
} from './src/commands/painel-miraculous.js';
import { handleSentimonsterMessage } from './src/sentimonster-handler.js';
import { startControlPanel } from './src/server.js';
import { applyNicknameFromCharacterSheetMessage } from './src/services/character-sheet.js';
import { isHeroTransformed, proxyHeroMessage } from './src/services/hero-proxy.js';
import { scheduleTemporaryMessageDeletion } from './src/services/message-cleanup.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Bot conectado como ${readyClient.user.tag}.`);

  try {
    const commandPayloads = [
      unificarCommandData.toJSON(),
      dividirCommandData.toJSON(),
      painelMiraculousCommandData.toJSON(),
      guardiaoCommandData.toJSON(),
      renunciarCommandData.toJSON(),
      crescerCommandData.toJSON(),
      convocarCommandData.toJSON(),
      monarchCommandData.toJSON(),
    ];
    const guildCommands = await readyClient.application.commands.fetch({ guildId: env.guildId });
    const oldIdsCommand = guildCommands.find((command) => command.name === 'ids-membros');
    if (oldIdsCommand) await oldIdsCommand.delete();

    for (const commandData of commandPayloads) {
      const existing = guildCommands.find((command) => command.name === commandData.name);
      if (existing) await existing.edit(commandData);
      else await readyClient.application.commands.create(commandData, env.guildId);
    }

    console.log('Comandos slash do Narrador sincronizados automaticamente neste servidor.');
    await refreshMiraculousPanels(readyClient);
  } catch (error) {
    console.error('N\u00e3o foi poss\u00edvel sincronizar /unificar:', error);
  }
});

client.on(Events.MessageCreate, async (message) => {
  try {
    const wasTransformed = isHeroTransformed(message.author.id);
    scheduleTemporaryMessageDeletion(message, env.guildId);

    await applyNicknameFromCharacterSheetMessage(message);
    await proxyHeroMessage(message, wasTransformed);
    const handledBySentimonster = await handleSentimonsterMessage(message);
    const handledByGimmi = !handledBySentimonster && await handleGimmiMessage(message);
    if (!handledBySentimonster && !handledByGimmi) {
      await handleMessage(message);
      await handleAkumatizedMessage(message);
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (await handleGimmiButton(interaction)) return;
    if (await handleMiraculousSelectionInteraction(interaction)) return;
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'unificar') await handleUnificar(interaction);
    else if (interaction.commandName === 'dividir') await handleDividir(interaction);
    else if (interaction.commandName === 'painel-miraculous') await handlePainelMiraculous(interaction);
    else if (interaction.commandName === 'guardião') await handleGuardiao(interaction);
    else if (interaction.commandName === 'renunciar') await handleRenunciar(interaction);
    else if (interaction.commandName === 'crescer') await handleCrescer(interaction);
    else if (interaction.commandName === 'convocar') await handleConvocar(interaction);
    else if (interaction.commandName === 'monarch') await handleMonarch(interaction);
    else return;
  } catch (error) {
    console.error(`Erro no comando /${interaction.commandName}:`, error);

    const content =
      'N\u00e3o consegui concluir o comando. Confira minhas permiss\u00f5es de cargos, mensagens e webhooks.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content }).catch(() => null);
    } else {
      await interaction.reply({ content, ephemeral: true }).catch(() => null);
    }
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  if (member.guild.id !== env.guildId) return;
  await handleMiraculousMemberLeave(member).catch((error) =>
    console.error('Não consegui atualizar as vagas de Miraculous:', error),
  );
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  if (newMember.guild.id !== env.guildId) return;
  await handleMiraculousRoleUpdate(oldMember, newMember).catch((error) =>
    console.error('Não consegui atualizar as vagas após uma alteração de cargos:', error),
  );
});

process.on('unhandledRejection', (error) => {
  console.error('Promessa rejeitada sem tratamento:', error);
});

await startControlPanel(client);
await client.login(env.discordToken);
