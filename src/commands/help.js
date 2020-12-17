const { prefix } = require("../config.json");
const { CommandException } = require("../util/util.js");
const permissions = require("../util/permissions");

module.exports = {
  name: "help",
  description: "List all of my commands or info about a specific command",
  aliases: ["?", "commands"], // Include if aliases are desired
  usage: "[command name]", // Include if args is true
  guildOnly: true, // Include if exclusive to server
  execute(message, args) {
    try {
      if (args.length === 0) {
        // !help for command list
        handleCommandList(message);
      } else {
        // !help [command], for command info
        handleCommandHelp(message, args);
      }
    } catch (error) {
      throw error;
    }
  },
};

function handleCommandList(message) {
  // Gathers all commands, user asked for !help
  const data = [];
  const { commands } = message.client;

  let isDev = permissions.isDev(message);
  let isAdmin = permissions.isAdmin(message);

  let commandList;

  if (isDev) commandList = commands.map((command) => command.name).join(", ");
  else if (isAdmin)
    commandList = commands
      .filter((command) => {
        return !command.dev_permissions;
      })
      .map((command) => command.name)
      .join(", ");
  else
    commandList = commands
      .filter((command) => {
        return !command.admin_permissions && !command.dev_permissions;
      })
      .map((command) => command.name)
      .join(", ");

  data.push("Here's a list of all my commands:");
  data.push(commandList);
  data.push(
    `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
  );

  return message.channel.send(data, { split: true }).catch((error) => {
    //prettier-ignore
    let replyContent = `It seems like there was an unexpected error. Please contact a developer`;
    let errorLog = `help.js ${error}`;
    throw new CommandException(
      message,
      replyContent,
      module.exports.name,
      errorLog
    );
  });
}

function handleCommandHelp(message, args) {
  // Gathers information about specific command, user asked for !help [command]
  const data = [];
  const { commands } = message.client;

  const name = args[0].toLowerCase();
  const command =
    commands.get(name) ||
    commands.find((c) => c.aliases && c.aliases.includes(name));

  if (!command) {
    //prettier-ignore
    let replyContent = `that's not a valid command!`;
    let errorLog = `Invalid command`;
    throw new CommandException(
      message,
      replyContent,
      module.exports.name,
      errorLog
    );
  }

  data.push(`**Name:** ${command.name}`);
  if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(", ")}`);
  if (command.description) data.push(`**Description:** ${command.description}`);
  if (command.usage) {
    let usages = command.usage.split(/ *\n */);
    if (usages.length > 1) {
      // Multiple usages
      data.push(`**Usage:**`);
      usages.forEach((usage) => {
        data.push(`\`${prefix}${command.name} ${usage}\``);
      });
    } else {
      data.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``);
    }
  }

  data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

  return message.channel.send(data, { split: true });
}
