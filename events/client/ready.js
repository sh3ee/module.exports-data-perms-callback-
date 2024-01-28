const { Events, ActivityType } = require("discord.js");
const { logger } = require("../../configuration/common.js");
const client = require("../../index");

module.exports = {
  name: Events.ClientReady,
  once: true,

  /**
   * @param {Client} client
   * @returns;
   *
   */

  callback: async () => {
    logger("INFO", "Client", `${client.user.tag} Is Online!`)

    let i = 0;
    let statuses = [`Ping: ${client.ws.ping} ms`, "/ping"];


    setInterval(() => {
      let status = statuses[i];
      client.user.setActivity({ name: status, type: ActivityType.Watching });
      i = (i + 1) % statuses.length;
    }, 5000);
  }
}