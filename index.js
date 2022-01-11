require('app-module-path').addPath(__dirname);
require('dotenv').config();

const BotRunner = require('bot');

const bot = new BotRunner();
bot.run();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
