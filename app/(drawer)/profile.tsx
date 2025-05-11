import { General_Style } from "@/constants/General_Style";
import { useNavigation } from "@react-navigation/native";
import { ImageBackground } from "expo-image";
import { useEffect } from "react";

const Profile = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <ImageBackground
      style={General_Style.container}
      source={require("../../assets/images/generals/1.png")}
    ></ImageBackground>
  );
};
export default Profile;
