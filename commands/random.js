const { EmbedBuilder } = require("discord.js");
const pokemon = require("pokemon");
const fs = require("fs");

module.exports = {
  name: "random",

  async execute(message, args) {
    const embedTest = new EmbedBuilder();
    const embedRandom = pokemon.random();

    fs.writeFileSync('./random.txt', embedRandom, "utf8");

    const name = embedRandom.toLowerCase().trim();

    embedTest
      .setAuthor({
        name: "Pokemon Central / Trainer Gary",
        iconURL: "https://media.discordapp.net/attachments/1492561327502393566/1492947487864918216/oie_UkpuV3OrJ8jW.png"
      })
      .setTitle("Random Pokemon")
      .setDescription(`Your random Pokemon is: ${embedRandom}`)
      .setColor("#ff3300")
      .setFooter({
        text: "Pokemon Trainer Gary is in no way affiliated with Pokemon of America, Niantic, Game Freak, or Nintendo."
      })
      .addFields(
        { name: 'Region', value: 'Unknown' },
        { name: 'Evolution(s)', value: 'Unknown' },
        { name: 'hi', value: 'bye' }
      )
      .setImage(`https://img.pokemondb.net/sprites/home/normal/${name}.png`);

    await message.reply({ embeds: [embedTest] });
  }
};