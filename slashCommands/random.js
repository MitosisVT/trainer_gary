const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const pokemon = require("pokemon");
const Pokedex = require("pokedex-promise-v2").default;

const P = new Pokedex();

// ✅ capitalization + HP fix
const capitalizeWords = (str) =>
  str
    .split(/[- ]/)
    .map(word => {
      const lower = word.toLowerCase();

      if (lower === "hp") return "HP"; // ✅ force uppercase HP

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random")
    .setDescription("Get a random Pokémon"),

  async execute(interaction) {
    await interaction.deferReply();

    const embedRandom = pokemon.random();
    const name = embedRandom.toLowerCase().trim();

    try {
      const data = await P.getPokemonByName(name);
      const species = await P.getPokemonSpeciesByName(name);

      const types = data.types
        .map(t => capitalizeWords(t.type.name))
        .join(", ");

      const abilities = data.abilities
        .map(a => capitalizeWords(a.ability.name))
        .join(", ");

      const stats = data.stats
        .map(s => `${capitalizeWords(s.stat.name)}: ${s.base_stat}`)
        .join("\n");

      const region = capitalizeWords(
        species.generation.name.replace("generation-", "")
      );

      const entry = species.flavor_text_entries.find(
        e => e.language.name === "en"
      );

      const flavor = entry
        ? entry.flavor_text.replace(/[\n\f]/g, " ")
        : "No description available.";

      const embed = new EmbedBuilder()
        .setAuthor({
          name: "Pokemon Central / Trainer Gary",
          iconURL: "https://media.discordapp.net/attachments/1492561327502393566/1492947487864918216/oie_UkpuV3OrJ8jW.png"
        })
        .setTitle(`Random Pokemon: ${capitalizeWords(embedRandom)}`)
        .setDescription(flavor)
        .setColor("#ff3300")
        .setFooter({
          text: "Pokemon Trainer Gary is in no way affiliated with Pokemon of America, Niantic, Game Freak, or Nintendo."
        })
        .addFields(
          { name: "Generation", value: region || "Unknown", inline: true },
          { name: "Type", value: types || "Unknown", inline: true },
          { name: "Abilities", value: abilities || "Unknown", inline: true },
          { name: "Stats", value: stats || "Unknown" }
        )
        .setImage(data.sprites.other["official-artwork"].front_default);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply("❌ Failed to fetch Pokémon data. Please try again.");
    }
  }
};