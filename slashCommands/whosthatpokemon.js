const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const pokemon = require("pokemon");
const Pokedex = require("pokedex-promise-v2").default;

const P = new Pokedex();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whosthatpokemon")
    .setDescription("Who's that Pokémon?"),

  async execute(interaction) {
    await interaction.deferReply();

    const name = pokemon.random().toLowerCase();
    const data = await P.getPokemonByName(name);

    const image = data.sprites.other["official-artwork"].front_default;

    const embed = new EmbedBuilder()
      .setTitle("Who's That Pokémon?")
      .setDescription("Type your guess in chat!")
      .setColor("#000000")
      .setImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${data.id}.png`)

    await interaction.editReply({ embeds: [embed] });

    const filter = m => !m.author.bot;
    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 15000
    });

    collector.on("collect", msg => {
      if (msg.content.toLowerCase() === name) {
        msg.reply(`🎉 Correct! It was **${name}**`);
        collector.stop();
      }
    });

    collector.on("end", () => {
      interaction.followUp(`⏰ Time's up! It was **${name}**`);
    });
  }
};