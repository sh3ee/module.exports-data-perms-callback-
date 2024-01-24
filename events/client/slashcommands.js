const { Events, ChatInputCommandInteraction } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,

    /** 
     * @param {ChatInputCommandInteraction} interaction;
     * @param {Client} client;
     * @returns;
     * 
     */

    callback: async (interaction, client) => {

        if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;
        const { user, guild, commandName, member } = interaction;

        if (!guild) return;
        const command = client.SlashCommands.get(commandName);

        if (!command) {
            return interaction.reply({ content: `This commands doest't exist!`, ephemeral: true }) && client.SlashCommands.delete(commandName);
        }

        if (command.perms.UserPermissions && command.perms.UserPermissions.length !== 0)
            if (!member.permissions.has(command.perms.UserPermissions)) return interaction.reply({ content: `You need \`${command.perms.UserPermissions.join(", ")}\` permission(s) to execute this command!`, ephemeral: true });


        if (command.perms.BotPermissions && command.perms.BotPermissions.length !== 0)
            if (!guild.members.me.permissions.has(command.perms.BotPermissions)) return interaction.reply({ content: `I need \`${command.perms.BotPermissions.join(", ")}\` permission(s) to execute this command!`, ephemeral: true });


        if (command.perms.devOnly && !client.Developer.includes(user.id)) return interaction.reply({ content: `This command is devOnly!`, ephemeral: true });

        command.callback(interaction, client);
    }
}