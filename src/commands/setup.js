const { prefix } = require("../config.json");
const Discord = require("discord.js");

let emoji = [
  ":one:",
  ":two",
  ":three:",
  ":four:",
  ":five:",
  ":six:",
  ":seven:",
  ":eight:",
  ":nine:",
  ":regional_indicator_a:",
  ":regional_indicator_b:",
  ":regional_indicator_c:",
  ":regional_indicator_d:",
  ":regional_indicator_e:",
  ":regional_indicator_f:",
  ":regional_indicator_g:",
  ":regional_indicator_h:",
  ":regional_indicator_i:",
  ":regional_indicator_j:",
  ":regional_indicator_k:",
  ":regional_indicator_l:",
  ":regional_indicator_m:",
  ":regional_indicator_n:",
  ":regional_indicator_o:",
  ":regional_indicator_p:",
  ":regional_indicator_q:",
  ":regional_indicator_r:",
  ":regional_indicator_s:",
  ":regional_indicator_t:",
  ":regional_indicator_u:",
  ":regional_indicator_v:",
  ":regional_indicator_w:",
  ":regional_indicator_x:",
  ":regional_indicator_y:",
  ":regional_indicator_z:",
];

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

    console.log("how'd they know");

    let admin_string = args.join();

    return message.reply(
      `I have successfully configured to allow the following roles to have admin privileges: ${admin_string}\nPlease use \`${prefix}help\` command to learn more about my commands`
    );
  },
};
