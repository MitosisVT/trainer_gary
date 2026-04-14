const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const pokemon = require("pokemon");
const Pokedex = require("pokedex-promise-v2").default;

const P = new Pokedex();

const activeGames = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whosthatpokemon")
    .setDescription("Who's that Pokémon?"),

  async execute(interaction) {
    const channelId = interaction.channel.id;

    if (activeGames.has(channelId)) {
      return interaction.reply({
        content: "⚠️ A game is already running in this channel!",
        ephemeral: true
      });
    }

    activeGames.add(channelId);

    await interaction.deferReply();

    let name, data, image;

    try {
      name = pokemon.random().toLowerCase();

      data = await P.getPokemonByName(name);

      // 🚨 validate response
      if (!data || !data.sprites) {
        throw new Error("Invalid Pokémon data");
      }

      image =
        data.sprites.other?.["official-artwork"]?.front_default ||
        data.sprites.front_default;

      if (!image) {
        throw new Error("Missing image");
      }

    } catch (err) {
      console.error("Pokémon API error:", err);

      activeGames.delete(channelId); // 🔑 cleanup

      return interaction.editReply({
        content:
          "⚠️ Failed to fetch a Pokémon. Please try again in a moment."
      });
    }

    const silhouette = `https://images.weserv.nl/?url=${encodeURIComponent(
      image
    )}&w=475&h=475&fit=contain&mask=black`;

    let revealed = false;

    const embed = new EmbedBuilder()
      .setTitle("Who's That Pokémon?!")
      .setDescription("🕵️ Type your guess in chat!\n⏳ You have **15 seconds**!")
      .setColor("#000000")
      .setImage(silhouette);

    await interaction.editReply({ embeds: [embed] });

    // 💡 hint
    const hintTimeout = setTimeout(() => {
      if (!revealed) {
        interaction.followUp({
          content: `💡 Hint: Starts with **${name[0].toUpperCase()}**`
        });
      }
    }, 7000);

    const filter = (m) =>
      !m.author.bot && m.channel.id === interaction.channel.id;

    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 15000
    });

    collector.on("collect", async (msg) => {
      const guess = msg.content.toLowerCase().trim();

      if (guess !== name) return;

      revealed = true;
      clearTimeout(hintTimeout);

      const revealEmbed = new EmbedBuilder()
        .setTitle(`🎉 It's ${name.toUpperCase()}!`)
        .setColor("#00ff00")
        .setImage(image);

      await msg.reply({
        content: `🎉 ${msg.author} got it right!`,
        embeds: [revealEmbed]
      });

      collector.stop("guessed");
    });

    collector.on("end", async (_, reason) => {
      activeGames.delete(channelId); // 🔑 ALWAYS cleanup
      clearTimeout(hintTimeout);

      if (reason !== "guessed") {
        const revealEmbed = new EmbedBuilder()
          .setTitle("⏰ Time's up!")
          .setDescription(`It was **${name.toUpperCase()}**`)
          .setColor("#ff0000")
          .setImage(image);

        await interaction.followUp({ embeds: [revealEmbed] });
      }
    });
  }
};