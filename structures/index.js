const { Client, Partials, Collection } = require("discord.js");
const { glob } = require("glob");
const path = require("path");
const config = require("../configuration/config.json");
const colors = require("../configuration/design/colors.js");
const { ApplicationCommandType } = require("discord.js");
const { logger } = require("../configuration/common.js");
const process = require("node:process");

const client = new Client({
  intents: [
    "Guilds",
    "GuildMembers",
    "GuildMessages",
    "MessageContent",
    "GuildPresences",
    "GuildVoiceStates",
    "DirectMessages",
  ],
  partials: [
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
    Partials.Message,
  ],
  failIfNotExists: false,
});

client.MessageCommands = new Collection();
client.SlashCommands = new Collection();
client.Color = colors;
client.Developer = config.DeveloperIds;

module.exports = client;

process.on("unhandledRejection", (reason, p) => {
  logger("WARN", reason, p)
});
process.on("uncaughtException", (err, origin) => {
  logger("WARN", err, origin)
});

client.login(config.ClientToken)
  .then(() => {
    (async () => {
      await loadEvents(client);
      await loadMessages(client);
      await loadSlashCommands(client);
    })();
  })
  .catch((err) => {
    logger("WARN", "Client", `${err}`);
  });



function deleteCache(file) {
  const filePath = path.resolve(file);
  if (require.cache[filePath]) {
    delete require.cache[filePath];
  }
}

async function loadFiles(folderName) {
  const files = await glob(
    path.join(process.cwd(), folderName, "**/*.js").replace(/\\/g, "/")
  );
  await Promise.all(files.map((file) => deleteCache(file)));
  return files;
}

async function loadEvents(client) {
  console.log(`\n✎ ᴇᴠᴇɴᴛ-ʟᴏᴀᴅᴇʀ-ʀᴜɴɪɴɢ...`);

  const files = await loadFiles("events");

  files.forEach((file) => {
    const event = require(file);

    if (!event.name) {
      logger("WARN", file, "Event Name is either invalid or missing.");
      return;
    }
    if (event.once)
      client.once(event.name, (...args) => event.callback(...args, client));
    else client.on(event.name, (...args) => event.callback(...args, client));
    logger("INFO", event.name, "Successfully Loaded.");
  });
}

async function loadMessages(client) {
  console.log(`\n✎ ᴍᴇssᴀɢᴇ-ᴄᴏᴍᴍᴀɴᴅ-ʟᴏᴀᴅᴇʀ-ʀᴜɴɪɴɢ...`);

  const files = await loadFiles("commands");

  files.forEach((file) => {
    const command = require(file),
      splitted = file.split("/"),
      directory = splitted[splitted.length - 2];

    if (command.data.name) {
      const properties = { directory, ...command };
      client.MessageCommands.set(command.data.name, properties);
      logger("INFO", command.data.name, "Successfully Loaded.");
    } else {
      console.log("WARN", value, `Missing command name.`);
    }
  });
}

async function loadSlashCommands(client) {
  console.log(`\n✎ sʟᴀsʜ-ᴄᴏᴍᴍᴀɴᴅ-ʟᴏᴀᴅᴇʀ-ʀᴜɴɪɴɢ...`);

  const files = await loadFiles("slashcommands");
  await client.SlashCommands.clear();
  let CommandsArray = [];

  files.forEach((file) => {
    const command = require(file);

    if (!command.data || !command.perms || !command.callback) {
      logger(
        "WARN",
        file,
        "Invalid command module structure. Missing required properties."
      );
      return;
    }

    if (!command.data.name) {
      logger("WARN", file, "Missing command name.");
      return;
    }

    if ([ApplicationCommandType.ChatInput].includes(command.data.type)) {
      if (!command.data.description) {
        logger("WARN", file, "Missing a description.");
        return;
      }
    } else if (
      [ApplicationCommandType.Message, ApplicationCommandType.User].includes(
        command.data.type
      )
    ) {
      if (command.data.description) {
        logger("WARN", file, "Context commands does't support description.");
        return;
      }
    }

    client.SlashCommands.set(command.data.name, command);
    CommandsArray.push(command.data);
    logger("INFO", command.data.name, "Successfully Loaded.");
  });

  client.application.commands.set(CommandsArray);
}
