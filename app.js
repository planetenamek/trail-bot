const Discord = require("discord.js");
const config = require("./config.json");

var bot = new Discord.Client({
  autoReconnect: true
});
var streamOp = require("./actions/streamOp.js");

bot.on("ready", () => {
  console.log("Trail Bot Ready !");
  bot.user.setActivity('Stream Steem');
  streamOp.stream();
});

bot.on("message", async message => {
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (message.content.indexOf(config.prefix) !== 0) return;
  switch (command) {
    case "check":
      return message.reply("Ok i'm alive !")

    default:
      console.log('Unknown command');
  }
});

bot.login(config.token);