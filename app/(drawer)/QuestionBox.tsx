import { getUserId } from "@/services/authService";
import { answerQuestion } from "@/services/matchService";
import { getSocket } from "@/utils/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Text, TouchableOpacity, View } from "react-native";
import timerAnimation from "../../assets/lottie/timer.json";

const { height } = Dimensions.get("window");

interface Props {
  matchId: string;
  onMatchEnd?: () => void;
  isVisible?: boolean;
}

const QuestionBox: React.FC<Props> = ({ matchId, onMatchEnd, isVisible }) => {
  const [question, setQuestion] = useState<any>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [isConversion, setIsConversion] = useState(false);
  const [conversionPlayerId, setConversionPlayerId] = useState<string | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);

  const socket = getSocket();
  const lottieRef = useRef<LottieView>(null);

  // Utiliser un ref pour garder userId à jour dans les callbacks
  const userIdRef = useRef<string | null>(null);

  // Récupérer userId depuis token
  // ...
  useEffect(() => {
    const fetchAndSetUserId = async () => {
      const id = await getUserId();
      setUserId(id);
      console.log("user iddd", id);

      userIdRef.current = id;
    };

    fetchAndSetUserId();
  }, []);
  // Mettre à jour le ref à chaque changement de userId
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    const handleMatchFinished = () => {
      setIsMatchFinished(true);
      setQuestion(null);
      setIsAnswered(true);
      setTimeout(() => {
        if (onMatchEnd) onMatchEnd();
      }, 5000);
    };

    const handleNextQuestion = (data: any) => {
      if (isMatchFinished || !isVisible) return;
      setIsConversion(false);
      setQuestion({
        text: data.question.text,
        options: data.question.choices,
        correctOption: data.question.correctAnswer,
      });
      setIsAnswered(false);
      setTimeout(() => {
        lottieRef.current?.reset();
        lottieRef.current?.play();
      }, 50);
    };

    const handleConversionQuestion = (data: any) => {
      console.log(
        "🎯 Conversion reçue pour :",
        data.playerId,
        " | Moi :",
        userIdRef.current
      );

      setIsConversion(true);
      setConversionPlayerId(data.playerId);
      setQuestion({
        text: data.question.text,
        options: data.question.choices,
        correctOption: data.question.correctAnswer,
      });
      setIsAnswered(false);
      setTimeout(() => {
        lottieRef.current?.reset();
        lottieRef.current?.play();
      }, 50);
    };

    const handleConversionResult = (data: any) => {
      if (data.playerId === userIdRef.current) {
        Alert.alert(
          "Conversion",
          data.success
            ? "CONVERSION SUCCESSFUL 🎉"
            : "CONVERSION UNSUCCESSFUL ❌"
        );
      }
    };

    socket.on("match_finished", handleMatchFinished);
    socket.on("next_question", handleNextQuestion);
    socket.on("conversion_question", handleConversionQuestion);
    socket.on("conversion_result", handleConversionResult);

    return () => {
      socket.off("match_finished", handleMatchFinished);
      socket.off("next_question", handleNextQuestion);
      socket.off("conversion_question", handleConversionQuestion);
      socket.off("conversion_result", handleConversionResult);
    };
  }, [socket, isVisible, isMatchFinished]);

  useEffect(() => {
    if (socket && matchId && !isMatchFinished && isVisible) {
      socket.emit("request_current_question", { matchId });
    }
  }, [socket, matchId, isMatchFinished, isVisible]);

  const handleSelect = async (selectedKey: string) => {
    if (isAnswered || !question) return;

    if (isConversion && conversionPlayerId !== userIdRef.current) return;

    setIsAnswered(true);
    const token = await AsyncStorage.getItem("token");
    if (!token) return Alert.alert("Erreur", "Token non trouvé !");

    try {
      await answerQuestion(matchId, {
        question: {
          text: question.text,
          options: question.options,
          correctOption: question.correctOption,
        },
        selectedOption: selectedKey,
      });
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    }
  };

  if (!isVisible || isMatchFinished || !question) return null;
  const isNotAllowedToAnswer =
    isAnswered || (isConversion && userIdRef.current !== conversionPlayerId);

  return (
    <View
      style={{ padding: 16, alignItems: "center", justifyContent: "center" }}
    >
      <View
        style={{
          backgroundColor: "rgba(228, 228, 228, 0.8)",
          borderWidth: 2,
          borderColor: "#8e8b8b",
          borderRadius: 10,
          padding: 16,
          marginBottom: height * 0.4,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 20, textAlign: "center" }}>
          {question.text}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "rgba(228, 228, 228, 0.8)",
          borderWidth: 2,
          borderColor: "#8e8b8b",
          borderRadius: 10,
          padding: 12,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          position: "absolute",
          bottom: height * 0.15,
        }}
      >
        {Object.entries(question.options).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            onPress={() => handleSelect(key)}
            disabled={isNotAllowedToAnswer}
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#8e8b8b",
              borderRadius: 6,
              padding: 10,
              marginBottom: 10,
              width: "48%",
              opacity: isNotAllowedToAnswer ? 0.6 : 1,
            }}
          >
            <Text
              style={{ fontSize: 16, textAlign: "center" }}
            >{`${key}: ${value}`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ alignItems: "center" }}>
        <LottieView
          ref={lottieRef}
          source={timerAnimation}
          autoPlay
          loop={false}
          duration={10000}
          style={{
            bottom: height * 0.03,
            width: 50,
            height: 50,
          }}
        />
      </View>

      {isConversion && conversionPlayerId === userIdRef.current && (
        <View
          style={{
            position: "absolute",
            top: height * 0.35,
            backgroundColor: "#fff",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: "green",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "green",
              textAlign: "center",
            }}
          >
            CONVERSION TIME ⚽️
          </Text>
        </View>
      )}
    </View>
  );
};

export default QuestionBox;
