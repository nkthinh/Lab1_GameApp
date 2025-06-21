import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import DetailScreen from "../screens/DetailScreen";
import FavoriteScreen from "../screens/FavoriteScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="Detail"
          component={DetailScreen}
          options={{ tabBarVisible: false }}
        />
        <Tab.Screen name="Favorites" component={FavoriteScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
