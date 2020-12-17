const { CommandException } = require(`../util/util`);

module.exports = {
  name: "reload",
  description: "Reloads a command",
  dev_permissions: true,
  args: true,
  cooldown: 5,
  execute(message, args) {
    let commandList = message.client.commands;

    const commandName = args[0].toLowerCase();
    const command =
      commandList.get(commandName) ||
      commandList.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );

    if (!command) {
      //prettier-ignore
      let replyContent = `There is no command with name or alias \`${commandName}\``;
      let errorLog = `Invalid command name`;
      throw new CommandException(message, replyContent, this.name, errorLog);
    }

    delete require.cache[require.resolve(`./${command.name}.js`)];

    try {
      const newCommand = require(`./${command.name}.js`);
      message.client.commands.set(newCommand.name, newCommand);
    } catch (error) {
      //prettier-ignore
      let replyContent = `There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``
      let errorLog = `Issue reloading command ${command.name} ` + error;
      throw new CommandException(message, replyContent, this.name, errorLog);
    }

    message.channel.send(`Command \`${command.name}\` was reloaded!`);
  },
};
