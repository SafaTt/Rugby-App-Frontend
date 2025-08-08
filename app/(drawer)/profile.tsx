import { General_Style } from "@/constants/General_Style";
import { getUserDashboardStats } from "@/services/matchService";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  View,
} from "react-native";

import PieChart from "react-native-pie-chart";

const { height, width } = Dimensions.get("window");

interface Team {
  title: string;
  color: string;
  textColor: string;
}

interface MatchHistory {
  matchId: string;
  date: string;
  teamName: string;
  teamColor: string;
  teamTextColor: string;
  opponentTeamName: string;
  opponentId: string | null;
  opponentTeamColor: string;
  opponentTeamTextColor: string;
  result: "win" | "loss" | "draw";
  userScore: number;
  opponentScore: number;
}

export interface UserDashboardStats {
  pseudo: string;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  bestScore: number;
  teams: Team[];
  rank: number;
  matchHistory: MatchHistory[];
}

const Profile = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const widthAndHeight = 200;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const fetchStats = async () => {
      try {
        const data = await getUserDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Erreur récupération stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigation]);

  if (loading) {
    return (
      <View
        style={[
          General_Style.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#18E68E" />
      </View>
    );
  }

  if (!stats || !Array.isArray(stats.teams)) {
    return <Text>Chargement...</Text>;
  }

  // Données pour le PieChart
  const series = [
    { value: stats.totalWins ?? 0, color: "#4A90E2" },
    { value: stats.totalLosses ?? 0, color: "#B0BEC5" },
  ];

  return (
    <ImageBackground
      style={General_Style.container}
      source={require("../../assets/images/generals/1.png")}
    >
      {/* HEADER */}
      <View style={{ alignItems: "center", marginTop: height * 0.08 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
          {stats.pseudo}
        </Text>
        <Text style={{ fontSize: 16, color: "#ccc" }}>Rang : {stats.rank}</Text>
      </View>

      {/* PIE CHART */}
      <View
        style={{
          alignItems: "center",
          marginTop: height * 0.05,
        }}
      >
        <PieChart widthAndHeight={height * 0.25} series={series} />

        <View
          style={{
            flexDirection: "row",
            marginTop: 10,
            justifyContent: "space-around",
            width: 200,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 16,
                height: 16,
                backgroundColor: "#4A90E2",
                marginRight: 6,
                borderRadius: 4,
              }}
            />
            <Text style={{ color: "white" }}>{stats.totalWins} Wins</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 16,
                height: 16,
                backgroundColor: "#B0BEC5",
                marginRight: 6,
                borderRadius: 4,
              }}
            />
            <Text style={{ color: "white" }}>{stats.totalLosses} Losses</Text>
          </View>
        </View>
      </View>

      {/* MATCH HISTORY */}
      <FlatList
        data={stats.matchHistory}
        keyExtractor={(item) => item.matchId}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 10,
              borderBottomWidth: 1,
              borderColor: "#455A64", // gris foncé bleuté (plus doux que #333)
            }}
          >
            <Text style={{ color: "white" }}>
              {item.teamName} vs {item.opponentTeamName}
            </Text>
            <Text
              style={{
                color:
                  item.result === "win"
                    ? "#4A90E2" // bleu clair comme le pie chart (Wins)
                    : item.result === "loss"
                    ? "#B0BEC5" // gris clair comme le pie chart (Losses)
                    : "#90A4AE", // gris moyen pour draw (neutre)
                fontWeight: "bold",
              }}
            >
              {item.result === "win"
                ? "WIN"
                : item.result === "loss"
                ? "LOSS"
                : "DRAW"}
            </Text>
          </View>
        )}
      />
    </ImageBackground>
  );
};

export default Profile;
