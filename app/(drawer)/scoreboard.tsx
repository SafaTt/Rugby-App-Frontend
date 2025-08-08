import { General_Style } from "@/constants/General_Style";
import {
  fetchMatchScores,
  getMatchById,
  markMatchAsFinished,
} from "@/services/matchService";
import { getSocket } from "@/utils/socket";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");

interface ScoreboardProps {
  step: number;
  matchId: string;
  onMatchEnd?: () => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  step,
  matchId,
  onMatchEnd,
}) => {
  const [match, setMatch] = useState<any>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [scoreUserOne, setScoreUserOne] = useState<number>(0);
  const [scoreUserTwo, setScoreUserTwo] = useState<number>(0);
  const [matchFinished, setMatchFinished] = useState(false);
  const hasEmittedEnd = useRef(false);
  const [showMatchFinishedUI, setShowMatchFinishedUI] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasPassedHalfTime, setHasPassedHalfTime] = useState(false);
  const [hasGoldenPointLaunched, setHasGoldenPointLaunched] = useState(false);
  const [showGoldenPointBanner, setShowGoldenPointBanner] = useState(false);
  const [isGoldenPoint, setIsGoldenPoint] = useState(false);

  const socket = getSocket();

  useEffect(() => {
    const fetchMatch = async () => {
      const result = await getMatchById(matchId);
      if (result) {
        setMatch(result);
        setSecondsLeft(getInitialSeconds(result.duration));

        if (result.isFinished && !hasEmittedEnd.current) {
          hasEmittedEnd.current = true;
          setMatchFinished(true);
          socket.emit("end_match", { matchId });
        }
      }
    };

    if (matchId && step === 7) {
      fetchMatch();
    }
  }, [matchId, step]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scores = await fetchMatchScores(matchId);
        setScoreUserOne(scores.scoreUserOne);
        setScoreUserTwo(scores.scoreUserTwo);
      } catch (error) {
        console.error("Erreur récupération scores initiaux:", error);
      }
    };

    if (matchId && step === 7) {
      fetchScores();
    }
  }, [matchId, step]);

  // ✅ Mise à jour du score à chaque événement "score_updated"
  useEffect(() => {
    if (!socket) return;

    const handleScoreUpdate = (data: any) => {
      if (data.matchId === matchId) {
        setScoreUserOne(data.scoreUserOne);
        setScoreUserTwo(data.scoreUserTwo);
      }
    };

    const handleGoldenPoint = () => {
      console.log("🎯 Golden point signal reçu !");
      setIsGoldenPoint(true);

      setShowGoldenPointBanner(true);

      setTimeout(() => {
        setShowGoldenPointBanner(false);
      }, 4000);
    };

    const handleGoldenPointWinner = (data: any) => {
      console.log("✅ Victoire golden point reçue !", data);

      setScoreUserOne(data.scoreUserOne);
      setScoreUserTwo(data.scoreUserTwo);

      setMatchFinished(true);
    };

    socket.on("score_updated", handleScoreUpdate);
    socket.on("golden_point_started", handleGoldenPoint);
    socket.on("golden_point_winner", handleGoldenPointWinner);

    return () => {
      socket.off("score_updated", handleScoreUpdate);
      socket.off("golden_point_started", handleGoldenPoint);
      socket.off("golden_point_winner", handleGoldenPointWinner);
    };
  }, [socket, matchId]);

  const getInitialSeconds = (duration: string) => {
    if (duration === "4 MINUTES") return 0.3 * 60;
    if (duration === "6 MINUTES") return 6 * 60;
    if (duration === "10 MINUTES") return 10 * 60;
    return 0;
  };

  useEffect(() => {
    if (!socket) return;

    const handleHalfTime = () => {
      // Ce client ne fait rien s’il a déjà lancé le half-time
      if (hasPassedHalfTime) return;

      setHasPassedHalfTime(true);
      setIsPaused(true);

      // Affiche visuellement la pause si tu veux
      setTimeout(() => {
        setIsPaused(false);
      }, 3000);
    };

    socket.on("half_time", handleHalfTime);

    return () => {
      socket.off("half_time", handleHalfTime);
    };
  }, [socket, hasPassedHalfTime]);

  useEffect(() => {
    if (step === 7 && secondsLeft > 0) {
      const interval = setInterval(() => {
        if (!isPaused) {
          setSecondsLeft((prev) => {
            const newTime = prev > 0 ? prev - 1 : 0;

            const halfTimeMark = getInitialSeconds(match.duration) / 2;

            // ✅ Lancement du half-time local
            if (newTime === halfTimeMark && !hasPassedHalfTime) {
              setHasPassedHalfTime(true); // utilisé uniquement comme drapeau
              setIsPaused(true);

              // ✅ Notifie le serveur (tu es le seul à envoyer)
              socket.emit("half_time_triggered", { matchId });

              // ✅ Fin du half-time après 4 sec
              setTimeout(() => {
                setIsPaused(false);
              }, 2000);
            }

            // 🎯 Fin du match
            if (newTime === 0 && !hasEmittedEnd.current) {
              if (scoreUserOne === scoreUserTwo && !hasGoldenPointLaunched) {
                setHasGoldenPointLaunched(true);
                socket.emit("golden_point_trigger", { matchId });
              } else {
                hasEmittedEnd.current = true;
                setMatchFinished(true);
                socket.emit("end_match", { matchId });

                markMatchAsFinished(matchId).catch((err) => {
                  console.error("Erreur mise à jour match fini :", err);
                });
              }
            }

            return newTime;
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, secondsLeft, isPaused, match?.duration, hasPassedHalfTime]);

  useEffect(() => {
    if (matchFinished) {
      setShowMatchFinishedUI(true);
    }
  }, [matchFinished]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    if (matchFinished) {
      setShowMatchFinishedUI(true);
      setIsGoldenPoint(false); // pour restaurer le scoreboard si nécessaire dans un autre écran
    }
  }, [matchFinished]);

  useEffect(() => {
    // 🔁 Réinitialisation complète lorsque le match change
    setMatch(null);
    setSecondsLeft(0);
    setScoreUserOne(0);
    setScoreUserTwo(0);
    setMatchFinished(false);
    hasEmittedEnd.current = false;
    setShowMatchFinishedUI(false);
    setIsPaused(false);
    setHasPassedHalfTime(false);
    setHasGoldenPointLaunched(false);
    setShowGoldenPointBanner(false);
    setIsGoldenPoint(false);
  }, [matchId]);

  // ✅ Déplace la condition ici à la fin pour ne pas bloquer les effets
  if (step !== 7 || !match) return null;

  if (showMatchFinishedUI) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "transparent",
          paddingHorizontal: 16,
          zIndex: 10,
        }}
      >
        <View
          style={{
            backgroundColor: "#E0F7FA",
            padding: 24,
            borderRadius: 20,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.4,
            borderWidth: 4,
            borderColor: "#00BFFF",
            alignItems: "center",
            width: "100%",
          }}
        >
          <LottieView
            source={require("../../assets/lottie/fireworks.json")}
            autoPlay
            loop
            style={{ width: 200, height: 200, marginBottom: 20 }}
          />
          <Text
            style={{
              fontSize: 36,
              fontWeight: "bold",
              color: "#007AFF",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Well done, friends!
          </Text>
          <Text
            style={{
              fontSize: 22,
              marginBottom: 20,
              color: "#333",
              textAlign: "center",
            }}
          >
            The match is over!
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              width: "100%",
              marginBottom: 10,
              gap: 40,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, color: "#007AFF" }}>
                {match.playerOneTeam.title}
              </Text>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#007AFF",
                  marginTop: 4,
                }}
              >
                {scoreUserOne} 💙
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 20, color: "#00BFFF" }}>
                {match.playerTwoTeam.title}
              </Text>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#00BFFF",
                  marginTop: 4,
                }}
              >
                {scoreUserTwo} 💙
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 20,
              marginTop: 30,
              color: "#00796B",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Thank you for participating in the quiz!{"\n"}
            {"\n"}🎈
          </Text>
        </View>
      </View>
    );
  }

  {
    showGoldenPointBanner && (
      <View
        style={{
          position: "absolute",
          top: 20,
          backgroundColor: "#FFD700",
          padding: 10,
          borderRadius: 8,
          zIndex: 1000,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#000",
            textAlign: "center",
          }}
        >
          🟡 GOLDEN POINT! Égalité parfaite – prochaine bonne réponse = victoire
          ⚡
        </Text>
      </View>
    );
  }
  if (isGoldenPoint && !showMatchFinishedUI) return null;
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View style={General_Style.viewBoard}>
        <Text style={General_Style.titleBoard}>SCOREBOARD</Text>
        <Text style={General_Style.teamBoard}>{match.competition}</Text>

        <View
          style={{
            flexDirection: "row",
            width: "90%",
            justifyContent: "space-between",
          }}
        >
          {/* Player One */}
          <View>
            <View
              style={{
                backgroundColor: match.playerOneTeam.color,
                padding: 10,
                marginVertical: 4,
                borderWidth: 1,
                borderColor: "#fff",
                marginLeft: 5,
              }}
            >
              <Text style={{ color: match.playerOneTeam.textColor }}>
                {match.playerOneTeam.title}
              </Text>
            </View>
            <Text style={General_Style.textScore}>{scoreUserOne}</Text>
          </View>

          {/* Player Two */}
          {match.playerTwoTeam && (
            <View>
              <View
                style={{
                  backgroundColor: match.playerTwoTeam.color,
                  padding: 10,
                  marginVertical: 4,
                  borderWidth: 1,
                  borderColor: "#fff",
                  marginRight: 5,
                }}
              >
                <Text style={{ color: match.playerTwoTeam.textColor }}>
                  {match.playerTwoTeam.title}
                </Text>
              </View>
              <Text style={General_Style.textScore}>{scoreUserTwo}</Text>
            </View>
          )}
        </View>

        <View style={General_Style.viewDurationTop}>
          <Text>{formatTime(secondsLeft)}</Text>
        </View>
      </View>
    </View>
  );
};

export default Scoreboard;
