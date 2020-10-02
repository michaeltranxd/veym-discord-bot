const { prefix, devs } = require("../config.json");

module.exports = {
  name: "help",
  description: "List all of my commands or info about a specific command",
  aliases: ["?", "commands"], // Include if aliases are desired
  usage: "[command name]", // Include if args is true
  execute(message, args) {
    const data = [];
    const { commands } = message.client;

    // Check if message came from a dev
    let isDev = false;
    devs.forEach((dev) => {
      if (message.author.id === dev) {
        isDev = true;
      }
    });

    if (!args.length) {
      let commandList = commands
        .filter((command) => {
          return !command.admin_permissions || !command.dev_permissions;
        })
        .map((command) => command.name)
        .join(", ");

      // If not dev, we check for admin permissions
      if (!isDev) {
        let isAdmin = false;

        // Check for permissions
        // If insufficient permissions then just say we don't recognize that command
        let guildAdminRoles = message.client.guildMetadatas.get(
          message.guild.id
        ).roles_admin;

        guildAdminRoles.forEach((adminRole) => {
          if (message.member.roles.cache.get(adminRole.id)) {
            isAdmin = true;
            console.log("we admin_help");
          }
        });

        // If the user is owner of guild then automatic admin
        if (message.author.id === message.guild.ownerID) isAdmin = true;

        if (isAdmin)
          commandList = commands
            .filter((command) => {
              return !command.dev_permissions;
            })
            .map((command) => command.name)
            .join(", ");
      }

      data.push("Here's a list of all my commands:");
      data.push(commandList);
      data.push(
        `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
      );

      return message.channel.send(data, { split: true }).catch((error) => {
        console.error(error);
        message.reply(
          "It seems like there was an unexpected error. Please contact a developer"
        );
      });
    }

    const name = args[0].toLowerCase();
    const command =
      commands.get(name) ||
      commands.find((c) => c.aliases && c.aliases.includes(name));

    if (!command) {
      return message.reply("that's not a valid command!");
    }

    data.push(`**Name:** ${command.name}`);
    if (command.aliases)
      data.push(`**Aliases:** ${command.aliases.join(", ")}`);
    if (command.description)
      data.push(`**Description:** ${command.description}`);
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
  },
};
