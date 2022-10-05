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

## Visual Diffing

We use [Percy](https://percy.io/bf41c983/gallery) for visual diffing.

In these integration tests, you can call `cy.percySnapshot()` to take a snapshot of a given page or part of a page. When the Cypress tests run in CI, the snapshots will be taken and sent to Percy, which will then compare them to previous snapshots and flag if anything has changed.

If the visual diffs fail, spot-check the snapshot and confirm whether the UI looks as expected. Because we're snapshotting galleries with dynamic art, the Percy builds _are_ likely to show failures that need to be confirmed or rejected by a human.
