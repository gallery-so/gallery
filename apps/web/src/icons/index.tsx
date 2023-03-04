// This file is used to import all of the icons in the src/icons/ directory automatically and export them as a single object, to reduce manual overhead of importing icons individually.

// import every file in src/icons/ except index.tsx
const files = require.context('src/icons/', false, /^(?!.*\/index\.tsx$).*\.tsx$/);

const modules: Record<string, () => JSX.Element> = {};

files.keys().forEach((key) => {
  // get just the module name from the file path: ie. 'src/icons/Icon.tsx' -> 'Icon'
  const fileName = key.match(/\/(\w+)\.tsx?$/)?.[1];
  if (!fileName) return;

  const iconModule = files(key);

  // set each exported module from each file onto the modules object.
  // "key" here is the name of each export in the module.
  Object.keys(iconModule).forEach((key) => {
    // not all Icon modules export a default, so we need to check for that
    if (key !== 'default') {
      modules[key] = iconModule[key];
    } else {
      modules[fileName] = iconModule[key];
    }
  });
});

export default modules;
