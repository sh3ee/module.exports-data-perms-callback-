const { Events, Message, ChannelType } = require("discord.js");
const { ClientPrefix } = require("../../configuration/config.json");

module.exports = {
    name: Events.MessageCreate,

    /** 
     * @param {Message} message;
     * @param {Client} client; 
     * @returns;
     * 
     */

    callback: async (client, message) => {

        if (message.channel.type !== ChannelType.GuildText) return;
        const { author, guild, member } = message;

        const prefix = ClientPrefix;

        if (author.bot || !message.guild || !message.content.toLowerCase().startsWith(prefix)) return;
        const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

        const command = client.commands.get(cmd.toLowerCase()) || client.commands.find(c => c.data.aliases?.includes(cmd.toLowerCase()));
        if (!command) return;

        if (command.perms.UserPermissions && command.perms.UserPermissions.length !== 0)
            if (!member.permissions.has(command.perms.UserPermissions)) return message.reply({ content: `You need \`${command.perms.UserPermissions.join(", ")}\` permission(s) to execute this command!` });

        if (command.perms.BotPermissions && command.perms.BotPermissions.length !== 0)
            if (!guild.members.me.permissions.has(command.perms.BotPermissions)) return message.reply({ content: `I need \`${command.perms.BotPermissions.join(", ")}\` permission(s) to execute this command!` });

        if (command.perms.devOnly && !client.Developer.includes(author.id)) return message.reply({ content: `This command is devOnly!` });

        command.callback(client, message, args);
    }
}