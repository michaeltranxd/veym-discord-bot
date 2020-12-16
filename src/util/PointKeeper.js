const Discord = require("discord.js");
const fs = require("fs");
const PointMember = require("./PointMember");
const { nganhInputs } = require("../util/util.json");

const lodash = require("lodash");
const logger = require("./logger");
const { time } = require("console");

const medals = ["🥇", "🥈", "🥉"];

/*
  Setup permissions on server using roles
  @role
*/

/**
 * Credit goes to https://stackoverflow.com/a/2686866
 *
 */
function pad(str, len, pad, dir) {
  var STR_PAD_LEFT = 1;
  var STR_PAD_RIGHT = 2;
  var STR_PAD_BOTH = 3;

  if (typeof len == "undefined") {
    var len = 0;
  }
  if (typeof pad == "undefined") {
    var pad = " ";
  }
  if (typeof dir == "undefined") {
    var dir = STR_PAD_RIGHT;
  }

  if (len + 1 >= str.length) {
    switch (dir) {
      case STR_PAD_LEFT:
        str = Array(len + 1 - str.length).join(pad) + str;
        break;

      case STR_PAD_BOTH:
        var padlen = len - str.length;
        var right = Math.ceil(padlen / 2);
        var left = padlen - right;
        str = Array(left + 1).join(pad) + str + Array(right + 1).join(pad);
        break;

      default:
        str = str + Array(len + 1 - str.length).join(pad);
        break;
    } // switch
  }

  return str;
}

class PointKeeper {
  __guildid;
  __members;

  // Initalize with file TODO
  constructor(client, guildId) {
    this.__guildid = guildId;
    this.__members = new Discord.Collection();

    // Before reading from file or creating a new file (joined new server)
    // Populate with current members then write over them using the file
    client.guilds.cache.get(this.__guildid).members.cache.each((member) => {
      this.addJoiningMember(member);
    });

    try {
      let str = fs.readFileSync(`./util/guildpoints/${this.__guildid}.json`, {
        encoding: "utf8",
        flag: "r",
      });

      let json = JSON.parse(str);

      let members = Object.values(json);
      members.forEach((member) => {
        let pointMember = new PointMember(
          member.id,
          member.nganh,
          member.points
        );
        this.__members.set(member.id, pointMember);
      });
    } catch (error) {
      console.log(
        "Reading from file was bad..., possibly file does not exist since new server?"
      );

      fs.writeFileSync(
        `./util/guildpoints/${this.__guildid}.json`,
        JSON.stringify([]),
        function (err) {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  }

  addJoiningMember(member) {
    //only add the non-bot
    if (!member.user.bot) {
      let pointMember = PointMember.emptyConstructor(member.id);
      this.__members.set(member.id, pointMember);
    }
  }

  removeLeavingMember(member) {
    //only add the non-bot
    if (!member.user.bot) {
      let pointMember = PointMember.emptyConstructor(member.id);
      this.__members.set(member.id, pointMember);
    }
  }

  // addMember(message, memberID, memberNganh, memberPoints) {
  //   if (this.__members.get(memberID)) {
  //     return message.reply(`Error: User already added.`);
  //   }

  //   let pointMember = new PointMember(memberID, memberNganh, memberPoints);

  //   this.updateMember(memberID, mem);

  //   return message.reply(`Member <@${memberID}> has been added to the list`);
  // }

  // removeMember(message, memberID) {
  //   let pointMember = this.__members.get(memberID);

  //   if (!pointMember) {
  //     return message.reply(
  //       `Error: That user is not added to the list previously! Could not delete.`
  //     );
  //   }

  //   this.__members.delete(memberID);
  //   this.save();

  //   return message.reply(
  //     `Member ${pointMember.name} (<@${pointMember.id}>) has been removed from the list`
  //   );
  // }

  updateMember(message, memberID, memberNganh) {
    let mem = this.__members.get(memberID);
    if (!mem) {
      return message.reply(`Member <@${memberID}> was not found on the list`);
    }

    mem.nganh = memberNganh;
    this.save();
  }

  updateMembers(message, memberIDs, nganhs) {
    for (let index = 0; index < memberIDs.length; index++) {
      this.updateMember(message, memberIDs[index], nganhs[index]);
    }

    if (memberIDs.length === 1) {
      return message.reply(
        `Member <@${memberIDs[0]}> has been updated to nganh ${nganhs[0]}`
      );
    }

    return message.reply(
      `All members have been updated to their corresponding nganhs`
    );
  }

  givePoints(message, memberID, memberPoints) {
    let mem = this.__members.get(memberID);
    if (!mem) {
      return message.reply(`Member <@${memberID}> was not found on the list`);
    }

    mem.points = mem.points + memberPoints;

    this.save();
    return `<@${memberID}> has been awarded ${memberPoints} points! They now have ${mem.points} points! Congratulations!! 🥳`;
  }

  givePointsMany(message, memberIDs, memberPoints) {
    let awardStr = [""];
    let awardStrIndex = 0;
    for (let index = 0; index < memberIDs.length; index++) {
      let str =
        this.givePoints(message, memberIDs[index], memberPoints[index]) + "\n";
      if (awardStr[awardStrIndex].length + str.length > 1024) {
        awardStr.push(str);
        awardStrIndex++;
      } else {
        awardStr[awardStrIndex] += str;
      }
    }

    return this.sendMultipleMessages(message, awardStr);
  }

  givePointsAll(message, memberIds, points) {
    let awardStr = ["Members: "];
    let awardStrIndex = 0;
    // Grab the memberName from id
    memberIds.forEach((id, index) => {
      let str = `<@${id}>`;
      let ending = ` have been all awarded ${points[index]} points. Congratulations!! 🥳`;

      this.givePoints(message, id, points[index]);

      if (awardStr[awardStrIndex].length + str.length + ending > 1024) {
        awardStr[awardStrIndex] += ending;
        awardStr.push("Members: " + str);
        awardStrIndex++;
      } else {
        awardStr[awardStrIndex] += str;
        if (index !== memberIds.length - 1) {
          // Add commas only if its not the last one!
          awardStr[awardStrIndex] += ", ";
        } else {
          awardStr[awardStrIndex] += ending;
        }
      }
    });

    return this.sendMultipleMessages(message, awardStr);
  }

  removePoints(message, memberID, memberPoints) {
    let mem = this.__members.get(memberID);
    if (!mem) {
      return message.reply(`Member <@${memberID}> was not found on the list`);
    }

    mem.points = Math.max(0, mem.points - memberPoints);

    this.save();

    return `<@${memberID}> has been deducted ${memberPoints} points! They now have ${mem.points} points! 😢`;
  }

  removePointsMany(message, memberIDs, memberPoints) {
    let awardStr = [""];
    let awardStrIndex = 0;
    for (let index = 0; index < memberIDs.length; index++) {
      let str =
        this.removePoints(message, memberIDs[index], memberPoints[index]) +
        "\n";
      if (awardStr[awardStrIndex].length + str.length > 1024) {
        awardStr.push(str);
        awardStrIndex++;
      } else {
        awardStr[awardStrIndex] += str;
      }
    }

    return this.sendMultipleMessages(message, awardStr);
  }

  removePointsAll(message, memberIds, points) {
    let awardStr = ["Members: "];
    let awardStrIndex = 0;
    // Grab the memberName from id
    memberIds.forEach((id, index) => {
      let str = `<@${id}>`;
      let ending = ` have been all deducted ${points[index]} points. 😢`;

      this.removePoints(message, id, points[index]);

      if (awardStr[awardStrIndex].length + str.length + ending > 1024) {
        awardStr[awardStrIndex] += ending;
        awardStr.push("Members: " + str);
        awardStrIndex++;
      } else {
        awardStr[awardStrIndex] += str;
        if (index !== memberIds.length - 1) {
          // Add commas only if its not the last one!
          awardStr[awardStrIndex] += ", ";
        } else {
          awardStr[awardStrIndex] += ending;
        }
      }
    });

    return this.sendMultipleMessages(message, awardStr);
  }

  updatePoints(message, memberID, memberPoints) {
    let mem = this.__members.get(memberID);
    if (!mem) {
      return message.reply(`Member <@${memberID}> was not found on the list`);
    }

    mem.points = memberPoints;

    this.save();

    return `<@${memberID}> has been updated ${memberPoints} points! They now have ${mem.points} points!`;
  }

  updatePointsMany(message, memberIDs, memberPoints) {
    let awardStr = [""];
    let awardStrIndex = 0;
    for (let index = 0; index < memberIDs.length; index++) {
      let str =
        this.updatePoints(message, memberIDs[index], memberPoints[index]) +
        "\n";
      if (awardStr[awardStrIndex].length + str.length > 1024) {
        awardStr.push(str);
        awardStrIndex++;
      } else {
        awardStr[awardStrIndex] += str;
      }
    }

    return this.sendMultipleMessages(message, awardStr);
  }

  updatePointsAll(message, memberIds, points) {
    let awardStr = ["Members: "];
    let awardStrIndex = 0;
    // Grab the memberName from id
    memberIds.forEach((id, index) => {
      let str = `<@${id}>`;
      let ending = ` have been all updated to ${points[index]} points.`;

      this.updatePoints(message, id, points[index]);

      if (awardStr[awardStrIndex].length + str.length + ending > 1024) {
        awardStr[awardStrIndex] += ending;
        awardStr.push("Members: " + str);
        awardStrIndex++;
      } else {
        awardStr[awardStrIndex] += str;
        if (index !== memberIds.length - 1) {
          // Add commas only if its not the last one!
          awardStr[awardStrIndex] += ", ";
        } else {
          awardStr[awardStrIndex] += ending;
        }
      }
    });

    return this.sendMultipleMessages(message, awardStr);
  }

  getNganhMembers(message, nganh) {
    // Check if empty
    if (this.__members.keyArray().length === 0) {
      message.reply(`List is empty. Please add someone`);
      return;
    }

    // Grab the users in the nganh
    const filteredMembers = lodash
      .cloneDeep(this.__members)
      .filter((member) => {
        return member.nganh.trim() === nganh.trim();
      });

    if (filteredMembers.keyArray().length === 0) {
      message.reply(
        `There were no people listed as nganh ${nganh}. Please configure using the update command`
      );
      return;
    }

    return filteredMembers;
  }

  getOverallMembers(message) {
    // Check if empty
    if (this.__members.keyArray().length === 0) {
      message.reply(`List is empty. Please add someone`);
      return;
    }

    return lodash.cloneDeep(this.__members);
  }

  listOfANganhByName(message, nganh) {
    // Get Nganh
    let nganhMembers = this.getNganhMembers(message, nganh);

    // If nganh does not exist just return
    if (!nganhMembers) {
      return;
    }

    // Sort by name
    const sorted = this.sortByName(message, nganhMembers);
    return this.listMembers(message, sorted);
  }

  listOfANganhByPoints(message, nganh) {
    // Get Nganh
    let nganhMembers = this.getNganhMembers(message, nganh);

    // If nganh does not exist just return
    if (!nganhMembers) {
      return;
    }

    // Sort by points
    const sorted = this.sortByPoints(nganhMembers);
    return this.listLeaderboard(message, sorted);
  }

  listOverallByName(message) {
    // Get overall
    let overallMembers = this.getOverallMembers(message);

    // Sort overall by name
    let sorted = this.sortByName(message, overallMembers);
    return this.listMembers(message, sorted);
  }

  listOverallByNganhThenName(message) {
    // Get overall
    let overallMembers = this.getOverallMembers(message);

    // Sort overall by nganh then name
    let sorted = this.sortByNganhThenName(message, overallMembers);
    return this.listMembers(message, sorted);
  }

  listOverallByNganhThenPoints(message) {
    // Get overall
    let overallMembers = this.getOverallMembers(message);

    // Sort overall by nganh then points
    let sorted = this.sortByNganhThenPoints(overallMembers);
    return this.listLeaderboard(message, sorted);
  }

  listOverallByPoints(message) {
    // Get overall
    let overallMembers = this.getOverallMembers(message);

    // Sort overall by points
    let sorted = this.sortByPoints(overallMembers);
    return this.listLeaderboard(message, sorted);
  }

  sortByName(message, members) {
    // Sort by alphabetical name
    const sorted = members.sort((a, b) => {
      let nameAString = message.guild.members.cache.get(a.id).displayName;
      let nameBString = message.guild.members.cache.get(b.id).displayName;
      if (!nameAString)
        nameAString = message.guild.members.cache.get(a.id).user.username;
      if (!nameBString)
        nameBString = message.guild.members.cache.get(b.id).user.username;

      if (nameAString.toUpperCase() === nameBString.toUpperCase()) return 0;
      else if (nameAString.toUpperCase() > nameBString.toUpperCase()) return 1;
      else if (nameAString.toUpperCase() < nameBString.toUpperCase()) return -1;
    });

    return sorted;
  }

  sortByPoints(members) {
    // Sort by points
    const sorted = members.sort((a, b) => {
      if (a.points > b.points) return -1;
      else if (a.points < b.points) return 1;
      else return 0;
    });

    return sorted;
  }

  sortByNganhThenName(message, members) {
    // Sort by Nganh then alphabetical within nganh
    const sorted = members.sort((a, b) => {
      // First sort by Nganh
      let aIndex = nganhInputs.findIndex((elem) => {
        return a.nganh === elem;
      });
      let bIndex = nganhInputs.findIndex((elem) => {
        return b.nganh === elem;
      });

      if (aIndex < bIndex) {
        return -1;
      } else if (aIndex > bIndex) {
        return 1;
      } else if (aIndex === bIndex) {
        let nameAString = message.guild.members.cache.get(a.id).displayName;
        let nameBString = message.guild.members.cache.get(b.id).displayName;
        if (!nameAString)
          nameAString = message.guild.members.cache.get(a.id).user.username;
        if (!nameBString)
          nameBString = message.guild.members.cache.get(b.id).user.username;

        if (nameAString.toUpperCase() === nameBString.toUpperCase()) return 0;
        else if (nameAString.toUpperCase() > nameBString.toUpperCase())
          return 1;
        else if (nameAString.toUpperCase() < nameBString.toUpperCase())
          return -1;
      }
    });

    return sorted;
  }

  sortByNganhThenPoints(members) {
    // Sort by Nganh then by points within nganh
    const sorted = members.sort((a, b) => {
      // First sort by Nganh
      let aIndex = nganhInputs.findIndex((elem) => {
        return a.nganh === elem;
      });
      let bIndex = nganhInputs.findIndex((elem) => {
        return b.nganh === elem;
      });

      if (aIndex < bIndex) {
        return -1;
      } else if (aIndex > bIndex) {
        return 1;
      } else if (aIndex === bIndex) {
        if (a.points > b.points) return -1;
        else if (a.points < b.points) return 1;
        else return 0;
      }
    });

    return sorted;
  }

  async listMembers(message, members) {
    // Generate embed message
    let allNames = [""];
    let allNganhs = [""];
    let allPoints = [""];

    // Tracks how many rows have 1024 chars
    let rows1024 = 0;
    let titleLength = 0;

    members.forEach((elem) => {
      let memName = `<@${elem.id}>\n`;
      let memNganh = `${elem.nganh}\n`;
      let memPoints = `${elem.points}\n`;

      // Before we add we check if its going to hit our 1024 limit
      let maxLength = Math.max(
        allNames[rows1024].length + memName.length,
        allNganhs[rows1024].length + memNganh.length,
        allPoints[rows1024].length + memPoints.length
      );

      if (maxLength >= 1024) {
        // We hit max 1024 chars, so go next
        rows1024++;
        allNames.push("");
        allNganhs.push("");
        allPoints.push("");
      }

      allNames[rows1024] += memName;
      allNganhs[rows1024] += memNganh;
      allPoints[rows1024] += memPoints;

      // Get maximum size by finding the person's nickname if exists then tries for actual username
      let nameString = message.guild.members.cache.get(elem.id).displayName;
      if (!nameString)
        nameString = message.guild.members.cache.get(elem.id).user.username;

      // Since ${elem.id} is bunch of numbers, the numbers arent actually displayed. Its the username/nickname.
      // We take the max length of names/nganh/points including the headers and find the longest
      let memNameLength = Math.max(`@${nameString}`.length, `Names`.length);
      let memNganhLength = Math.max(memNganh.length - 1, `Nganh`.length);
      let memPointsLength = Math.max(memPoints.length - 1, `Points`.length);

      titleLength = Math.max(
        titleLength,
        memNameLength + memNganhLength + memPointsLength
      );
    });

    titleLength = Math.min(titleLength, 60);

    let title = pad("Points Leaderboard", titleLength + 4, "+", 3);

    // Loop through the rest if any and send seperate messages
    for (let index = 0; index <= rows1024; index++) {
      if (rows1024 > 0) {
        title = pad(`Points Leaderboard ${index + 1}`, titleLength, "+", 3);
      }

      // Create embed for it
      const embeddedMessage = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .addFields(
          {
            name: title,
            value: `\u200B`,
          },
          { name: "Name", value: allNames[index], inline: true },
          { name: "Nganh", value: allNganhs[index], inline: true },
          { name: "Points", value: `${allPoints[index]}`, inline: true }
        );

      // Send messsage and wait until it is sent before generating another one
      try {
        await message.channel.send(embeddedMessage);
      } catch (error) {
        console.log(error);
        return false;
      }
    }
    return true;
  }

  async listLeaderboard(message, members) {
    // Generate embed message
    let allNames = [""];
    let allNganhs = [""];
    let allPoints = [""];

    // Tracks how many rows have 1024 chars
    let rows1024 = 0;
    let titleLength = 0;

    // This maps members to points then filters so that only unique points exist
    // Then will sort descending and slice the top three so we are left with top three unique
    // points

    // Get the top three of every nganh and assign 1st, 2nd, 3rd
    let anList = members
      .filter((member) => {
        return member.nganh === nganhInputs[0]; // AN
      })
      .array()
      .map((mem) => {
        return mem.points;
      })
      .filter((point, i, self) => {
        return self.indexOf(point) === i;
      })
      .sort(function (a, b) {
        return b - a;
      })
      .slice(0, 3);
    let tnList = members
      .filter((member) => {
        return member.nganh === nganhInputs[1]; // TN
      })
      .array()
      .map((mem) => {
        return mem.points;
      })
      .filter((point, i, self) => {
        return self.indexOf(point) === i;
      })
      .sort(function (a, b) {
        return b - a;
      })
      .slice(0, 3);
    let nsList = members
      .filter((member) => {
        return member.nganh === nganhInputs[2]; // NS
      })
      .array()
      .map((mem) => {
        return mem.points;
      })
      .filter((point, i, self) => {
        return self.indexOf(point) === i;
      })
      .sort(function (a, b) {
        return b - a;
      })
      .slice(0, 3);
    let hsList = members
      .filter((member) => {
        return member.nganh === nganhInputs[3]; // HS
      })
      .array()
      .map((mem) => {
        return mem.points;
      })
      .filter((point, i, self) => {
        return self.indexOf(point) === i;
      })
      .sort(function (a, b) {
        return b - a;
      })
      .slice(0, 3);
    let htList = members
      .filter((member) => {
        return member.nganh === nganhInputs[4]; // HT
      })
      .array()
      .map((mem) => {
        return mem.points;
      })
      .filter((point, i, self) => {
        return self.indexOf(point) === i;
      })
      .sort(function (a, b) {
        return b - a;
      })
      .slice(0, 3);

    let nganhLists = [];
    nganhLists.push(anList);
    nganhLists.push(tnList);
    nganhLists.push(nsList);
    nganhLists.push(hsList);
    nganhLists.push(htList);

    // TODO LOGGER!!!
    //console.log(nganhLists);

    members.forEach((elem) => {
      // Print-friendly vars
      let memName = `<@${elem.id}>\n`;
      let memNganh = `${elem.nganh}\n`;
      let memPoints = `${elem.points}\n`;

      // Search if current member is top three of anything
      let nganhIndex = nganhInputs.findIndex((nganh) => {
        return nganh === elem.nganh;
      });

      if (nganhIndex !== 5 && nganhIndex !== -1) {
        // Found nganh so lets check if user has same points
        let place = 1; // 1st, 2nd, 3rd
        nganhLists[nganhIndex].forEach((point, i) => {
          if (point === elem.points) {
            // Matched points

            // Assign the places
            memName = `${medals[i]} ${memName}`;
          }
        });
      }

      // Before we add we check if its going to hit our 1024 limit
      let maxLength = Math.max(
        allNames[rows1024].length + memName.length,
        allNganhs[rows1024].length + memNganh.length,
        allPoints[rows1024].length + memPoints.length
      );

      if (maxLength >= 1024) {
        // We hit max 1024 chars, so go next
        rows1024++;
        allNames.push("");
        allNganhs.push("");
        allPoints.push("");
      }

      allNames[rows1024] += memName;
      allNganhs[rows1024] += memNganh;
      allPoints[rows1024] += memPoints;

      // Get maximum size by finding the person's nickname if exists then tries for actual username
      let nameString = message.guild.members.cache.get(elem.id).displayName;
      if (!nameString)
        nameString = message.guild.members.cache.get(elem.id).user.username;

      // Since ${elem.id} is bunch of numbers, the numbers arent actually displayed. Its the username/nickname.
      // We take the max length of names/nganh/points including the headers and find the longest
      let memNameLength = Math.max(`@${nameString}`.length, `Names`.length);
      let memNganhLength = Math.max(memNganh.length - 1, `Nganh`.length);
      let memPointsLength = Math.max(memPoints.length - 1, `Points`.length);

      titleLength = Math.max(
        titleLength,
        memNameLength + memNganhLength + memPointsLength
      );
    });

    titleLength = Math.min(titleLength, 60);

    let title = pad("Points Leaderboard", titleLength + 4, "+", 3);

    // Loop through the rest if any and send seperate messages
    for (let index = 0; index <= rows1024; index++) {
      if (rows1024 > 0) {
        title = pad(`Points Leaderboard ${index + 1}`, titleLength, "+", 3);
      }

      // Create embed for it
      const embeddedMessage = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .addFields(
          {
            name: title,
            value: `\u200B`,
          },
          { name: "Name", value: allNames[index], inline: true },
          { name: "Nganh", value: allNganhs[index], inline: true },
          { name: "Points", value: `${allPoints[index]}`, inline: true }
        );

      // Send messsage and wait until it is sent before generating another one
      try {
        await message.channel.send(embeddedMessage);
      } catch (error) {
        console.log(error);
        return false;
      }
    }
    return true;
  }

  async sendMultipleMessages(message, strArray) {
    try {
      for (let index = 0; index < strArray.length; index++) {
        await message.channel.send(strArray[index]);
      }
    } catch (error) {
      logger.log(log.ERROR, `Unable to send multiple messages ` + error);
      return false;
    }
    return true;
  }

  save() {
    let json = [];

    this.__members.forEach((mem) => {
      json.push(mem);
    });

    json = JSON.stringify(json);
    //console.log(json);

    fs.writeFileSync(
      `./util/guildpoints/${this.__guildid}.json`,
      json,
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
  }
}

module.exports = PointKeeper;
