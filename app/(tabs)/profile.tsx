import { General_Style } from "@/constants/General_Style";
import { ImageBackground } from "expo-image";

const Profile = () => {
  return (
    <ImageBackground
      style={General_Style.container}
      source={require("../../assets/images/generals/1.png")}
    ></ImageBackground>
  );
};
export default Profile;
