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

    // 👇 silhouette version (blackened)
    const silhouette = `https://images.weserv.nl/?url=${encodeURIComponent(image)}&w=475&h=475&fit=contain&mask=black`;

    const embed = new EmbedBuilder()
      .setTitle("Who's That Pokémon?")
      .setDescription("Type your guess in chat! You have 10 seconds to respond!")
      .setColor("#000000")
      .setImage(silhouette);

    await interaction.editReply({ embeds: [embed] });

    const filter = m => !m.author.bot;
    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 10000
    });

    collector.on("collect", msg => {
      if (msg.content.toLowerCase() === name) {
        msg.reply(`🎉 Correct! It was **${name}**`);

        // 👇 reveal the actual Pokémon
        const revealEmbed = new EmbedBuilder()
          .setTitle(`It's ${name}!`)
          .setColor("#00ff00")
          .setImage(image);

        interaction.followUp({ embeds: [revealEmbed] });

        collector.stop("guessed");
      }
    });

    collector.on("end", (collected, reason) => {
      if (reason !== "guessed") {
        const revealEmbed = new EmbedBuilder()
          .setTitle(`⏰ Time's up! It was ${name.toUpperCase()}`)
          .setColor("#ff0000")
          .setImage(image);

        interaction.followUp({ embeds: [revealEmbed] });
      }
    });
  }
};