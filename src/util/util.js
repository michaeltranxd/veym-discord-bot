const nganhInputs = ["AN", "TN", "NS", "HS", "HT", "N/A"];

function CommandException(messageObj, replyContent, commandName, errorLog) {
  this.messageObj = messageObj;
  this.replyContent = replyContent;
  this.name = commandName;
  this.type = `CommandException`;
  this.errorLog = errorLog;
}

module.exports = {
  nganhInputs,
  CommandException,
};
