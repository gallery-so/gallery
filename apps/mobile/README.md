Start mobile app

```bash
moon run mobile:ios
moon run mobile:android
```

Start the mobile app against dev

```bash
EXPO_PUBLIC_ENV=dev moon run mobile:ios
```

How to open the Debugger (available only on local env)
Press 'm' in shell running the app to open the dev tools and select 'Debugger' from the menu items

Other commands

- `moon run mobile:relay-codegen` to run relay compiler
- `moon run mobile:typecheck` for checking type validity
- `moon run mobile:lint` for linting
- `moon run android-physical-device` for starting dev server and running it on physical device (make sure to scan QR code)
