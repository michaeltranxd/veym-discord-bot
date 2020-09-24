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
    if (args.length !== 2) {
      return message.reply(
        `Error: Make sure you have the required arugments! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    // Validity of @discordname; check if args[0] is a person in the server
    let gMemberMatch = args[0].match(/[0-9]+/);
    if (!gMemberMatch) {
      return message.reply(
        `Error: Make sure you link the person by using @<name>! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    let gMemberId = gMemberMatch[0];
    let guildMembers = message.guild.members.cache;
    let gMember = guildMembers.get(gMemberId);

    if (!gMember) {
      return message.reply(`Error: Please @<name> a member of the server!`);
    }

    // Name checking? Probably not, they can update it if its wrong...
    // Check where Nganh will start (args[1] to args[n - 1] will be our name)
    let nganhIndex = args.findIndex((argument) => {
      return nganhInputs.find((element) => element === argument);
    });

    // Nganh checking? Valid inputs of AN (Au Nhi)
    if (nganhIndex === undefined) {
      return message.reply(
        `Error: Please enter a valid nganh (ex: AN/TN/NS/HS/HT)`
      );
    }

    let nganh = args[nganhIndex];

    // update new member
    message.client.pointKeepers
      .get(message.guild.id)
      .updateMember(message, gMemberId, nganh);
  },
};
