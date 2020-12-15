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
    let validCommands = multi_point_commands.concat(single_point_commands);
    let isValidCmd = validCommands.find((cmd) => {
      return args[0] === cmd;
    });

    // Check for valid args[0]
    if (!isValidCmd) {
      logger.logCommandError(
        message,
        this.name,
        `User did not supply a valid command`
      );
      // prettier-ignore
      return message.reply(
        `Error: Make sure you are using the right command! It must be one of the following \`${validCommands.join(",")}\`. Please consult the usage by typing \`${prefix}help ${this.name}\` to get more info`
      );
    }

    // Check if supplied an amount and user
    if (args.length < 3) {
      logger.logCommandError(
        message,
        this.name,
        `User did not supply an amount and user, args.length < 2`
      );
      return message.reply(
        `Error: Make sure you have supplied an amount and user! Please consult the usage by typing \`${prefix}help ${this.name}\` to get more info`
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
      // Get pairs of users in format of (amount @<name>) delimited by commas
      let pointPairs = args.slice(1).join("").split(",");
      handlePoints(args[0], message, pointPairs);
    } // End of multi_point_commands if statement
    else if (isSinglePointCmd) {
      // Check if its a valid point amount
      if (!isValidPointAmount(args[1])) {
        logger.logCommandError(
          message,
          module.exports.name,
          `${element}" does not seem to have a valid number`
        );
        message.reply(
          `Error: "${element}" - seems to not have a valid number. Please consult the usage by typing \`${prefix}help ${module.exports.name}\` to get more info`
        );
        return;
      }

      let amount = getPointAmountFromString(args[1]);

      // Combine the name string then delimit by comma, then add amount in front of every data member
      // so the format is (amount @discordname)
      let pointPairs = args.slice(2).join("").split(",");
      pointPairs = pointPairs.map((element) => {
        return `${amount} ${element}`;
      });

      handlePoints(args[0], message, pointPairs);
    } // End of single_point_commands if statement
    else {
      logger.logCommandError(
        message,
        this.name,
        `This should never happen, points.js`
      );
      return message.reply(
        `Error: Make sure you input the right command. Please consult the usage by typing \`${prefix}help ${this.name}\` to get more info`
      );
    }
  },
};

async function handlePoints(cmdName, message, pointPairs) {
  // Ids provided by user
  let gMemberIds = [];
  // Points provided by user
  let gMemberPoints = [];

  for (const pair of pointPairs) {
    let splitArray = pair.trim().split(" ");

    if (splitArray.length !== 2) {
      logger.logCommandError(
        message,
        module.exports.name,
        `"${pair}" does not have the right format`
      );
      return message.reply(
        `Error: "${pair}" - seems to not have the right format. Please consult the usage by typing \`${prefix}help ${module.exports.name}\` to get more info`
      );
    }

    // Check if its a valid point amount
    if (!isValidPointAmount(splitArray[0])) {
      logger.logCommandError(
        message,
        module.exports.name,
        `${pair}" does not seem to have a valid number`
      );
      message.reply(
        `Error: "${pair}" - seems to not have a valid number. Please consult the usage by typing \`${prefix}help ${module.exports.name}\` to get more info`
      );
      return;
    }

    // Validity of @discordname; check if right format of @<name>
    if (!isValidAtNameFormat(splitArray[1])) {
      logger.logCommandError(
        message,
        module.exports.name,
        `${pair}" does not have a valid @<name> format`
      );
      message.reply(
        `Error: "${pair}" - seems to not have a valid @<name> format! Please consult the usage by typing \`${prefix}help ${module.exports.name}\` to get more info`
      );
      return;
    }

    let amount = getPointAmountFromString(splitArray[0]);
    let memberId = getMemberIdFromAtName(splitArray[1]);

    // Validity of @discordname, check if valid gMember of guild
    if (!isValidMemberId(message.guild, memberId)) {
      logger.logCommandError(
        message,
        module.exports.name,
        `${pair}" does not have a valid @<name> that is in the server`
      );
      message.reply(
        `Error: "${pair}" - seems to not exist in the current server! Please consult the usage by typing \`${prefix}help ${module.exports.name}\` to get more info`
      );
      return;
    }

    // Add memberId
    gMemberIds.push(memberId);
    // Add points
    gMemberPoints.push(amount);
  }

  if (gMemberIds.length != pointPairs.length) {
    logger.logCommandError(
      message,
      module.exports.name,
      `gMemberIds.length != newArgs.length!, missing memberid?`
    );
    return message.reply(
      `Error: Please double check your members that you have tagged`
    );
  }

  let cmdSuccess;
  if (cmdName === "give") {
    cmdSuccess = await message.client.pointKeepers
      .get(message.guild.id)
      .givePointsMany(message, gMemberIds, gMemberPoints);
  } else if (cmdName === "remove") {
    cmdSuccess = await message.client.pointKeepers
      .get(message.guild.id)
      .removePointsMany(message, gMemberIds, gMemberPoints);
  } else if (cmdName === "update") {
    cmdSuccess = await message.client.pointKeepers
      .get(message.guild.id)
      .updatePointsMany(message, gMemberIds, gMemberPoints);
  } else if (cmdName === "giveall") {
    cmdSuccess = await message.client.pointKeepers
      .get(message.guild.id)
      .givePointsAll(message, gMemberIds, gMemberPoints);
  } else if (cmdName === "removeall") {
    cmdSuccess = await message.client.pointKeepers
      .get(message.guild.id)
      .removePointsAll(message, gMemberIds, gMemberPoints);
  } else if (cmdName === "updateall") {
    cmdSuccess = await message.client.pointKeepers
      .get(message.guild.id)
      .updatePointsAll(message, gMemberIds, gMemberPoints);
  }

  if (!cmdSuccess) {
    // ERROR
    logger.logCommandError(
      message,
      cmdName,
      `Error in running command [points ${cmdName}]`
    );
    return;
  }

  logger.logCommandSuccess(message, `points ${cmdName}`);
}

function getMemberIdFromAtName(memAtName) {
  let gMemberMatch = memAtName.match(/[0-9]+/);
  return gMemberMatch ? gMemberMatch[0] : null;
}

function isValidAtNameFormat(atName) {
  // Validity of @discordname; check if right format of @<name>
  let gMemberMatch = atName.match(/[0-9]+/);
  return gMemberMatch ? true : false;
}
function isValidMemberId(guild, gMemberId) {
  let guildMembers = guild.members.cache;
  let gMember = guildMembers.get(gMemberId);
  //check if args[0] is a person in the server
  return gMember ? true : false;
}

function isValidPointAmount(amount) {
  // Grab the amount and check if its a valid number
  return Number(isNaN(amount)) ? false : true;
}

function getPointAmountFromString(amountString) {
  return Number(amountString);
}
