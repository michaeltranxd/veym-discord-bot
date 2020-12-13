const fs = require("fs");

class Logger {
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

  getTypeString(type) {
    if (type == -1) return "ERROR";
    else if (type == 2) return "WARNING";
    else if (type == 1) return "NORMAL";
    return "UNDEFINED";
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    this.logs.push({ type, timestamp, message });
    console.log(`(${timestamp}) - ${this.getTypeString(type)}, ${message}`);
  }

  save() {
    try {
      var file = fs.createWriteStream("./util/logs/${timestamp}.txt");
      this.logs.forEach((log) => {
        logMessage = `${log[1]}, ${getTypeString(log[0])}, ${log[2]}\n`;
        file.write(logMessage);
      });
      //arr.forEach(function(v) { file.write(v.join(', ') + '\n'); });
      file.end();
    } catch (error) {
      /* error handling */
      console.log("Issue saving file in logger.js");
      console.log(error);
    }
  }
}

module.exports = new Logger();
