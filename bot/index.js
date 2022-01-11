const { Telegraf } = require('telegraf');

class BotRunner {
  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.bot.start((ctx) => ctx.reply('Welcome'));
    this.bot.help((ctx) => ctx.reply('Send me a sticker'));
    this.bot.on('sticker', (ctx) => ctx.reply('👍'));
    this.bot.hears('hi', (ctx) => ctx.reply('Hey there'));
  }

  run() {
    this.bot.launch();
  }

  stop(signal) {
    this.bot.stop(signal);
  }
}

module.exports = BotRunner;
