import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";
import logo from "../assets/logo.png";

export default function DetailScreen({ route, navigation }) {
  const { game } = route.params;
  const [updatedGame, setUpdatedGame] = useState(game);
  const [imageError, setImageError] = useState(false);

  const updateGame = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/Games/${updatedGame.id}`,
        updatedGame
      );
      const storedGames = await AsyncStorage.getItem("games");
      const games = JSON.parse(storedGames);
      const updatedGames = games.map((g) =>
        g.id === updatedGame.id ? response.data : g
      );
      await AsyncStorage.setItem("games", JSON.stringify(updatedGames));
      Alert.alert("Success", "Game updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating game:", error);
      Alert.alert("Error", "Failed to update game.");
    }
  };

  if (!game) {
    return (
      <View style={styles.container}>
        <Text>Game not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.splitContainer}>
        {/* Game Information Section */}
        <View style={styles.infoContainer}>
          <TextInput
            style={styles.input}
            value={updatedGame.title}
            onChangeText={(text) =>
              setUpdatedGame({ ...updatedGame, title: text })
            }
            placeholder="Game Title"
          />
          <TextInput
            style={styles.input}
            value={updatedGame.category}
            onChangeText={(text) =>
              setUpdatedGame({ ...updatedGame, category: text })
            }
            placeholder="Category"
          />
          <TextInput
            style={styles.input}
            value={String(updatedGame.price)}
            onChangeText={(text) =>
              setUpdatedGame({ ...updatedGame, price: text })
            }
            placeholder="Price"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={updatedGame.description}
            onChangeText={(text) =>
              setUpdatedGame({ ...updatedGame, description: text })
            }
            placeholder="Description"
            multiline
          />
          <Button title="Update Game" onPress={updateGame} />
        </View>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={
              imageError || !updatedGame?.image
                ? logo
                : { uri: updatedGame.image }
            }
            style={styles.gameImage}
            onError={() => setImageError(true)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  splitContainer: {
    flex: 1,
    flexDirection: "row",
  },
  infoContainer: {
    flex: 2,
    paddingRight: 10,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gameImage: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
  },
});
