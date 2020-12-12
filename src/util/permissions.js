const { devs } = require("../config.json");

class Permissions {
  constructor() {}

  isDev(message) {
    let isDev = false;
    devs.forEach((dev) => {
      if (message.author.id === dev) {
        isDev = true;
      }
    });
    return isDev;
  }

  isAdmin(message) {
    let isAdmin = false;

    // If insufficient permissions then just say we don't recognize that command
    let guildAdminRoles = message.client.guildMetadatas.get(message.guild.id)
      .roles_admin;

    guildAdminRoles.forEach((adminRole) => {
      if (message.member.roles.cache.get(adminRole)) {
        isAdmin = true;
      }
    });

    // If the user is owner of guild then automatic admin
    if (message.author.id === message.guild.ownerID) isAdmin = true;

    return isAdmin;
  }
}

module.exports = new Permissions();
