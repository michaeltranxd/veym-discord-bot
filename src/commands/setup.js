const { prefix } = require("../config.json");
const Discord = require("discord.js");
const logger = require("../util/logger");
const { CommandException } = require("../util/util.js");

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
        //prettier-ignore
        let replyContent = "Please create a role for the admins";
        let errorLog = `There are no roles in the guild ${message.guild.name} besides @everyone`;
        throw new CommandException(message, replyContent, this.name, errorLog);
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

      let limitRolesReached = false;

      // generate string for guildRoles
      message.guild.roles.cache
        .filter((role) => {
          return role.name !== "@everyone";
        })
        .each((role) => {
          if (guildRoles.length + `${role.name}\n`.length > 1024) {
            limitRolesReached = true;
            return;
          }
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
        )
        .setFooter("*Not all roles may be listed*");

      // TODO FUTURE FEATURE: Emojis as selections

      try {
        return message.channel.send(embeddedMessage).then(() => {
          message.channel.send(
            `Please type \`${prefix}${this.name} @role1 @role2 ...\` to set admin roles\nex: \`${prefix}${this.name} @HT_Squad @HLV_Squad ...\``
          );
        });
      } catch (error) {
        //prettier-ignore
        let replyContent = `I ran into an issue. Please contact a developer.`;
        let errorLog =
          `Issue sending embeddedMessage, then sending message to channel` +
          error;
        throw new CommandException(message, replyContent, this.name, errorLog);
      }
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

    if (!validRoles) {
      //prettier-ignore
      let replyContent = `Please make sure all roles are valid and are in correct format (@<role>)`
      let errorLog = `Roles provided in args are not in correct format`;
      throw new CommandException(message, replyContent, this.name, errorLog);
    }

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
        logger.log(
          logger.NORMAL,
          `GuildMember: [${message.author.tag}] has succesfully configured for [${message.guild.name}] with roles: ${admin_string}`
        );
      });
  },
};
