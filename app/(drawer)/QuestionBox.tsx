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
  const socket = getSocket();
  const lottieRef = useRef<LottieView>(null);
  const [isMatchFinished, setIsMatchFinished] = useState(false);

  // ✅ Gérer la réception de "match_finished" en priorité
  useEffect(() => {
    const handleMatchFinished = (data: any) => {
      console.log("✅ Match terminé reçu via socket");
      setIsMatchFinished(true);
      setQuestion(null); // Ne plus afficher la question
      setIsAnswered(true);

      // 🔁 Déclencher la fermeture ou la navigation
      setTimeout(() => {
        if (onMatchEnd) onMatchEnd();
      }, 3000);
    };

    socket.on("match_finished", handleMatchFinished);
    return () => socket.off("match_finished", handleMatchFinished);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setQuestion(null);
    }
  }, [isVisible]);

  useEffect(() => {
    if (socket && matchId && !isMatchFinished && isVisible) {
      socket.emit("request_current_question", { matchId });
    }
  }, [socket, matchId, isMatchFinished]);

  // 🎧 Réception de la question via socket
  useEffect(() => {
    const handleNextQuestion = (data: any) => {
      // console.log("📩 Question reçue via socket:", data);
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

    socket.on("next_question", handleNextQuestion);
    return () => {
      socket.off("next_question", handleNextQuestion);
    };
  }, []);

  const handleSelect = async (selectedKey: string) => {
    if (isAnswered || !question) return;
    setIsAnswered(true);

    const token = await AsyncStorage.getItem("token");
    if (!token) return Alert.alert("Erreur", "Token non trouvé !");

    try {
      await answerQuestion(matchId, {
        question: {
          text: question.text,
          options: question.options, // <-- ici on envoie l'objet complet des options
          correctOption: question.correctOption,
        },
        selectedOption: selectedKey,
      });

      // La prochaine question sera reçue via le socket `next_question`
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    }
  };

  if (!question) return null;
  if (isMatchFinished) return null;
  if (!isVisible) return null;

  return (
    <View
      style={{ padding: 16, alignItems: "center", justifyContent: "center" }}
    >
      {/* Question */}
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

      {/* Options */}
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
            disabled={isAnswered}
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#8e8b8b",
              borderRadius: 6,
              padding: 10,
              marginBottom: 10,
              width: "48%",
              opacity: isAnswered ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 16, textAlign: "center" }}>
              {`${key}: ${value}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer */}
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
