# Gallery Frontend

The premier gallery experience for your NFTs.

## Getting Started

### Pre-requisites

1. [Install Yarn](https://classic.yarnpkg.com/en/docs/install)
2. [Install NVM](https://github.com/nvm-sh/nvm)

### Setup Web

Install our node version:

```bash
nvm install && nvm use
```

Install dependencies:

```bash
yarn install
```

Create a local .env file by copying values from .env.sample:

```bash
cp apps/web/.env.sample apps/web/.env
```

Start app:

```bash
yarn moon run web:dev
```

The app will be running at http://localhost:3000.

### E2E Testing

Cypress CI is configured as a Github workflow in `.github/workflows`.

### Advanced

If you need access to any of the following:

- Test wallet
- Analytics keys
- Sentry keys
- Cypress dashboard

Hit up a member of the core team!

### Other commands

- `moon run web:test` for tests
- `moon run web:relay-codegen` to run relay compiler
- `moon run web:relay-watch` to run relay compiler in watch mode
- `moon run web:lint` for linting
- `moon run web:typecheck` for checking type validity
- `moon run web:synpress-run` to run e2e tests
- `moon run web:synpress-open` to open cypress
