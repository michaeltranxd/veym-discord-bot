const { prefix } = require("../config.json");
const logger = require("../util/logger");

const multi_point_commands = ["give", "remove", "update"];
const single_point_commands = ["giveall", "removeall", "updateall"];

module.exports = {
  name: "points",
  description: "Add, remove, and update, points for members",
  args: true, // Include if command requires args
  usage:
    "give <amount> <@discordname>, <amount> <@discordname>, ...\n" +
    "giveall <amount> <@discordname>, <@discordname>, ...\n" +
    "remove <amount> @discordname, <amount> <@discordname>, ...\n" +
    "removeall <amount> <@discordname>, <@discordname>, ...\n" +
    "update <amount> @discordname, <amount> <@discordname>, ...\n" +
    "updateall <amount> <@discordname>, <@discordname>, ...", // Include if args is true
  admin_permissions: true,
  guildOnly: true, // Include if exclusive to server
  cooldown: 1,
  execute(message, args) {
    // Ids to provide to give,remove,update
    let gMemberIds = [];
    // Points to provide to give,remove,update
    let gMemberPoints = [];

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

    // command with users and points delimited by comma so every user has its own point gain/loss/update
    let isMultiPointCmd = multi_point_commands.find((cmd) => {
      return args[0] === cmd;
    });
    // command ending with -all, give points for every one listed
    let isSinglePointCmd = single_point_commands.find((cmd) => {
      return args[0] === cmd;
    });

    // (give, remove, update)
    if (isMultiPointCmd) {
      // Its multi user+multipoints so we parse differently
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

        // Add memberId
        gMemberIds.push(gMemberId);
        // Add points
        gMemberPoints.push(amount);
      });

      if (gMemberIds.length === newArgs.length) {
        handle(args[0], message, gMemberIds, gMemberPoints);
      }
    } // End of multi_point_commands if statement
    else if (isSinglePointCmd) {
      // (giveall, removeall, updateall)

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

        // Add memberId
        gMemberIds.push(gMemberId);
        // Add points
        gMemberPoints.push(amount);
      });

      handle(args[0], message, gMemberIds, gMemberPoints[0]);
    } // End of single_point_commands if statement
    else {
      return message.reply(
        `Error: Make sure you input the right command. Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }
  },
};

async function handle(cmdName, message, gMemberIds, gMemberPoints) {
  if (cmdName === "give") {
    console.log(
      await message.client.pointKeepers
        .get(message.guild.id)
        .givePointsMany(message, gMemberIds, gMemberPoints)
    );
  } else if (cmdName === "remove") {
    console.log(
      message.client.pointKeepers
        .get(message.guild.id)
        .removePointsMany(message, gMemberIds, gMemberPoints)
    );
  } else if (cmdName === "update") {
    message.client.pointKeepers
      .get(message.guild.id)
      .updatePointsMany(message, gMemberIds, gMemberPoints);
  } else if (cmdName === "giveall") {
    message.client.pointKeepers
      .get(message.guild.id)
      .givePointsAll(message, gMemberIds, gMemberPoints);
  } else if (cmdName === "removeall") {
    message.client.pointKeepers
      .get(message.guild.id)
      .removePointsAll(message, gMemberIds, gMemberPoints);
  } else if (cmdName === "updateall") {
    message.client.pointKeepers
      .get(message.guild.id)
      .updatePointsAll(message, gMemberIds, gMemberPoints);
  }
}
