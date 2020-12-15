const { prefix } = require("../config.json");
const Discord = require("discord.js");
const logger = require("../util/logger");

module.exports = {
  name: "setup",
  description: "Does setup of the bot for the server",
  guildOnly: true, // Include if exclusive to server
  admin_permissions: true,
  cooldown: 5,
  execute(message, args) {
    if (args.length === 0) {
      // Prompt user to pick roles for administrator commands

      // Generate embed message
      let title = "Setup for Server";
      let guildRoles = "";
      let adminRoles = "None";

      if (message.guild.roles.cache.keyArray().length === 1) {
        // No roles
        logger.log(
          logger.WARNING,
          `There are no roles in the guild ${message.guild.name} besides @everyone`
        );
        return message.reply("Please create a role for the admins");
      }

      // generate string for adminRoles if exist
      if (
        message.client.guildMetadatas.get(message.guild.id).roles_admin
          .length !== 0
      ) {
        adminRoles = "";
        message.client.guildMetadatas
          .get(message.guild.id)
          .roles_admin.forEach((role_admin_id) => {
            if (message.guild.roles.cache.get(role_admin_id))
              adminRoles += `${
                message.guild.roles.cache.get(role_admin_id).name
              }\n`;
          });
      }

      // generate string for guildRoles
      message.guild.roles.cache
        .filter((role) => {
          return role.name !== "@everyone";
        })
        .each((role) => {
          guildRoles += `${role.name}\n`;
        });

      // Create embed for it
      const embeddedMessage = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .addFields(
          {
            name: title,
            value: `\u200B`,
          },
          { name: "All Roles", value: guildRoles, inline: true },
          { name: "Current Admin Roles", value: adminRoles, inline: true }
        );

      // TODO FUTURE FEATURE: Emojis as selections

      return message.channel.send(embeddedMessage).then(() => {
        message.channel.send(
          `Please type \`${prefix}${this.name} @role1 @role2 ...\` to set admin roles\nex: \`${prefix}${this.name} @HT_Squad @HLV_Squad ...\``
        );
      });
    }

    let validRoles = true;

    // check each arg is valid
    // all must be right or no go
    //
    // Check all the roles to confirm

    // Map args to without symbols
    let adminRoles = args.map((roleId) => {
      let roleMatch = roleId.match(/[0-9]+/);

      // not valid if no number match or cannot find the role
      if (!roleMatch || !message.guild.roles.cache.get(roleMatch[0])) {
        validRoles = false;
        return 0;
      }
      return roleMatch[0];
    });

    if (!validRoles)
      return message.channel.send(
        `Please make sure all roles are valid and are in correct format (@<role>)`
      );

    // Add roles to admin
    message.client.guildMetadatas.get(
      message.guild.id
    ).roles_admin = adminRoles;
    message.client.guildMetadatas.get(message.guild.id).finishPresetup();

    let admin_string = args.join();

    return message
      .reply(
        `I have successfully configured to allow the following roles to have admin privileges: ${admin_string}\nPlease use \`${prefix}help\` command to learn more about my commands`
      )
      .then((msg) => {
        logger.logCommand(message, module.exports.name);
        logger.log(
          logger.NORMAL,
          `GuildMember: [${message.author.tag}] has succesfully configured for [${message.guild.name}] with roles: ${admin_string}`
        );
      });
  },
};
