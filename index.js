const { Client, GatewayIntentBits, EmbedBuilder, ActivityType, Collection } = require("discord.js");
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences
  ]
});

const config = require("./config.json");
const fs = require("fs");

// ✅ command collection
bot.commands = new Collection();

// ✅ load commands
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

bot.slashCommands = new Collection();

const slashFiles = fs.readdirSync("./slashCommands").filter(file => file.endsWith(".js"));

for (const file of slashFiles) {
  const command = require(`./slashCommands/${file}`);
  bot.slashCommands.set(command.data.name, command);
}

bot.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = bot.slashCommands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      interaction.followUp({ content: "❌ Error executing command.", ephemeral: true });
    } else {
      interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
    }
  }
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

bot.on("clientReady", () => {
  console.log("hi");
  bot.user.setPresence({
    activities: [{ name: `Watching 1025 different Pokemon!`, type: ActivityType.Watching }],
    status: "online"
  });
});

bot.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const prefix = config.prefix;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  const command = bot.commands.get(cmd);

  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("❌ Error executing command.");
  }
});

bot.login(config.token);