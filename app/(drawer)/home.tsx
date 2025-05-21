import { General_Style } from "@/constants/General_Style";
import { Image, ImageBackground } from "expo-image";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity } from "react-native";

const { width, height } = Dimensions.get("window");
const Home = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  return (
    <ImageBackground
      style={General_Style.container}
      source={require("../../assets/images/generals/1.png")}
    >
      {step === 0 && (
        <>
          <Text style={General_Style.titleHome}>GAME{`\n`}ON</Text>
          <Image
            source={require("../../assets/images/generals/ball.png")}
            style={General_Style.imgBall}
          />
          <Text style={General_Style.subtitleHome}>QUIZ GAME</Text>
          <TouchableOpacity
            style={General_Style.clickBtn}
            onPress={() => setStep(1)}
          >
            <Text style={General_Style.clickText}>Click here to start</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 1 && (
        <>
          <Text
            style={[
              General_Style.titleHome,
              { fontSize: 30, letterSpacing: 2 },
            ]}
          >
            PLEASE SELECT{`\n`}THE NUMBER{`\n`}OF PLAYERS
          </Text>

          <TouchableOpacity
            style={General_Style.playerNbBtn}
            onPress={() => setStep(1)}
          >
            <Text style={General_Style.playerNbTxt}>
              1 PLAYER{`\n`}{" "}
              <Text style={{ fontWeight: "500", fontSize: 15 }}>
                {"(play against the app)"}
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[General_Style.playerNbBtn, { top: height * 0.23 }]}
            onPress={() => setStep(1)}
          >
            <Text style={General_Style.playerNbTxt}>
              2 PLAYERS{`\n`}{" "}
              <Text style={{ fontWeight: "500", fontSize: 15 }}>
                {"(PVP multiplayer)"}
              </Text>
            </Text>
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/generals/ball.png")}
            style={[General_Style.imgBall, { bottom: height * 0.08 }]}
          />
        </>
      )}
    </ImageBackground>
  );
};
export default Home;
