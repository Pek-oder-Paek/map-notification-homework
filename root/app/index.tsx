import getDistance from "geolib/es/getPreciseDistance";
import { Alert, Linking, Text, View, Button } from "react-native";
import { useRouter } from "expo-router";
import React, { use, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";

export const COFC_EVENTS = [
  {
    id: 1,
    name: "Dog Therapy at Rivers Green",
    description: "Late night and high energy with breakfast food served.",
    latitude: 32.7837,
    longitude: -79.9394,
  },
  {
    id: 2,
    name: "Moonlight Breakfast at Liberty Dining Hall",
    description: "Relieve stress by petting certified therapy dogs",
    latitude: 32.7827,
    longitude: -79.9358,
  },
  {
    id: 3,
    name: "CofC Day at the Cistern Yard",
    description: "Community event with food trucks and live music.",
    latitude: 32.7838,
    longitude: -79.9373,
  },
];

export default function Index() {
  const router = useRouter();

  const [hasBeenNotified, setHasBeenNotified] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // immediately prompt user for notification perms when app
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Notifications Permission Denied",
          "Please allow notifications",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    })();
  }, []);

  // ask for location permissions through button
  const locationPermission = async () => {
    const locStatus = await Location.requestForegroundPermissionsAsync();

    if (locStatus.status !== "granted") {
      setErrorMsg("Foreground location permission is required.");
      Alert.alert("Location Permission Denied", "Please allow tracking", [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]);
      return;
    }

    // clear old error messages if any exist
    setErrorMsg(null);
    trackUser();
  };

  const trackUser = async () => {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
      },
      (newlocation) => {
        const userLat = newlocation.coords.latitude;
        const userLng = newlocation.coords.longitude;

        COFC_EVENTS.forEach(async (event) => {
          const eventLat = event.latitude;
          const eventLng = event.longitude;

          // Inside your Location.watchPositionAsync callback:
          const distanceToEvent = getDistance(
            { latitude: userLat, longitude: userLng },
            { latitude: eventLat, longitude: eventLng },
          );
          if (distanceToEvent <= 100 && !hasBeenNotified) {
            setHasBeenNotified(true);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            await Notifications.scheduleNotificationAsync({
              content: {
                title: event.name,
                body: event.description,
                data: { latitude: eventLat, longitude: eventLng },
              },
              trigger: null,
            });
          }
        });
      },
    );
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome to the College of Charleston!</Text>
      <Button
        title="Enable Location Permissions"
        onPress={locationPermission}
      />
      <View>
        <Button title="View Campus Map" onPress={() => router.push("/map")} />
      </View>
    </View>
  );
}
