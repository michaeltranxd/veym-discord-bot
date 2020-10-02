const { prefix } = require("../config.json");
const { nganhInputs } = require("../util/util.json");

module.exports = {
  name: "points-list",
  description: "List points for members",
  args: true, // Include if command requires args
  usage:
    "<nganh> name\n" +
    "<nganh> points\n" +
    "overall name\n" +
    "overall nganh name\n" +
    "overall nganh points\n" +
    "overall points", // Include if args is true
  guildOnly: true, // Include if exclusive to server
  cooldown: 1,
  execute(message, args) {
    // Check if its a <nganh> or overall
    if (!nganhInputs.includes(args[0]) && args[0] !== "overall") {
      return message.reply(
        `Error: I was expecting a valid argument! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    // Check if we have arguments after
    if (args.length < 2) {
      return message.reply(
        `Error: Make sure you have supplied how you want to sort! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    if (nganhInputs.includes(args[0])) {
      // Check if its name and points
      if (args[1] === "name") {
        return message.client.pointKeepers
          .get(message.guild.id)
          .listOfANganhByName(message, args[0]);
      } else if (args[1] === "points") {
        return message.client.pointKeepers
          .get(message.guild.id)
          .listOfANganhByPoints(message, args[0]);
      } else {
        return message.reply(
          `Error: Make sure you have supplied a valid sort! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
        );
      }
    } // end of nganhInputs check
    else if (args[0] === "overall") {
      // Check if its name and points
      if (args[1] === "name") {
        return message.client.pointKeepers
          .get(message.guild.id)
          .listOverallByName(message);
      } else if (args[1] === "points") {
        return message.client.pointKeepers
          .get(message.guild.id)
          .listOverallByPoints(message);
      } else if (args[1] === "nganh") {
        if (args.length < 3) {
          return message.reply(
            `Error: Make sure you have supplied how you want to sort each nganh! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          );
        }

        if (args[2] === "name") {
          return message.client.pointKeepers
            .get(message.guild.id)
            .listOverallByNganhThenName(message);
        } else if (args[2] === "points") {
          return message.client.pointKeepers
            .get(message.guild.id)
            .listOverallByNganhThenPoints(message);
        } else {
          return message.reply(
            `Error: Make sure you have supplied a valid sort! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          );
        }
      } // end of args[1] === 'nganh'
      else {
        // Don't recognize...
        return message.reply(
          `Error: Make sure you have supplied how you want to sort each nganh! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
        );
      }
    }
  },
};
