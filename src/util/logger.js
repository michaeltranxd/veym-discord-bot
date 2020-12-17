const fs = require("fs");

class Logger {
  __maxLogsLength = 1024;
  __timeStart = new Date().toISOString().replace(/:/g, "-");
  __debug = true;
  constructor() {
    this.logs = [];
  }

  get count() {
    return this.logs.length;
  }

  get ERROR() {
    return -1;
  }

  get WARNING() {
    return 2;
  }

  get NORMAL() {
    return 1;
  }

  get DEBUG() {
    return -2;
  }

  get SUCCESS() {
    return 3;
  }

  getTypeString(type) {
    if (type == -1) return "ERROR";
    else if (type == 2) return "WARNING";
    else if (type == 1) return "NORMAL";
    else if (type == -2) return "DEBUG";
    else if (type == 3) return "SUCCESS";
    return "UNDEFINED";
  }

  log(type, message) {
    if (!this.__debug) return;

    const timestamp = new Date().toISOString();
    this.logs.push({ type, timestamp, message });
    console.log(`(${timestamp}) - ${this.getTypeString(type)}, ${message}`);

    // Save logs when reached over maxLogsLength logs
    if (this.logs.length >= this.__maxLogsLength) {
      this.save();
      this.logs = [];
    }
  }

  logCommand(message, commandName) {
    let msgContent = `MsgContent:"${message.content}"`;
    let user = `User:${message.author.tag}`;
    let command = `Handling '${commandName}' command`;
    let location = `in `;
    message.guild ? (location += `${message.guild.name}`) : (location += `DM`);
    let logMessage = `${msgContent} | ${user} | ${command} ${location}`;
    this.log(this.NORMAL, logMessage);
  }

  logCommandSuccess(message, commandName) {
    let msgContent = `MsgContent:"${message.content}"`;
    let user = `User:${message.author.tag}`;
    let command = `Successfully executed '${commandName}' command`;
    let location = `in `;
    message.guild ? (location += `${message.guild.name}`) : (location += `DM`);
    let logMessage = `${msgContent} | ${user} | ${command} ${location}`;
    this.log(this.SUCCESS, logMessage);
  }

  logCommandError(message, commandName, error) {
    let msgContent = `MsgContent:"${message.content}"`;
    let user = `User:${message.author.tag}`;
    let command = `Ran [${message.content}] using command '${commandName}', but failed due to error: [${error}]`;
    let location = `in `;
    message.guild ? (location += `${message.guild.name}`) : (location += `DM`);
    let logMessage = `${msgContent} | ${user} | ${command} ${location}`;
    this.log(this.ERROR, logMessage);
  }

  logsToString() {
    let logsAsString = "";

    // Generate a string holding all the data from the logs
    this.logs.forEach((log, i) => {
      let type = this.getTypeString(log.type);
      let logMessage = `${log.timestamp}, ${type}, ${log.message}\n`;
      logsAsString += logMessage;
    });

    return logsAsString;
  }

  save() {
    const strToWrite = this.logsToString();

    try {
      fs.appendFileSync(
        `util/logs/${this.__timeStart}.log`,
        strToWrite,
        `utf8`
      );
    } catch (error) {
      /* error handling */
      console.log("Issue saving logs in logger.js");
      console.log(error);
    }
  }
}

module.exports = new Logger();
