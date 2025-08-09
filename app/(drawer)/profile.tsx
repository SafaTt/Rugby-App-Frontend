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
        <Text style={{ fontSize: 16, color: "#ccc" }}>Rank: {stats.rank}</Text>
      </View>

      {/* PIE CHART */}
      <View
        style={{
          alignItems: "center",
          marginTop: height * 0.05,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        style={{ marginTop: height * 0.05 }}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 12,
              marginVertical: 6,
              backgroundColor: "rgba(176, 190, 197, 0.6)", // gris clair transparent
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5, // Android shadow
            }}
          >
            <Text style={{ color: "black", fontWeight: "600", fontSize: 16 }}>
              {item.teamName} vs {item.opponentTeamName}
            </Text>
            <Text
              style={{
                color:
                  item.result === "win"
                    ? "#69aefeff"
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

export default Profile;
