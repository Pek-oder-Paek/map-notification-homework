import { Alert, Button, StyleSheet, Text, View } from "react-native";
import MapView, {
  Circle,
  Marker,
  Callout,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { COFC_EVENTS } from "./index";

const CHARLESTON_LAT = 32.7929;
const CHARLESTON_LNG = -79.9413;

const map = () => {
  const mapRef = useRef<MapView>(null);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.lat && params.lng) {
      mapRef.current?.animateToRegion(
        {
          latitude: parseFloat(params.lat as string),
          longitude: parseFloat(params.lng as string),
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        },
        1000,
      );
    }
  }, [params]);

  const fitAll = () => {
    mapRef.current?.fitToCoordinates(
      COFC_EVENTS.map((event) => ({
        latitude: event.latitude,
        longitude: event.longitude,
      })),
      { edgePadding: { top: 45, right: 45, bottom: 45, left: 45 } },
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: CHARLESTON_LAT,
          longitude: CHARLESTON_LNG,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {COFC_EVENTS.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
          >
            <Callout
              tooltip={true}
              onPress={() => Alert.alert(event.name, event.description)}
            >
              <View style={styles.calloutContainer}>
                <Text style={{ fontWeight: "bold" }}>{event.name}</Text>
                <Text>{event.description}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.fitAllButton}>
        <Button title="Fit All Events" onPress={fitAll} />
      </View>
    </View>
  );
};

export default map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    width: 200,
    padding: 10,
  },
  fitAllButton: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
  },
});
