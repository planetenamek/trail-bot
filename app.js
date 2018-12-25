require('dotenv').config();
const Discord = require("discord.js");
const config = require("./config.js");

var bot = new Discord.Client({
  autoReconnect: true
});
const streamOP = require("./actions/streamOp.js");

bot.on("ready", () => {
  console.log("Trail Bot Ready !");
  bot.user.setActivity('Stream Steem');
});

  streamOP.stream();

bot.on("disconnect", function() {
  console.log("Bot disconnected");
  bot.login(config.token);
  console.log("Trail Bot Ready !");
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

bot.on("disconnect", function() {
  console.log("Bot disconnected");
  bot.login(config.token);
  console.log("Trail Bot Ready !");
});

bot.login(config.token);
