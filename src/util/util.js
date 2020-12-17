const nganhInputs = ["AN", "TN", "NS", "HS", "HT", "N/A"];

function CommandException(messageObj, replyContent, commandName, errorLog) {
  this.messageObj = messageObj;
  this.replyContent = replyContent;
  this.name = commandName;
  this.type = `CommandException`;
  this.errorLog = errorLog;
}

function getMemberIdFromAtName(memAtName) {
  let gMemberMatch = memAtName.match(/[0-9]+/);
  return gMemberMatch ? gMemberMatch[0] : null;
}

function getPointAmountFromString(amountString) {
  return Number(amountString);
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

function isValidNganh(nganh) {
  return nganhInputs.includes(nganh.toUpperCase());
}

module.exports = {
  nganhInputs,
  CommandException,
  getMemberIdFromAtName,
  getPointAmountFromString,
  isValidAtNameFormat,
  isValidMemberId,
  isValidPointAmount,
  isValidNganh,
};
