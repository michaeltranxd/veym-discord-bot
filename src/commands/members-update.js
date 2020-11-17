const { prefix } = require("../config.json");
const { nganhInputs } = require("../util/util.json");

module.exports = {
  name: "members-update",
  description: "Update members tracked with points",
  args: true, // Include if command requires args
  usage: "@discordname <nganh>",
  guildOnly: true, // Include if exclusive to server
  cooldown: 1,
  execute(message, args) {
    let gMemberIds = [];
    let nganhs = [];

    let newArgs = args.join(" ").split(",");
    newArgs.forEach((element) => {
      let splitArray = element.trim().split(" ");
      console.log(splitArray);
      if (splitArray.length !== 2) {
        return message.reply(
          `Error: "${element}" - seems to not have the right format. Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
        );
      }

      // Validity of @discordname; check if args[0] is a person in the server
      let gMemberMatch = splitArray[0].match(/[0-9]+/);
      if (!gMemberMatch) {
        return message.reply(
          `Error: "${element}" Make sure you link the person by using @<name>! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
        );
      }

      let gMemberId = gMemberMatch[0];
      let guildMembers = message.guild.members.cache;
      let gMember = guildMembers.get(gMemberId);

      if (!gMember) {
        return message.reply(
          `Error: "${element}" Please @<name> a member of the server!`
        );
      }

      // See if the input is valid
      // Nganh checking? Valid inputs of AN (Au Nhi)
      let validNganh = nganhInputs.find((element) => element === splitArray[1]);

      if (validNganh === undefined) {
        return message.reply(
          `Error: "${element}" Please enter a valid nganh (ex: AN/TN/NS/HS/HT)`
        );
      }

      let nganh = splitArray[1];

      // At this point, all valid so lets add to array
      gMemberIds.push(gMemberId);
      nganhs.push(nganh);
    }); // End of newArgs.foreach

    // Ensure they have same length as newArgs (all inputs are correct)
    if (gMemberIds.length === newArgs.length) {
      // update new member
      message.client.pointKeepers
        .get(message.guild.id)
        .updateMembers(message, gMemberIds, nganhs);
    }
  },
};
