# Gallery Frontend

The premier gallery experience for your NFTs.

## Getting Started

### Pre-requisites

1. [Install Yarn](https://classic.yarnpkg.com/en/docs/install)
2. [Install NVM](https://github.com/nvm-sh/nvm)

##### Install Moon

At Gallery, we use a monorepo tool called [moon](https://moonrepo.dev).
Every time you want to run a task in our repo, it will follow the format `moon {command-here}`.

**Before moving forward with this README, please install `moon` using [these instructions](https://moonrepo.dev/docs/install#installing)**

You'll notice there are different apps and packages in the repo, each with its own `moon.yml` file. The files list the relevant moon commands to run for each target. If you're unsure about which command to run to boot a specific app or package, refer to the associated `moon.yml`.`

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
moon run web:dev
```

The app will be running at http://localhost:3000.

### Working with Shared Packages

`/packages/shared` contains shared code that can be utilized by both web and mobile. When developing here, you'll need to run codegen specific to that package, such as `moon run shared:codegen-watch`. In other words, just having the web or mobile app running won't automatically handle codegen for `shared` – that will need to be a separate process.

### E2E Testing

Cypress CI is configured as a Github workflow in `.github/workflows`.

### Advanced

If you need access to any of the following:

- Test wallet
- Analytics keys
- Sentry keys
- Cypress dashboard

Hit up a member of the core team.

### Other commands

- `moon run web:test` for tests
- `moon run web:relay-codegen` to run relay compiler
- `moon run web:relay-watch` to run relay compiler in watch mode
- `moon run web:lint` for linting
- `moon run web:typecheck` for checking type validity
- `moon run web:synpress-run` to run e2e tests
- `moon run web:synpress-open` to open cypress
- `yarn fetch-schema` to pull graphql schema from production
- `yarn fetch-schema-dev` to pull graphql schema from development
