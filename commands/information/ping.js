const { Message, Client } = require("discord.js");

const data = {
  name: "ping",
  aliases: ["ms", "ws"],
}

const perms = {
  BotPermissions: ["SendMessages"], UserPermissions: ["SendMessages"], devOnly: false
}

/**
 * @param {Client} client;
 * @param {Message} message;
 * @param {*} args;
 * @returns;
 * 
 */

async function callback(message, client, args) {
  return message.reply({ content: `${client.Icon.Normal.Right} Ping: **${client.ws.ping} ms**` });
}



module.exports = { data, perms, callback }