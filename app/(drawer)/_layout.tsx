import { Colors } from "@/constants/Colors";
import { General_Style } from "@/constants/General_Style";
import { AntDesign, SimpleLineIcons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Layout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerStyle: { backgroundColor: Colors.primary },
      }}
      drawerContent={(props) => {
        const currentIndex = props.state.index;
        const routes = props.state.routeNames;

        return (
          <DrawerContentScrollView {...props}>
            {/* Navigation */}
            <TouchableOpacity
              onPress={() => props.navigation.navigate("home")}
              style={[
                General_Style.menuItemBtn,
                currentIndex === routes.indexOf("home") && styles.activeItem,
              ]}
            >
              <AntDesign
                name="home"
                size={20}
                color="#fff"
                style={styles.icon}
              />
              <Text style={General_Style.menuItemText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => props.navigation.navigate("profile")}
              style={[
                General_Style.menuItemBtn,
                currentIndex === routes.indexOf("profile") && styles.activeItem,
              ]}
            >
              <AntDesign
                name="user"
                size={20}
                color="#fff"
                style={styles.icon}
              />
              <Text style={General_Style.menuItemText}>Profile</Text>
            </TouchableOpacity>

            {/* Logout */}
            <View style={styles.logoutContainer}>
              <View style={General_Style.viewLine} />
              <TouchableOpacity
                style={[General_Style.menuItemBtn, { top: 5 }]}
                onPress={() => router.push("../(login)/signIn")}
              >
                <SimpleLineIcons
                  name="logout"
                  size={20}
                  color="#fff"
                  style={styles.icon}
                />
                <Text style={General_Style.menuItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </DrawerContentScrollView>
        );
      }}
    >
      {/* Screens automatiquement détectés depuis le dossier (drawer)/ */}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  icon: {
    marginRight: 10,
  },
  activeItem: {
    backgroundColor: "rgba(228, 228, 228, 0.3)",
    borderRadius: 8,
  },
});
