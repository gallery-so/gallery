import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function askForNotificationToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const existingPermissions = await Notifications.getPermissionsAsync();

  if (existingPermissions.status !== "granted") {
    const requestedPermissions = await Notifications.requestPermissionsAsync();

    if (requestedPermissions.status !== "granted") {
      // They still did not give us permission
      return null;
    }
  }

  const expoPushToken = await Notifications.getExpoPushTokenAsync();

  // On Android, you have to setup a notification channel.
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],

      // https://developer.android.com/reference/android/app/NotificationChannel#setLightColor(int)
      lightColor: "#FFF",
    });
  }

  return expoPushToken.data;
}

let hasAskedForToken = false;
export function NotificaitonsRegistrar() {
  useEffect(() => {
    // Make sure under no circumstance ever do we ask the user for access twice.
    if (hasAskedForToken) {
      return;
    }

    hasAskedForToken = true;

    askForNotificationToken()
      .then((token) => {
        if (!token) {
          return;
        }

        // TODO(Terence): Tell the backend about this token.
      })
      .catch(() => {
        // TODO(Terence): Report an error here
      });
  }, []);

  return null;
}
