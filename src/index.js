const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token, devs } = require("./config.json");
const PointKeeper = require("./util/PointKeeper");
const GuildMetadata = require("./util/GuildMetadata");
const logger = require("./util/logger");
const permissions = require("./util/permissions");

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
  client.guildMetadatas = new Discord.Collection();

  // For every existing guild create a pointKeeper so each guild is different
  // For every existing guild create the guildmetadata
  // Populate with saved files...
  client.guilds.cache.each((guild) => {
    client.pointKeepers.set(guild.id, new PointKeeper(client, guild.id));
    client.guildMetadatas.set(guild.id, new GuildMetadata(client, guild.id));
  });

  // Client keeps track of new members that join
  client.on("guildMemberAdd", (member) => {
    let pointKeeperGuild = client.pointKeepers.get(member.guild.id);
    if (pointKeeperGuild) {
      pointKeeperGuild.addJoiningMember(member);
    } else {
      logger.log(
        logger.ERROR,
        `(guildMemberAdd): [${member.user.username}] joined ${member.guild.name}, but this guild does not have pointKeeper`
      );
    }
  });

  // Client keeps track of new members that join
  client.on("guildMemberRemove", (member) => {
    let pointKeeperGuild = client.pointKeepers.get(member.guild.id);
    if (pointKeeperGuild) {
      pointKeeperGuild.removeLeavingMember(member);
    } else {
      logger.log(
        logger.ERROR,
        `(guildMemberRemove): [${member.user.username}] left ${member.guild.name}, but this guild does not have pointKeeper`
      );
    }
  });

  // Client joins new server
  client.on("guildCreate", (guild) => {
    client.pointKeepers.set(guild.id, new PointKeeper(client, guild.id));
    client.guildMetadatas.set(guild.id, new GuildMetadata(client, guild.id));
    if (guild.systemChannel)
      guild.systemChannel.send(
        `Please contact the server owner to set me up. They can start setup by running the command \`${prefix}setup\` :)`
      );
    logger.log(
      logger.NORMAL,
      `Recently joined [${guild.name}], they need to run setup`
    );
  });

  logger.log(logger.NORMAL, "Ready!");
});

/*
 * Conditions of ignoring messages
 * 1.) Does not have the prefix
 * 2.) Is not sent by a non-robot user
 * 3.) Message in DM that is sent by a non DEV
 *
 *
 * Conditions of rejecting messages
 * 1.)
 *
 */

client.on("message", async (message) => {
  let isDev = permissions.isDev(message);

  // Ignore the message if it was sent by the bot or if it doesn't have our prefix
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // If command sent through DM & author is not a dev then ignore
  if (message.channel.type !== "text" && !isDev) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  // Check for presetup is completed
  // Alert user if havent done presetup only check when in server
  if (message.channel.type === "text") {
    // metadata requires presetup, reject if not !setup or not owner of server doing setup
    if (
      client.guildMetadatas.get(message.guild.id).needPresetup() &&
      (commandName !== "setup" || message.guild.owner.id !== message.author.id)
    ) {
      logger.log(
        logger.DEBUG,
        `[${message.guild.name}] still needs to set me up`
      );
      return message.reply(
        `Please contact the server owner to set me up. They can start setup by running the command \`${prefix}setup\` :)`
      );
    }
  }

  // command is not valid (we dont recognize this command)
  if (!command) {
    const helpCommand = client.commands.get("help");
    return message.reply(
      `I don't recognize that command, look at my available commands:\nrun \`${prefix}${helpCommand.name}\` to examine commands`
    );
  }

  // Messaage was sent in guild then we check permissions, else we assume its a dev
  if (message.channel.type === "text") {
    let isAdmin = permissions.isAdmin(message);

    // Dont have permissions
    if (
      (!isAdmin && command.admin_permissions) ||
      (!isDev && command.dev_permissions)
    ) {
      const helpCommand = client.commands.get("help");
      return message.reply(
        `I don't recognize that command, look at my available commands:\nrun \`${prefix}${helpCommand.name}\` to examine commands`
      );
    }
  }

  // Checks for args if required
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nPlease type \`${prefix}help ${command.name}\` for the usage`;
    }

    logger.log(
      logger.DEBUG,
      `${message.author} did not provide args for command [${command.name}]`
    );

    return message.channel.send(reply);
  }

  // Check for guilds only
  if (command.guildOnly && message.channel.type !== "text") {
    logger.log(
      logger.DEBUG,
      `${message.author} tried to execute command [${command.name}] in DMs`
    );
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
          logger.log(
            logger.DEBUG,
            `${message.author.username} using command [${command.name}] too fast!`
          );
        })
        .catch((error) => {
          logger.log(
            logger.ERROR,
            `Could not delete message, cooldown message` + error
          );
        });
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    logger.logCommand(message, command.name);
    await command.execute(message, args);
    logger.logCommandSuccess(message, command.name);
  } catch (error) {
    if (error && error.type == `CommandException`) {
      logger.logCommandError(message, error.name, error.errorLog);
      message.reply(error.replyContent);
    } else {
      // Other default errors
      logger.log(logger.ERROR, `Error executing command ` + error);
      message.reply("there was an error trying to execute that command!");
    }
  }
});

// Enable client debugging!
// client.on("debug", console.log);

client.on("error", (error) => {
  logger.log(logger.ERROR, `Client ran into an error ` + error);
});

client.login(token);

/* Exit Handling */

function exitHandler() {
  client.guilds.cache.each((guild) => {
    client.pointKeepers.get(guild.id).save();
    client.guildMetadatas.get(guild.id).save();
  });

  logger.save();

  client.destroy();
}

process.on("SIGINT", () => {
  logger.log(logger.WARNING, `Process interrupted, SIGINT signal`);
  exitHandler();
  process.exit();
});

process.on("SIGTERM", () => {
  logger.log(logger.WARNING, `Process terminated, SIGTERM signal`);
  exitHandler();
  //process.exit();
});

process.on("uncaughtException", (error) => {
  logger.log(logger.ERROR, `uncaughtException, i should do better ` + error);
  exitHandler();
});
