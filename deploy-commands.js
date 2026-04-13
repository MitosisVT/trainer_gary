const { REST, Routes } = require("discord.js");
const fs = require("fs");
const config = require("./config.json");

const commands = [];
const commandFiles = fs.readdirSync("./slashCommands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./slashCommands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(config.clientId), // global
      { body: commands }
    );

    console.log("Slash commands registered!");
  } catch (error) {
    console.error(error);
  }
})();