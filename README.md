# Gallery Frontend

The premier gallery experience for your NFTs.

## Getting Started

### Pre-requisites

1. [Install Yarn](https://classic.yarnpkg.com/en/docs/install)
2. [Install NVM](https://github.com/nvm-sh/nvm)

### Setup

Create a local .env file by copying values from .env.sample:

```terminal
$ cp .env.sample .env
```

Install our node version:

```bash
$ nvm use
```

Install dependencies:

```bash
$ yarn
```

Start app:

```bash
$ yarn dev
```

The app will be available on localhost:3000.

### Other commands

- `yarn test` for tests
- `yarn lint` for linting
- `yarn typecheck` for checking type validity

## 🤔 What's going on with Next.JS?

We're in the middle of a migration to Next.JS. So we're not fully leveraging all of the Next.JS features.
Temporarily, we are re-routing all requests to use `/` under the hood or `pages/index.tsx` which renders
our root `App` component. We're achieving this through this `next.config.js` section.

```js
{
  async rewrites() {
    return [
      // Rewrite everything to `pages/index`
      {
        source: '/:any*',
        destination: '/',
      },
    ];
  }
}
```
