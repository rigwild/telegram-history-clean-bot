# Telegram history clean bot

Telegram does not offer a bulk message delete for groups. This bot will delete messages after some time.

## Install

```sh
pnpm install
```

## Build

```sh
pnpm build
```

## Run

You can pass the time as a [ms](https://github.com/vercel/ms) string.

**Note:** A bot can't delete a message that is older than 48 hours.

```sh
TG_TOKEN=<telegram_token> DELETE_AFTER_TIME=30h DELETE_AFTER_MESSAGES_COUNT=3500 node dist/index.js
```

Using [PM2](https://pm2.keymetrics.io/).

```sh
TG_TOKEN=<telegram_token> \
DELETE_AFTER_TIME=30h \
DELETE_AFTER_MESSAGES_COUNT=3500 \
DELETE_AFTER=30h \
NODE_ENV=production \
pm2 start --max-memory-restart 150M --time --name "telegram-history-clean-bot" dist/index.js
```

## License

[The MIT License](./LICENSE)
