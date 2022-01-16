/* eslint-disable camelcase */
const fp = require('fastify-plugin');
const telegrafPlugin = require('fastify-telegraf');
const { Telegraf, Markup } = require('telegraf');
const Polyglot = require('node-polyglot');

const it = require('locales/it');
const en = require('locales/en');
const commands = require('./commands');

const locales = { it, en };

async function botPlugin(fastify, opts) {
  const { WEBHOOK_URL, BOT_TOKEN, NODE_ENV } = process.env;

  if (!WEBHOOK_URL && NODE_ENV !== 'dev') throw new Error('"WEBHOOK_URL" env var is required!');
  if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');

  const bot = new Telegraf(BOT_TOKEN);
  const SECRET_PATH = `/telegraf/${bot.secretPathComponent()}`;
  await fastify.register(telegrafPlugin, { bot, path: SECRET_PATH });

  if (NODE_ENV !== 'dev') {
    bot.telegram.setWebhook(WEBHOOK_URL + SECRET_PATH).then(() => {
      console.log('Webhook is set on', WEBHOOK_URL);
    });
  }

  fastify.addHook('onClose', (_, done) => {
    bot.stop();
    done();
  });

  fastify.decorate('bot', bot);

  const sessions = {};
  bot.use((ctx, next) => {
    if (!sessions[ctx.chat.id]) {
      sessions[ctx.chat.id] = {};
    }
    ctx.session = sessions[ctx.chat.id];
    next();
  });

  bot.use((ctx, next) => {
    const i18n = new Polyglot();

    if (!ctx.session.lang) {
      const { language_code } = ctx.from;
      ctx.session.lang = language_code;
    }
    i18n.extend(locales[ctx.session.lang] || locales.en);
    ctx.i18n = i18n;
    next();
  });

  bot.start((ctx) => {
    ctx.reply(
      ctx.i18n.t('start', { username: ctx.from.username, lang: locales[ctx.session.lang].lang }),
      Markup.keyboard([
        [ctx.i18n.t('commands.settings'), ctx.i18n.t('commands.home')],
      ]).oneTime().resize(),
    );
  });

  const homeHandler = (ctx) => {
    ctx.reply(ctx.i18n.t('sendCommand'), Markup
      .keyboard([
        [ctx.i18n.t('commands.new'), ctx.i18n.t('commands.settings')],
      ])
      .oneTime()
      .resize());
  };
  bot.command(commands.home, homeHandler);
  bot.hears(locales.it['commands.home'], homeHandler);
  bot.hears(locales.en['commands.home'], homeHandler);

  const changeLangHandler = (ctx) => {
    ctx.reply(ctx.i18n.t('chooseLang'), Markup
      .keyboard([
        ['🇮🇹 Italiano', '🇬🇧 English'],
      ])
      .oneTime()
      .resize());
  };
  bot.command(commands.changeLang, changeLangHandler);
  bot.hears(locales.it['commands.settings'], changeLangHandler);
  bot.hears(locales.en['commands.settings'], changeLangHandler);

  bot.hears('🇮🇹 Italiano', (ctx) => {
    ctx.session.lang = 'it';
    ctx.i18n.clear();
    ctx.i18n.extend(locales.it);
    ctx.reply(ctx.i18n.t('langSet'), Markup
      .keyboard([
        [ctx.i18n.t('commands.new'), ctx.i18n.t('commands.settings')],
      ]));
  });

  bot.hears('🇬🇧 English', (ctx) => {
    ctx.session.lang = 'en';
    ctx.i18n.clear();
    ctx.i18n.extend(locales.en);
    ctx.reply(ctx.i18n.t('langSet'), Markup
      .keyboard([
        [ctx.i18n.t('commands.new'), ctx.i18n.t('commands.settings')],
      ]));
  });

  const newHandler = (ctx) => ctx.reply('ok!');
  bot.command(commands.new, newHandler);
  bot.hears(locales.it['commands.new'], newHandler);
  bot.hears(locales.en['commands.new'], newHandler);

  bot.launch();
}

module.exports = fp(botPlugin);
