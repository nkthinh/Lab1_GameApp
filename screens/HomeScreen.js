import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

export default function HomeScreen({ navigation }) {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [newGame, setNewGame] = useState({
    title: "",
    category: "",
    price: "",
    image: "",
    description: "",
  });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedGames = await AsyncStorage.getItem("games");
        const storedCategories = await AsyncStorage.getItem("categories");
        const storedFavorites = await AsyncStorage.getItem("favorites");

        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        } else {
          await AsyncStorage.setItem("favorites", JSON.stringify([]));
        }

        if (storedGames && storedCategories) {
          setGames(JSON.parse(storedGames));
          setFilteredGames(JSON.parse(storedGames));
          setCategories(JSON.parse(storedCategories));
          return;
        }

        const gamesResponse = await axios.get(`${API_BASE_URL}/Games`);
        setGames(gamesResponse.data);
        setFilteredGames(gamesResponse.data);
        await AsyncStorage.setItem("games", JSON.stringify(gamesResponse.data));

        const categoriesResponse = await axios.get(
          `${API_BASE_URL}/Categories`
        );
        setCategories(categoriesResponse.data);
        await AsyncStorage.setItem(
          "categories",
          JSON.stringify(categoriesResponse.data)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === "") {
      setFilteredGames(games);
    } else {
      setFilteredGames(games.filter((game) => game.category === category));
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = games.filter((game) =>
      game.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGames(filtered);
  };

  const toggleFavorite = async (game) => {
    let updatedFavorites;
    if (favorites.some((fav) => fav.id === game.id)) {
      updatedFavorites = favorites.filter((fav) => fav.id !== game.id);
    } else {
      updatedFavorites = [...favorites, game];
    }
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const addGame = async () => {
    try {
      if (
        !newGame.title ||
        !newGame.category ||
        !newGame.price ||
        !newGame.image
      ) {
        Alert.alert("Error", "Please fill in all required fields.");
        return;
      }
      if (isNaN(parseFloat(newGame.price))) {
        Alert.alert("Error", "Price must be a valid number.");
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/Games`, {
        ...newGame,
        price: parseFloat(newGame.price),
      });
      const updatedGames = [...games, response.data];
      setGames(updatedGames);
      setFilteredGames(updatedGames);
      await AsyncStorage.setItem("games", JSON.stringify(updatedGames));
      setNewGame({
        title: "",
        category: "",
        price: "",
        image: "",
        description: "",
      }); // Reset form
      setModalVisible(false); // Close modal
      Alert.alert("Success", "Game added successfully!");
    } catch (error) {
      console.error("Error adding game:", error);
      Alert.alert("Error", "Failed to add game.");
    }
  };

  const deleteGame = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/Games/${id}`);
      const updatedGames = games.filter((game) => game.id !== id);
      const updatedFavorites = favorites.filter((fav) => fav.id !== id);
      setGames(updatedGames);
      setFilteredGames(updatedGames);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem("games", JSON.stringify(updatedGames));
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      Alert.alert("Success", "Game deleted successfully!");
    } catch (error) {
      console.error("Error deleting game:", error);
      Alert.alert("Error", "Failed to delete game.");
    }
  };

  const renderGameItem = ({ item }) => (
    <View style={styles.gameItem}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Detail", { game: item })}
        style={styles.gameContent}
      >
        <Image source={{ uri: item.image }} style={styles.gameImage} />
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>{item.title}</Text>
          <Text>Category: {item.category}</Text>
          <Text>Price: ${item.price}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toggleFavorite(item)}>
        <Text style={styles.favoriteIcon}>
          {favorites.some((fav) => fav.id === item.id) ? "❤️" : "🤍"}
        </Text>
      </TouchableOpacity>
      <Button title="Delete" onPress={() => deleteGame(item.id)} color="red" />
    </View>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.name && styles.selectedCategoryButton,
      ]}
      onPress={() => filterByCategory(item.name)}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by game name..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <View style={styles.splitContainer}>
        {/* Categories Section */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === "" && styles.selectedCategoryButton,
            ]}
            onPress={() => filterByCategory("")}
          >
            <Text style={styles.categoryText}>All</Text>
          </TouchableOpacity>
          {Array.isArray(categories) && categories.length > 0 ? (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.categoryList}
            />
          ) : (
            <Text style={styles.noCategoriesText}>No categories available</Text>
          )}
        </View>
        {/* Games Section */}
        <View style={styles.gamesContainer}>
          <Text style={styles.sectionTitle}>Games</Text>
          <Button
            title="Add Game"
            onPress={() => setModalVisible(true)}
            color="#007AFF"
          />
          <FlatList
            data={filteredGames}
            renderItem={renderGameItem}
            keyExtractor={(item) => item.id}
            style={styles.gameList}
            ListEmptyComponent={<Text>No games found</Text>}
          />
        </View>
      </View>

      {/* Add Game Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Game</Text>
            <TextInput
              style={styles.input}
              placeholder="Game Title"
              value={newGame.title}
              onChangeText={(text) => setNewGame({ ...newGame, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={newGame.category}
              onChangeText={(text) =>
                setNewGame({ ...newGame, category: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={newGame.price}
              onChangeText={(text) => setNewGame({ ...newGame, price: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              value={newGame.image}
              onChangeText={(text) => setNewGame({ ...newGame, image: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newGame.description}
              onChangeText={(text) =>
                setNewGame({ ...newGame, description: text })
              }
              multiline
            />
            <Button title="Add Game" onPress={addGame} />
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  splitContainer: {
    flex: 1,
    flexDirection: "row",
  },
  categoriesContainer: {
    flex: 1,
    paddingRight: 5,
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  gamesContainer: {
    flex: 3, // Increased to 3 to give more space to games
    paddingLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  categoryList: {
    flex: 1,
  },
  categoryButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 5,
    alignItems: "center",
  },
  selectedCategoryButton: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    fontSize: 16,
    color: "#000",
  },
  noCategoriesText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  gameList: {
    flex: 1,
  },
  gameItem: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  gameContent: {
    flexDirection: "row",
    flex: 1,
  },
  gameImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  favoriteIcon: {
    fontSize: 20,
    marginHorizontal: 10,
  },
  addGameContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
