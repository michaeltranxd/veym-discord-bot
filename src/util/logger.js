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
    let logMessage = `MsgContent:"${message.content}" | User:${message.author.tag} | Handling '${commandName}' command in guild [${message.guild.name}]`;
    this.log(this.NORMAL, logMessage);
  }

  logCommandSuccess(message, commandName) {
    let logMessage = `MsgContent:"${message.content}" | User:${message.author.tag} | Successfully executed '${commandName}' command in guild [${message.guild.name}]`;
    this.log(this.SUCCESS, logMessage);
  }

  logCommandError(message, commandName, error) {
    let logMessage = `MsgContent:"${message.content}" | User:${message.author.tag} | Ran [${message.content}] using command '${commandName}', but failed due to error: [${error}]`;
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
