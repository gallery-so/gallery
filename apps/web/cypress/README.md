# Gallery Cypress

## Project structure:

```text
project_dir
└── cypress
    └── fixtures
    └── integration
        └── pages
        └── specs
            └── sample.spec.ts
    └── plugins
        └── example-spec.js
    └── support
        └── example-page.js
```

### Fixtures

A place to store all the static data to run a test. Example: username, collection name, user ID, etc.

### Integration

All the testing files will be stored. There are two folders inside it which are pages and specs.

- **Pages** - It's where all the helper functions or DOM query in a specific page.
- **Specs** - It's where the testing spec and instruction happen. It needs to be in `.spec.ts` format.

### Plugins

Plugin dependency file if we want to extend the cypress functionality from a third party.

### Support

This is where you can create custom commands or overwrite existing cypress commands.
