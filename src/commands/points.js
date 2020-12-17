const { prefix } = require("../config.json");
const {
  CommandException,
  getMemberIdFromAtName,
  getPointAmountFromString,
  isValidAtNameFormat,
  isValidMemberId,
  isValidPointAmount,
  isValidNganh,
} = require("../util/util.js");

const multi_point_commands = ["give", "remove", "update"];
const single_point_commands = ["giveall", "removeall", "updateall"];
const other_commands = ["list"];

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
    "updateall <amount> <@discordname>, <@discordname>, ...\n" +
    "list <nganh> name\n" +
    "list <nganh> points\n" +
    "list overall name\n" +
    "list overall nganh name\n" +
    "list overall nganh points\n" +
    "list overall points", // Include if args is true
  admin_permissions: true,
  guildOnly: true, // Include if exclusive to server
  cooldown: 1,
  execute(message, args) {
    let validCommands = multi_point_commands
      .concat(single_point_commands)
      .concat(other_commands);
    let isValidCmd = validCommands.find((cmd) => {
      return args[0].toLowerCase() === cmd;
    });

    // Check for valid args[0]
    if (!isValidCmd) {
      //prettier-ignore
      let replyContent = `Error: Make sure you are using the right command! It must be one of the following \`${validCommands.join(",")}\`. Please consult the usage by typing \`${prefix}help ${this.name}\` to get more info`;
      let errorLog = `User did not supply a valid command`;
      throw new CommandException(message, replyContent, this.name, errorLog);
    }

    // Check if list is the keyword
    if (args[0] === "list") {
      // Check if we have arguments after
      if (args.length < 2) {
        //prettier-ignore
        let replyContent = `Error: Make sure you supplied which list you want to display [<nganh>/overall]! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`;
        let errorLog = `User did not supply [<nganh>/overall]`;
        throw new CommandException(message, replyContent, this.name, errorLog);
      }

      // Check if its a <nganh> or overall
      if (!isValidNganh(args[1]) && args[1].toLowerCase() !== "overall") {
        //prettier-ignore
        let replyContent = `Error: I was expecting a valid argument [<nganh>/overall]! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`;
        let errorLog = `User did not supply a valid <nganh>/overall`;
        throw new CommandException(message, replyContent, this.name, errorLog);
      }

      if (isValidNganh(args[1])) {
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
          //prettier-ignore
          let replyContent = `Error: Make sure you have supplied a valid sort for nganh ${args[1].toUpperCase()} [name/points]! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`;
          let errorLog = `User did not supply which sort [name/points] to do on nganh ${args[1].toUpperCase()}`;
          throw new CommandException(
            message,
            replyContent,
            this.name,
            errorLog
          );
        }
      } // end of valid nganh check
      else if (args[1] === "overall") {
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
            //prettier-ignore
            let replyContent = `Error: Make sure you have supplied how you want to sort each nganh [name/points]! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
            let errorLog = `User did not supply which sort[name/points] to do on overall nganh`;
            throw new CommandException(
              message,
              replyContent,
              this.name,
              errorLog
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
            //prettier-ignore
            let replyContent = `Error: Make sure you have supplied how you want to sort each nganh [name/points]! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
            let errorLog = `User did not supply a valid sort[name/points] to do on overall nganh`;
            throw new CommandException(
              message,
              replyContent,
              this.name,
              errorLog
            );
          }
        } // end of args[2] === 'nganh'
        else {
          // Don't recognize...
          //prettier-ignore
          let replyContent = `Error: Make sure you have supplied how you want to sort overall [name/points/nganh]! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`;
          let errorLog = `User did not supply a how to sort overall [name/points/nganh]`;
          throw new CommandException(
            message,
            replyContent,
            this.name,
            errorLog
          );
        }
      } else {
        //prettier-ignore
        let replyContent = `Error: Make sure you have supplied which leaderboard [<nganh>/overall]! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
        let errorLog = `User did not supply which leaderboard [<nganh>/overall] to display`;
        throw new CommandException(message, replyContent, this.name, errorLog);
      }
    }

    // Check if supplied an amount and user
    if (args.length < 3) {
      //prettier-ignore
      let replyContent = `Error: Make sure you have supplied an amount and user! Please consult the usage by typing \`${prefix}help ${this.name}\` to get more info`
      let errorLog = `User did not supply an amount and user, args.length < 2`;
      throw new CommandException(message, replyContent, this.name, errorLog);
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
      let pointPairs = args.slice(1).join(" ").split(",");
      handlePoints(args[0], message, pointPairs);
    } // End of multi_point_commands if statement
    else if (isSinglePointCmd) {
      // Check if its a valid point amount
      if (!isValidPointAmount(args[1])) {
        //prettier-ignore
        let replyContent = `Error: "${element}" - seems to not have a valid number for points. Please consult the usage by typing \`${prefix}help ${module.exports.name}\` to get more info`
        let errorLog = `${element}" does not seem to have a valid number for points`;
        throw new CommandException(message, replyContent, this.name, errorLog);
      }

      let amount = getPointAmountFromString(args[1]);

      // Combine the name string then delimit by comma, then add amount in front of every data member
      // so the format is (amount @discordname)
      let pointPairs = args.slice(2).join("").split(",");
      pointPairs = pointPairs.map((element) => {
        return `${amount} ${element}`;
      });

      try {
        handlePoints(args[0], message, pointPairs);
      } catch (error) {
        throw error;
      }
    } // End of single_point_commands if statement
    else {
      //prettier-ignore
      let replyContent = `Error: Make sure you input the right command. Please consult the usage by typing \`${prefix}help ${this.name}\` to get more info`;
      let errorLog = `This should never happen, points.js`;
      throw new CommandException(message, replyContent, this.name, errorLog);
    }
  },
};

function handlePoints(cmdName, message, pointPairs) {
  // Ids provided by user
  let gMemberIds = [];
  // Points provided by user
  let gMemberPoints = [];

  for (const pair of pointPairs) {
    let splitArray = pair.trim().split(" ");

    if (splitArray.length !== 2) {
      //prettier-ignore
      let replyContent = `Error: "${pair}" - seems to not have the right format. Please consult the usage by typing \`${prefix}help ${module.exports.name}\` to get more info`;
      let errorLog = `"${pair}" does not have the right format`;
      throw new CommandException(
        message,
        replyContent,
        module.exports.name,
        errorLog
      );
    }

    // Check if its a valid point amount
    if (!isValidPointAmount(splitArray[0])) {
      //prettier-ignore
      let replyContent = `Error: "${pair}" - seems to not have a valid number for points. Please consult the usage by typing \`${prefix}help ${module.exports.name}\` to get more info`
      let errorLog = `${pair}" does not seem to have a valid number for points`;
      throw new CommandException(
        message,
        replyContent,
        module.exports.name,
        errorLog
      );
    }

    // Validity of @discordname; check if right format of @<name>
    if (!isValidAtNameFormat(splitArray[1])) {
      //prettier-ignore
      let replyContent = `Error: "${pair}" - seems to be in a wrong @<name> format or member does not exist in the server! Please consult the usage by typing \`${prefix}help ${module.exports.name}\` to get more info`
      let errorLog = `${pair}" does not have a valid @<name> format`;
      throw new CommandException(
        message,
        replyContent,
        module.exports.name,
        errorLog
      );
    }

    let amount = getPointAmountFromString(splitArray[0]);
    let memberId = getMemberIdFromAtName(splitArray[1]);

    // Validity of @discordname, check if valid gMember of guild
    if (!isValidMemberId(message.guild, memberId)) {
      //prettier-ignore
      let replyContent = `Error: "${pair}" - member does not exist in the server! Please consult the usage by typing \`${prefix}help ${module.exports.name}\` to get more info`
      let errorLog = `${pair}" does not have a valid @<name> that is in the server`;
      throw new CommandException(
        message,
        replyContent,
        module.exports.name,
        errorLog
      );
    }

    // Add memberId
    gMemberIds.push(memberId);
    // Add points
    gMemberPoints.push(amount);
  }

  if (gMemberIds.length != pointPairs.length) {
    //prettier-ignore
    let replyContent = `Error: Please double check your members that you have tagged`
    let errorLog = `gMemberIds.length != newArgs.length!, missing memberid?`;
    throw new CommandException(
      message,
      replyContent,
      module.exports.name,
      errorLog
    );
  }

  if (cmdName === "give") {
    message.client.pointKeepers
      .get(message.guild.id)
      .givePointsMany(message, gMemberIds, gMemberPoints);
  } else if (cmdName === "remove") {
    message.client.pointKeepers
      .get(message.guild.id)
      .removePointsMany(message, gMemberIds, gMemberPoints);
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
