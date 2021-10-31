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

```sh
TG_TOKEN=<telegram_token> DELETE_AFTER=2d node dist/index.js
```

Using [PM2](https://pm2.keymetrics.io/).

```sh
TG_TOKEN=<telegram_token> \
DELETE_AFTER=2d \
NODE_ENV=production \
pm2 start --max-memory-restart 150M --name "telegram-history-clean-bot" dist/index.js
```

## License

[The MIT License](./LICENSE)
