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
const MatchesHistory = () => {
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
    return <ActivityIndicator size="large" color="#4395ffff" />;
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
        <Text style={{ fontSize: 16, color: "#ccc" }}>Rank: {stats.rank}</Text>
      </View>

     
      {/* MATCH HISTORY */}
      <FlatList
        data={stats.matchHistory}
        keyExtractor={(item) => item.matchId}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        style={{ marginTop: height * 0.02 }}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 12,
              marginVertical: 6,
              backgroundColor: "rgba(176, 190, 197, 0.6)", // gris clair transparent
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "black", fontWeight: "600", fontSize: 16 }}>
              {item.teamName} vs {item.opponentTeamName}
            </Text>
            <Text
              style={{
                color:
                  item.result === "win"
                    ? "#4094f5ff"
                    : item.result === "loss"
                    ? "#dde9eeff"
                    : "#90A4AE",
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

export default MatchesHistory;
