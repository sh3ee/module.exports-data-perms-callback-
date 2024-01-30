const { inspect } = require(`util`);
const { Message, Client, AttachmentBuilder } = require("discord.js");

const data = {
    name: "eval",
}

const perms = {
    BotPermissions: ["SendMessages"],
    UserPermissions: ["SendMessages"],
    devOnly: true
}

/**
 * @param {Client} client;
 * @param {Message} message;
 * @param {*} args;
 * @returns;
 * 
 */

async function callback(client, message, args) {
    if (!args[0]) return;

    let evaled;

    try {
        try {
            evaled = await eval(args.join(` `));
        } catch (error) {
            return message.reply(`\`\`\`js\n${error}\n\`\`\``)
        }

        let string = inspect(evaled);
        if (string.includes(client.token)) return message.reply(`No token grabbing.`);

        let output = new AttachmentBuilder(Buffer.from(string), { name: `result.js` })
        if (string.length > 2000) return message.channel.send({ files: [output] })

        message.channel.send(`\`\`\`js\n${string}\n\`\`\``)
    } catch (e) {
        return message.reply(e.toString())
    }
}

module.exports = { data, perms, callback }