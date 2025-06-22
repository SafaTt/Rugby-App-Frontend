import { General_Style } from "@/constants/General_Style";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
interface ScoreboardProps {
  step: any;
  competition: any;
  bgSelectedTeam: any;
  textSelectedTeamColor: any;
  teamSelected: any;
  scoreUserOne: any;
  scoreUserTwo: any;
  matchDuration: any;
  oppositionTeam: any;
  textOppositionTeamColor: any;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  step,
  competition,
  bgSelectedTeam,
  textSelectedTeamColor,
  teamSelected,
  scoreUserOne,
  scoreUserTwo,
  matchDuration,
  oppositionTeam,
  textOppositionTeamColor,
}) => {
  // Convertir matchDuration en secondes
  const getInitialSeconds = () => {
    if (matchDuration === "4 MINUTES") return 4 * 60;
    if (matchDuration === "6 MINUTES") return 6 * 60;
    if (matchDuration === "10 MINUTES") return 10 * 60;
    return 0;
  };

  const [secondsLeft, setSecondsLeft] = useState(getInitialSeconds());

  useEffect(() => {
    if (step === 6 && secondsLeft > 0) {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(interval); // cleanup à l'unmount ou changement
    }
  }, [step, secondsLeft]);

  // Formater mm:ss
  const formatTime = (secs: any) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (step !== 6) return null;

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View style={General_Style.viewBoard}>
        <Text style={General_Style.titleBoard}>SCOREBOARD</Text>
        <Text style={General_Style.teamBoard}>{competition}</Text>

        <View
          style={{
            flexDirection: "row",
            width: "90%",
            justifyContent: "space-between",
          }}
        >
          <View>
            <View
              style={{
                backgroundColor: bgSelectedTeam,
                padding: 10,
                marginVertical: 4,
                borderWidth: 1,
                borderColor: "#fff",
                marginLeft: 5,
              }}
            >
              <Text style={{ color: textSelectedTeamColor }}>
                {teamSelected}
              </Text>
            </View>
            <Text style={General_Style.textScore}>{scoreUserOne}</Text>
          </View>

          <View>
            <View
              style={{
                backgroundColor: textSelectedTeamColor,
                padding: 10,
                marginVertical: 4,
                borderWidth: 1,
                borderColor: "#fff",
                marginRight: 5,
              }}
            >
              <Text style={{ color: textOppositionTeamColor }}>
                {oppositionTeam}
              </Text>
            </View>
            <Text style={General_Style.textScore}>{scoreUserTwo}</Text>
          </View>
        </View>

        <View style={General_Style.viewDurationTop}>
          <Text>{formatTime(secondsLeft)}</Text>
        </View>
      </View>
    </View>
  );
};

export default Scoreboard;
