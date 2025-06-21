import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FavoriteScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("favorites");
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };
    loadFavorites();
  }, []);

  const removeFavorite = async (game) => {
    const updatedFavorites = favorites.filter((fav) => fav.id !== game.id);
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favoriteItem}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Detail", { game: item })}
        style={styles.favoriteContent}
      >
        <Image source={{ uri: item.image }} style={styles.favoriteImage} />
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteTitle}>{item.title}</Text>
          <Text>Category: {item.category}</Text>
          <Text>Price: ${item.price}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeFavorite(item)}>
        <Text style={styles.removeIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>No favorite games yet!</Text>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  favoriteItem: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  favoriteContent: { flexDirection: "row", flex: 1 },
  favoriteImage: { width: 50, height: 50, marginRight: 10 },
  favoriteInfo: { flex: 1 },
  favoriteTitle: { fontSize: 16, fontWeight: "bold" },
  removeIcon: { fontSize: 20 },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16 },
});