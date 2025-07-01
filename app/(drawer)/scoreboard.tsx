import { General_Style } from "@/constants/General_Style";
import { fetchMatchScores, getMatchById } from "@/services/matchService";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

interface ScoreboardProps {
  step: number;
  matchId: string;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ step, matchId }) => {
  const [match, setMatch] = useState<any>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Nouveaux états pour les scores
  const [scoreUserOne, setScoreUserOne] = useState<number>(0);
  const [scoreUserTwo, setScoreUserTwo] = useState<number>(0);

  useEffect(() => {
    const fetchMatch = async () => {
      const result = await getMatchById(matchId);
      if (result) {
        setMatch(result);
        setSecondsLeft(getInitialSeconds(result.duration));
      }
    };

    if (matchId && step === 7) {
      fetchMatch();
    }
  }, [matchId, step]);

  // Fetch scores dès que matchId et step === 7
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

  const getInitialSeconds = (duration: string) => {
    if (duration === "4 MINUTES") return 4 * 60;
    if (duration === "6 MINUTES") return 6 * 60;
    if (duration === "10 MINUTES") return 10 * 60;
    return 0;
  };

  useEffect(() => {
    if (step === 7 && secondsLeft > 0) {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, secondsLeft]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (step !== 7 || !match) return null;

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
