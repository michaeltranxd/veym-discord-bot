const fs = require("fs");

class GuildMetadata {
  __presetup;
  __guildid;
  __roles_admin;

  // Initalize with file TODO
  constructor(client, guildId) {
    this.__guildid = guildId;
    this.__presetup = 1;
    this.__roles_admin = [];
    try {
      let str = fs.readFileSync(`./util/guildmetadata/${this.__guildid}.json`, {
        encoding: "utf8",
        flag: "r",
      });

      let json = JSON.parse(str);

      // Parse data out
      if (json.__presetup) this.__presetup = json.__presetup;
      if (json.__roles_admin) this.__roles_admin = json.__roles_admin;
    } catch (error) {
      console.log(
        "Reading from file [Guildmetadata] was bad..., possibly file does not exist since new server?"
      );

      fs.writeFileSync(
        `./util/guildmetadata/${this.__guildid}.json`,
        JSON.stringify([]),
        function (err) {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  }

  get presetup() {
    return this.__presetup;
  }

  set presetup(x) {
    this.__presetup = x;
  }

  get roles_admin() {
    return this.__roles_admin;
  }

  set roles_admin(x) {
    this.__roles_admin = x;
  }

  needPresetup() {
    return this.__presetup === 1 ? true : false;
  }

  finishPresetup() {
    this.__presetup = 0;
  }

  save() {
    let json = JSON.stringify(this);

    fs.writeFileSync(
      `./util/guildmetadata/${this.__guildid}.json`,
      json,
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
  }
}

module.exports = GuildMetadata;
