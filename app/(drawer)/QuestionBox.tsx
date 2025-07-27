import { General_Style } from "@/constants/General_Style";
import { getUserId } from "@/services/authService";
import { getSocket } from "@/utils/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
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
  const [userAnswer, setUserAnswer] = useState<{
    playerId: string;
    selectedOption: string;
    isCorrect: boolean;
  } | null>(null);
  const [correctAnswerMessage, setCorrectAnswerMessage] = useState<
    string | null
  >(null);
  const [showHalfTime, setShowHalfTime] = useState(false);

  const socket = getSocket();
  const lottieRef = useRef<LottieView>(null);

  // Utiliser un ref pour garder userId à jour dans les callbacks
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    const fetchAndSetUserId = async () => {
      const id = await getUserId();
      setUserId(id);

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
      if (isMatchFinished) return;
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
      if (!data.playerId) {
        console.warn("⚠️ conversion_question reçu sans playerId !");
        return;
      }

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
        const message =
          typeof data.message === "string"
            ? data.message
            : data.success
            ? "CONVERSION SUCCESSFUL 🎉"
            : "CONVERSION UNSUCCESSFUL ❌";

        setConversionResult({
          success: data.success,
          message,
        });
        setIsConversion(false);
      }
    };

    const handleAnswerQuestion = (data: any) => {
      if (data.playerId === userIdRef.current) {
        setUserAnswer({
          playerId: data.playerId,
          selectedOption: data.selectedOption,
          isCorrect: data.isCorrect,
        });
      }
    };

    const handlerAnswerMessage = (data: any) => {
      if (data?.playerId === userIdRef.current) {
        setCorrectAnswerMessage(data.message);
        setTimeout(() => setCorrectAnswerMessage(null), 2000);
      }
    };

    const handleHalfTime = () => {
      setShowHalfTime(true);

      setTimeout(() => {
        setShowHalfTime(false);
      }, 4000);
    };

    const handleAbandon = (data: any) => {
      if (data.matchId === matchId) {
        Toast.show({
          type: "info",
          text1: "Match over",
          text2: "A player left the match.",
        });

        if (onMatchEnd) onMatchEnd();
      }
    };

    socket.on("match_finished", handleMatchFinished);
    socket.on("next_question", handleNextQuestion);
    socket.on("conversion_question", handleConversionQuestion);
    socket.on("conversion_result", handleConversionResult);
    socket.on("answer_question", handleAnswerQuestion);
    socket.on("correct_answer_received", handlerAnswerMessage);
    socket.on("half_time", handleHalfTime);
    socket.on("match_finished_due_to_leave", handleAbandon);

    return () => {
      socket.off("match_finished", handleMatchFinished);
      socket.off("next_question", handleNextQuestion);
      socket.off("conversion_question", handleConversionQuestion);
      socket.off("conversion_result", handleConversionResult);
      socket.off("answer_question", handleAnswerQuestion);
      socket.off("correct_answer_received", handlerAnswerMessage);
      socket.off("half_time", handleHalfTime);
      socket.off("match_finished_due_to_leave", handleAbandon);
    };
  }, [socket, isMatchFinished, matchId]);

  useEffect(() => {
    setUserAnswer(null);
  }, [JSON.stringify(question)]);

  useEffect(() => {
    if (socket && matchId && !isMatchFinished) {
      socket.emit("request_current_question", { matchId });
    }
  }, [socket, matchId, isMatchFinished]);

  const handleSelect = async (selectedKey: string) => {
    if (isAnswered || !question) {
      return;
    }

    setIsAnswered(true);
    if (
      isConversion &&
      `${conversionPlayerId}`.trim() !== `${userIdRef.current}`.trim()
    ) {
      return;
    }

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Toast.show({
        type: "error",
        text1: "Token Error",
      });
      return;
    }

    try {
      socket.emit("answer_question", {
        matchId,
        userId: userIdRef.current,
        selectedOption: selectedKey,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: err.response?.data?.message || err.message || "Server error",
      });
    }
  };
  useEffect(() => {
    if (conversionResult) {
      // Réinitialiser après 2 secondes, ou autre délai
      const timeout = setTimeout(() => {
        setConversionResult(null);
        setIsConversion(false); // ✅ Clé du problème
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [conversionResult]);

  if (isMatchFinished || !question) return null;
  const isNotAllowedToAnswer =
    isAnswered ||
    (isConversion &&
      `${userIdRef.current}`.trim() !== `${conversionPlayerId}`.trim());

  return (
    <View
      style={{ padding: 16, alignItems: "center", justifyContent: "center" }}
    >
      {isConversion && (
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

      {correctAnswerMessage && (
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
              fontSize: 22,
              fontWeight: "bold",
              color: "#FFD700",
              textAlign: "center",
            }}
          >
            {correctAnswerMessage}
          </Text>
        </View>
      )}

      {showHalfTime && (
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
              fontSize: 22,
              fontWeight: "bold",
              color: "#FFD700",
              textAlign: "center",
            }}
          >
            Half-time !
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
        {Object.entries(question.options).map(([key, value]) => {
          const isSelected = userAnswer?.selectedOption === key;
          const isCorrect = userAnswer?.isCorrect;

          let backgroundColor = "#fff";
          if (isSelected) {
            backgroundColor = isCorrect
              ? "rgba(186, 247, 186, 0.7)"
              : "rgba(246, 151, 151, 0.6)";
          }

          return (
            <TouchableOpacity
              key={key}
              onPress={() => handleSelect(key)}
              disabled={isNotAllowedToAnswer}
              style={{
                backgroundColor,
                borderWidth: 2,
                borderColor: isSelected
                  ? isCorrect
                    ? "green"
                    : "red"
                  : "#8e8b8b",
                borderRadius: 6,
                padding: 10,
                marginBottom: 10,
                width: "48%",
                opacity: isNotAllowedToAnswer ? 0.6 : 1,
              }}
            >
              <Text style={{ fontSize: 16, textAlign: "center" }}>
                {`${key}: ${value}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            bottom: height * 0.04,
          }}
        >
          <TouchableOpacity
            style={{
              borderWidth: 1,
              backgroundColor: "rgba(22, 21, 21, 0.57)",
              borderColor: "#fff",
              padding: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              Alert.alert(
                "Confirmation",
                "Do you really want to leave the match?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Yes",
                    onPress: async () => {
                      const userId = await getUserId();
                      socket.emit("player_leave_match", { matchId, userId });
                    },
                  },
                ]
              );
            }}
          >
            <Text style={General_Style.clickText}>Leave the match</Text>
          </TouchableOpacity>
          <LottieView
            ref={lottieRef}
            source={timerAnimation}
            autoPlay
            loop={false}
            duration={10000}
            style={{
              // bottom: height * 0.03,
              width: 50,
              height: 50,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default QuestionBox;
