const { prefix } = require("../config.json");
const {
  CommandException,
  getMemberIdFromAtName,
  isValidAtNameFormat,
  isValidMemberId,
  isValidNganh,
} = require("../util/util.js");

module.exports = {
  name: "assign",
  description: "Assign a nganh to a user",
  args: true, // Include if command requires args
  usage: "<nganh> @discordname",
  guildOnly: true, // Include if exclusive to server
  cooldown: 1,
  execute(message, args) {
    let gMemberIds = [];
    let nganhs = [];

    if (args.length < 2) {
      //prettier-ignore
      let replyContent = `Error: Please make sure you included a <nganh> and @discordname`;
      let errorLog = `args.length < 2, expecting at least 2 args`;
      throw new CommandException(message, replyContent, this.name, errorLog);
    }

    if (!isValidNganh(args[0])) {
      //prettier-ignore
      let replyContent = `Error: Please make sure you included a valid <nganh> [AN, TN, NS, HS, HT]`;
      let errorLog = `Invalid nganh input`;
      throw new CommandException(message, replyContent, this.name, errorLog);
    }

    // Attempt to find if user input userList or pair of userList [<nganh> @discordname, <nganh> @discordname, ...]
    let userListArgs = args
      .slice(1)
      .join("")
      .split(/ *,+ */);
    let userList = userListArgs.filter((arg) => {
      if (!isValidAtNameFormat(arg)) return false;
      if (!isValidMemberId(message.guild, getMemberIdFromAtName(arg)))
        return false;
      return true;
    });

    if (userList.length === userListArgs.length) {
      // matches when we have userlist only, assign all nganhs to the user list
      // [<nganh>] @discordname, @discordname, ...
      // At this point we have valid userList and valid nganh
      userList.forEach((user) => {
        gMemberIds.push(getMemberIdFromAtName(user));
        nganhs.push(args[0]);
      });

      // update new member
      message.client.pointKeepers
        .get(message.guild.id)
        .updateMembers(message, gMemberIds, nganhs);
    } else {
      // Attempt to parse with format [<nganh> @discordname], [<nganh> @discordname], ...
      let newArgs = args.join(" ").split(/ *,+ */);
      newArgs.forEach((element) => {
        let splitArray = element.trim().split(" ");
        if (splitArray.length !== 2) {
          //prettier-ignore
          let replyContent = `Error: "${element}" - seems to not have the right format. Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`;
          let errorLog = `Expected 2 arguments per person`;
          throw new CommandException(
            message,
            replyContent,
            module.exports.name,
            errorLog
          );
        }

        if (!isValidAtNameFormat(splitArray[1])) {
          //prettier-ignore
          let replyContent = `Error: "${element}" Make sure you link the person by using @<name>! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
          let errorLog = `@<name> was invalid`;
          throw new CommandException(
            message,
            replyContent,
            module.exports.name,
            errorLog
          );
        }

        if (
          !isValidMemberId(message.guild, getMemberIdFromAtName(splitArray[1]))
        ) {
          //prettier-ignore
          let replyContent = `Error: "${element}" Please @<name> a member of the server!`;
          let errorLog = `@<name> was not a member of the server`;
          throw new CommandException(
            message,
            replyContent,
            module.exports.name,
            errorLog
          );
        }

        // Nganh checking? Valid inputs of AN (Au Nhi)
        if (!isValidNganh(splitArray[0])) {
          //prettier-ignore
          let replyContent = `Error: "${element}" Please enter a valid nganh (ex: AN/TN/NS/HS/HT)`;
          let errorLog = `Invalid nganh`;
          throw new CommandException(
            message,
            replyContent,
            module.exports.name,
            errorLog
          );
        }

        // Check if exists, let user know that they input twice
        let duplicateIndex = gMemberIds.findIndex((gMemberId) => {
          return gMemberId === getMemberIdFromAtName(splitArray[1]);
        });
        if (duplicateIndex > -1) {
          let replyContent = `Error: "${element}" is a duplicate of \`${nganhs[duplicateIndex]} <@${gMemberIds[duplicateIndex]}>\`!`;
          let errorLog = `Duplicate user to assign`;
          throw new CommandException(
            message,
            replyContent,
            module.exports.name,
            errorLog
          );
        }

        let nganh = splitArray[0];

        // At this point, all valid so lets add to array
        gMemberIds.push(getMemberIdFromAtName(splitArray[1]));
        nganhs.push(nganh);
      }); // End of newArgs.foreach

      // Ensure they have same length as newArgs (all inputs are correct)
      if (gMemberIds.length === newArgs.length) {
        // update new member
        message.client.pointKeepers
          .get(message.guild.id)
          .updateMembers(message, gMemberIds, nganhs);
      }
    }
  },
};
