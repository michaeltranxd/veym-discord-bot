const { prefix } = require("../config.json");
const fs = require("fs");
const logger = require("../util/logger");
const chokidar = require("chokidar"); // Solution to fs.watch (https://github.com/paulmillr/chokidar)

let quoteFileChanged = false;
let authorFileChanged = false;

let folderPath = process.cwd() + "/util/inspirationalquote/";
let quoteFilename = `inspirationalquotes.txt`;
let authorFilename = `inspirationalauthors.txt`;

let quotes = [];
let authors = [];

// Initialize watcher
const watcher = chokidar.watch(folderPath, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});

// Add change event listener
watcher.on("change", (path) => {
  if (path.endsWith(quoteFilename)) quoteFileChanged = true;
  else if (path.endsWith(authorFilename)) authorFileChanged = true;

  if (quoteFileChanged && authorFileChanged) {
    try {
      // Read from file and if it succeeds, that means it updated quotes and authors
      // so mark as unchanged after
      // prettier-ignore
      let success = readFromFile();

      if (success) {
        quoteFileChanged = false;
        authorFileChanged = false;
        logger.log(
          logger.NORMAL,
          "New quotes and authors have been updated, files have been changed"
        );
      }
    } catch (error) {
      // prettier-ignore
      logger.log(logger.ERROR, `Issue opening file in inspirationalquote.js` + error);
    }
  }
});

// Watch the two files
watcher.add([
  `${folderPath}${quoteFilename}`,
  `${folderPath}${authorFilename}`,
]);

function readFromFile() {
  try {
    let quoteFile = fs.readFileSync(`${folderPath}${quoteFilename}`, {
      encoding: "utf8",
      flag: "r",
    });
    let authorFile = fs.readFileSync(`${folderPath}${authorFilename}`, {
      encoding: "utf8",
      flag: "r",
    });

    let newQuotes = quoteFile.split(/\r*\n+/);
    let newAuthors = authorFile.split(/\r*\n+/);

    if (newQuotes.length != newAuthors.length) {
      logger.log(logger.ERROR, `Lines in quotes and authors do not match!!!`);
      return false;
    }

    if (newQuotes.length === 0 || newAuthors.length === 0) {
      logger.log(
        logger.ERROR,
        `Files are empty? Do not have information from quotes and authors`
      );
      return false;
    }

    // At this points quotes and authors are good to update
    quotes = newQuotes;
    authors = newAuthors;

    return true;
  } catch (error) {
    logger.log(
      logger.ERROR,
      `Issue opening file in inspirationalquote.js` + error
    );
    return false;
  }
}

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

    if (quotes.length == 0 && authors.length == 0) {
      let success = readFromFile();
      if (!success)
        return message.reply(
          `I had trouble getting the quotes, please contact the developer about this issue`
        );
    }

    let randomIndex = Math.floor(Math.random() * quotes.length);
    message.reply(`${quotes[randomIndex]} - **${authors[randomIndex]}**`);
  },
};
