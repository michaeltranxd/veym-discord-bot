const logger = require("../util/logger");

module.exports = {
  name: "reload",
  description: "Reloads a command",
  dev_permissions: true,
  cooldown: 5,
  execute(message, args) {
    //message.channel.send(`${name} : ${description}`);

    if (!args.length)
      return message.channel.send(
        `You didn't pass any command to reload, ${message.author}!`
      );

    let commandList = message.client.commands;

    const commandName = args[0].toLowerCase();
    const command =
      commandList.get(commandName) ||
      commandList.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (!command)
      return message.channel.send(
        `There is no command with name or alias \`${commandName}\`, ${message.author}!`
      );

    delete require.cache[require.resolve(`./${command.name}.js`)];

    try {
      const newCommand = require(`./${command.name}.js`);
      message.client.commands.set(newCommand.name, newCommand);
    } catch (error) {
      logger.log(
        logger.ERROR,
        `Issue reloading command ${command.name} ` + error
      );
      message.channel.send(
        `There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``
      );
    }

    message.channel
      .send(`Command \`${command.name}\` was reloaded!`)
      .then((msg) => {
        logger.logCommand(message, module.exports.name);
      });
  },
};
