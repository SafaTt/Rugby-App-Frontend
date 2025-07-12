import { getUserId } from "@/services/authService";
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
}

const QuestionBox: React.FC<Props> = ({ matchId, onMatchEnd }) => {
  const [question, setQuestion] = useState<any>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [isConversion, setIsConversion] = useState(false);
  const [conversionPlayerId, setConversionPlayerId] = useState<string | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<null | {
    success: boolean;
    message: string;
  }>(null);

  const socket = getSocket();
  const lottieRef = useRef<LottieView>(null);

  // Utiliser un ref pour garder userId à jour dans les callbacks
  const userIdRef = useRef<string | null>(null);
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
      console.log("📥 Nouvelle question reçue :", data.question);

      if (isMatchFinished) return;
      setIsConversion(false);
      setQuestion({
        text: data.question.text,
        options: data.question.choices,
        correctOption: data.question.correctAnswer,
      });
      setIsAnswered(false);
      console.log(
        "✅ Nouvelle question reçue, isAnswered réinitialisé à false"
      );
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

      if (!data.playerId) {
        console.warn("⚠️ conversion_question reçu sans playerId !");
        return; // ignore cet event mal formé
      }

      setIsConversion(true);
      setConversionPlayerId(data.playerId);
      setQuestion({
        text: data.question.text,
        options: data.question.choices,
        correctOption: data.question.correctAnswer,
      });
      setIsAnswered(false);
      console.log(
        "✅ Question de conversion reçue, isAnswered réinitialisé à false"
      );
      setTimeout(() => {
        lottieRef.current?.reset();
        lottieRef.current?.play();
      }, 50);
    };

    const handleConversionResult = (data: any) => {
      console.log("🎯 Résultat de la conversion reçu :", data);

      if (data.playerId === userIdRef.current) {
        const message =
          typeof data.message === "string"
            ? data.message
            : data.success
            ? "CONVERSION SUCCESSFUL 🎉"
            : "CONVERSION UNSUCCESSFUL ❌";

        // Alert.alert("Conversion", message);
        setConversionResult(message);
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
  }, [socket, isMatchFinished]);

  useEffect(() => {
    if (socket && matchId && !isMatchFinished) {
      socket.emit("request_current_question", { matchId });
    }
  }, [socket, matchId, isMatchFinished]);

  const handleSelect = async (selectedKey: string) => {
    if (isAnswered || !question) {
      console.log("⛔ Blocked: Already answered or no question");
      return;
    }

    // Verrouillage immédiat AVANT async
    setIsAnswered(true);

    // Protéger contre mauvaises conversions
    if (
      isConversion &&
      `${conversionPlayerId}`.trim() !== `${userIdRef.current}`.trim()
    ) {
      console.log("⛔ Blocked: not the converting player");
      return;
    }

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Erreur", "Token non trouvé !");
      return;
    }

    try {
      socket.emit("answer_question", {
        matchId,
        userId: userIdRef.current,
        selectedOption: selectedKey,
      });

      console.log("✅ Réponse envoyée avec succès");
    } catch (err: any) {
      console.log("❌ Erreur dans answerQuestion:", err);
      Alert.alert("Erreur", err.message);
    }
  };

  console.log("🧪 DEBUG : isConversion=", isConversion);
  console.log("🧪 conversionPlayerId=", conversionPlayerId);
  console.log("🧪 userIdRef.current=", userIdRef.current);

  if (isMatchFinished || !question) return null;
  const isNotAllowedToAnswer =
    isAnswered ||
    (isConversion &&
      `${userIdRef.current}`.trim() !== `${conversionPlayerId}`.trim());
  console.log("🧪 isNotAllowedToAnswer =", isNotAllowedToAnswer);

  return (
    <View
      style={{ padding: 16, alignItems: "center", justifyContent: "center" }}
    >
      {isConversion && !conversionResult && (
        <View
          style={{
            marginBottom: height * 0.01,
            padding: 10,
            borderRadius: 8,
            width: "100%",
            right: 10,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#FFD700",
              textAlign: "center",
            }}
          >
            CONVERSION ATTEMPT ⚽️
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#e3b11a",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            ONLY THE TEAM SCORING CAN ATTEMPT TO ANSWER THE QUESTION
          </Text>
        </View>
      )}

      {conversionResult && (
        <View
          style={{
            marginBottom: height * 0.01,
            padding: 10,
            borderRadius: 8,
            width: "100%",
            right: 10,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#FFD700",
              textAlign: "center",
            }}
          >
            {conversionResult.message}
          </Text>
        </View>
      )}

      <View
        style={{
          backgroundColor: "rgba(228, 228, 228, 0.8)",
          borderWidth: 2,
          borderColor: "#8e8b8b",
          borderRadius: 10,
          padding: 16,
          marginBottom: height * 0.35,
          alignItems: "center",
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
    </View>
  );
};

export default QuestionBox;
