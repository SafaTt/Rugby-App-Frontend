import { answerQuestion } from "@/services/matchService";
import { getSocket } from "@/utils/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, Text, TouchableOpacity, View } from "react-native";

const { height } = Dimensions.get("window");

interface Props {
  matchId: string;
}

const QuestionBox: React.FC<Props> = ({ matchId }) => {
  const [question, setQuestion] = useState<any>(null);
  const [timer, setTimer] = useState(10);
  const [isAnswered, setIsAnswered] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    if (socket && matchId) {
      socket.emit("request_current_question", { matchId });
    }
  }, []);

  // 🎧 Réception de la question via socket
  useEffect(() => {
    const handleNextQuestion = (data: any) => {
      console.log("📩 Question reçue via socket:", data);
      setQuestion({
        text: data.question.text,
        options: data.question.choices,
        correctOption: data.question.correctAnswer,
      });
      setIsAnswered(false);
    };

    socket.on("next_question", handleNextQuestion);
    return () => {
      socket.off("next_question", handleNextQuestion);
    };
  }, []);

  // ⏱ Gestion du timer
  useEffect(() => {
    if (!question || isAnswered) return;

    setTimer(10); // reset timer à chaque nouvelle question
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSelect("null"); // auto-réponse
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [question, isAnswered]);
  // 📤 Soumettre une réponse
  const handleSelect = async (selectedKey: string) => {
    if (isAnswered || !question) return;
    setIsAnswered(true);

    const token = await AsyncStorage.getItem("token");
    if (!token) return Alert.alert("Erreur", "Token non trouvé !");

    try {
      await answerQuestion(matchId, {
        question: {
          text: question.text,
          options: Object.keys(question.options),
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
          marginBottom: height * 0.3,
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
          bottom: height * 0.1,
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
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#d00000",
            bottom: height * 0.03,
          }}
        >
          {timer} s
        </Text>
      </View>
    </View>
  );
};

export default QuestionBox;
