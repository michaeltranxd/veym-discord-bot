const { prefix } = require("../config.json");
const fs = require("fs");

let str = fs.readFileSync(process.cwd() + "/util/inspirationalquotes.txt", {
  encoding: "utf8",
  flag: "r",
});

let quotes = str.split(/\r*\n+/);

str = fs.readFileSync(process.cwd() + "/util/inspirationalauthors.txt", {
  encoding: "utf8",
  flag: "r",
});

let authors = str.split(/\r*\n+/);

if (quotes.length != authors.length) {
  console.error("Quotes + Authors do not match!!!");
}

//console.log(quotes);

module.exports = {
  name: "inspirationalquote",
  description: "Inspirational quote for staying #blessed",
  guildOnly: true, // Include if exclusive to server
  cooldown: 1,
  execute(message, args) {
    if (args.length != 0) {
      return message.reply(
        `Error: Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    let randomIndex = Math.floor(Math.random() * quotes.length);
    console.log(randomIndex);

    message.reply(`${quotes[randomIndex]} - **${authors[randomIndex]}**`);
  },
};
