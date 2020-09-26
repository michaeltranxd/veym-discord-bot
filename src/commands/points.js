const { prefix } = require("../config.json");

const multi_point_commands = ["give", "remove", "update"];
const single_point_commands = ["giveall", "removeall", "updateall"];
const { nganhInputs } = require("../util/util.json");

module.exports = {
  name: "points",
  description: "Add, remove, update, and list points for members",
  args: true, // Include if command requires args
  usage:
    "give <amount> <@discordname>, <amount> <@discordname>, ...\n" +
    "giveall <amount> <@discordname>, <@discordname>, ...\n" +
    "remove <amount> @discordname, <amount> <@discordname>, ...\n" +
    "removeall <amount> <@discordname>, <@discordname>, ...\n" +
    "update <amount> @discordname, <amount> <@discordname>, ...\n" +
    "updateall <amount> <@discordname>, <@discordname>, ...\n" +
    "list <nganh> name\n" +
    "list <nganh> points\n" +
    "list overall name\n" +
    "list overall nganh name\n" +
    "list overall nganh points\n" +
    "list overall points", // Include if args is true
  guildOnly: true, // Include if exclusive to server
  cooldown: 1,
  execute(message, args) {
    // Check if its list first
    if (args[0] === "list") {
      // Check if supplied an argument
      if (args.length < 2) {
        return message.reply(
          `Error: I was expecting another argument! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
        );
      }

      if (args[1] === "overall") {
        // list overall ...
        // Check if we have arguments after overall
        if (args.length < 3) {
          return message.reply(
            `Error: Make sure you have supplied how you want to sort overall! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          );
        }

        // Check if its name and points
        if (args[2] === "name") {
          return message.client.pointKeepers
            .get(message.guild.id)
            .listOverallByName(message);
        } else if (args[2] === "points") {
          return message.client.pointKeepers
            .get(message.guild.id)
            .listOverallByPoints(message);
        } else if (args[2] === "nganh") {
          if (args.length < 4) {
            return message.reply(
              `Error: Make sure you have supplied how you want to sort each nganh! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
            );
          }

          if (args[3] === "name") {
            return message.client.pointKeepers
              .get(message.guild.id)
              .listOverallByNganhThenName(message);
          } else if (args[3] === "points") {
            return message.client.pointKeepers
              .get(message.guild.id)
              .listOverallByNganhThenPoints(message);
          } else {
            return message.reply(
              `Error: Make sure you have supplied a valid sort! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
            );
          }
        } // end of args[2] === 'nganh'
        else {
          // Don't recognize...
          return message.reply(
            `Error: Make sure you have supplied how you want to sort each nganh! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          );
        }
      } else if (nganhInputs.includes(args[1])) {
        // list <nganh> ...
        // Check if we have arguments after <nganh>
        if (args.length < 3) {
          return message.reply(
            `Error: Make sure you have supplied how you want to sort nganh ${args[1]}! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          );
        }

        // Check if its name and points
        if (args[2] === "name") {
          return message.client.pointKeepers
            .get(message.guild.id)
            .listOfANganhByName(message, args[1]);
        } else if (args[2] === "points") {
          return message.client.pointKeepers
            .get(message.guild.id)
            .listOfANganhByPoints(message, args[1]);
        } else {
          return message.reply(
            `Error: Make sure you have supplied a valid sort! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          );
        }
      } else {
        return message.reply(
          `Error: I dont recognize that! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
        );
      }
    }

    // Check if supplied an amount
    if (args.length < 2) {
      return message.reply(
        `Error: Make sure you have supplied an amount! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    // Check if supplied a user
    if (args.length < 3) {
      return message.reply(
        `Error: Make sure you have supplied a user! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    // Check if multi user+points or single points for every user
    if (
      multi_point_commands.find((com) => {
        return args[0] === com;
      })
    ) {
      // Its multi user+points so we parse differently
      // Combine the string then delimit by comma, then every data member has (# @discordname)
      let newArgs = args.slice(1).join(" ").split(",");
      newArgs.forEach((element) => {
        let splitArray = element.trim().split(" ");

        if (splitArray.length !== 2) {
          return message.reply(
            `Error: "${element}" - seems to not have the right format. Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          );
        }

        // Grab the amount and check if its a valid number
        let amount = Number(splitArray[0]);
        if (isNaN(amount))
          return message.reply(
            `Error: "${element}" - seems to not have a valid number. Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          );

        // Validity of @discordname; check if args[0] is a person in the server
        let gMemberMatch = splitArray[1].match(/[0-9]+/);
        if (!gMemberMatch) {
          return message.reply(
            `Error: "${element}" - seems to not have a valid @<name>! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          );
        }

        let gMemberId = gMemberMatch[0];
        let guildMembers = message.guild.members.cache;
        let gMember = guildMembers.get(gMemberId);

        if (!gMember) {
          return message.reply(
            `Error: "${element}" - seems to not have a valid member! Please @<name> a member of the server!`
          );
        }

        if (args[0] === "give") {
          message.client.pointKeepers
            .get(message.guild.id)
            .givePoints(message, gMember.id, amount);
        } else if (args[0] === "remove") {
          message.client.pointKeepers
            .get(message.guild.id)
            .removePoints(message, gMember.id, amount);
        } else if (args[0] === "update") {
          message.client.pointKeepers
            .get(message.guild.id)
            .updatePoints(message, gMember.id, amount);
        }
      });
    } // End of multi_point_commands if statement
    else if (
      single_point_commands.find((com) => {
        return args[0] === com;
      })
    ) {
      // Its single points then list of users so we parse differently
      // Grab the amount and check if its a valid number
      let amount = Number(args[1]);
      if (isNaN(amount))
        return message.reply(
          `Error: "${element}" - seems to not have a valid number. Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
        );

      // Combine the name string then delimit by comma, then every data member is (@discordname)
      let newArgs = args.slice(2).join(" ").split(",");
      newArgs.forEach((element) => {
        // Validity of @discordname; check if args[0] is a person in the server
        let gMemberMatch = element.trim().match(/[0-9]+/);
        if (!gMemberMatch) {
          return message.reply(
            `Error: "${element}" - seems to not have a valid @<name>! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          );
        }

        let gMemberId = gMemberMatch[0];
        let guildMembers = message.guild.members.cache;
        let gMember = guildMembers.get(gMemberId);

        if (!gMember) {
          return message.reply(
            `Error: "${element}" - seems to not have a valid member! Please @<name> a member of the server!`
          );
        }

        if (args[0] === "giveall") {
          message.client.pointKeepers
            .get(message.guild.id)
            .givePoints(message, gMember.id, amount);
        } else if (args[0] === "removeall") {
          message.client.pointKeepers
            .get(message.guild.id)
            .removePoints(message, gMember.id, amount);
        } else if (args[0] === "updateall") {
          message.client.pointKeepers
            .get(message.guild.id)
            .updatePoints(message, gMember.id, amount);
        }
      });
    } // End of single_point_commands if statement
    else {
      return message.reply(
        `Error: Make sure you input the right command. Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }
  },
};
