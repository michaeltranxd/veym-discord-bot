const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const PointKeeper = require("./util/PointKeeper");

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once("ready", () => {
  client.pointKeepers = new Discord.Collection();

  // For every guild create a pointKeeper so each guild is different
  // Populate with saved files...
  client.guilds.cache.each((guild) => {
    client.pointKeepers.set(guild.id, new PointKeeper(client, guild.id));
  });

  // Client keeps track of new members that join
  client.on("guildMemberAdd", (member) => {
    let pointKeeperGuild = client.pointKeepers.get(member.guild.id);
    if (pointKeeperGuild) {
      pointKeeperGuild.addJoiningMember(member);
    } else {
      console.log(
        `ERROR (guildMemberAdd): new GuildMember's guild does not have pointKeeper`
      );
    }
  });

  // Client keeps track of new members that join
  client.on("guildMemberRemove", (member) => {
    let pointKeeperGuild = client.pointKeepers.get(member.guild.id);
    if (pointKeeperGuild) {
      pointKeeperGuild.removeLeavingMember(member);
    } else {
      console.log(
        `ERROR (guildMemberRemove): new GuildMember's guild does not have pointKeeper`
      );
    }
  });

  console.log("Ready!");
});

client.on("message", (message) => {
  // Ignore the message if it was sent by the bot or if it doesn't have our prefix
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  // command is not valid (we dont recognize this command)
  if (!command) {
    const helpCommand = client.commands.get("help");
    return message.reply(
      `I don't recognize that command, look at my available commands:\nrun \`${prefix}${helpCommand.name}\` to examine commands`
    );
  }

  // Checks for args if required
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nPlease type \`${prefix}help ${command.name}\` for the usage`;
    }

    return message.channel.send(reply);
  }

  // Check for guilds only
  if (command.guildOnly && message.channel.type !== "text") {
    return message.reply("I can't execute that command inside DMs!");
  }

  // Check for cooldowns
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message
        .reply(
          `please wait ${timeLeft.toFixed(
            1
          )} more second(s) before reusing the \`${command.name}\` command.`
        )
        .then((msg) => {
          msg.delete({ timeout: 5 * 1000 });
        })
        .catch((error) => {
          console.log("Couldn't delete for some reason...", error);
        });
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

// Enable client debugging!
// client.on("debug", console.log);

client.on("error", (error) => {
  console.log(error);
  console.log("invalid");
});

client.login(token);

/* Exit Handling */

function exitHandler() {
  client.guilds.cache.each((guild) => {
    client.pointKeepers.get(guild.id).save();
  });

  client.destroy();
}

process.on("SIGINT", () => {
  console.log("Process interrupted");
  exitHandler();
  process.exit();
});

process.on("SIGTERM", () => {
  console.log("Process terminated");
  exitHandler();
  //process.exit();
});

process.on("uncaughtException", (error) => {
  console.log(error);
  exitHandler();
});
