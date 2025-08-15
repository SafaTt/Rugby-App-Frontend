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
  const [noMatches, setNoMatches] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const fetchStats = async () => {
      try {
        const data = await getUserDashboardStats();
        if (data.totalMatches === 0) {
          setNoMatches(true);
        } else {
          setNoMatches(false);
          setStats(data);
        }
      } catch (err: any) {
        console.error("Erreur récupération stats:", err);
        if (err.response?.status === 404) {
          setNoMatches(true);
          setStats(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigation, stats]);

  return (
    <ImageBackground
      style={General_Style.container}
      source={require("../../assets/images/generals/1.png")}
    >
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#4395ffff" />
        </View>
      ) : noMatches ? (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            marginTop: height * 0.2,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              textAlign: "center",
              letterSpacing: 1.5,
            }}
          >
            {stats?.pseudo}
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              textAlign: "center",
              marginTop: height * 0.015,
              lineHeight: 30,
              letterSpacing: 1.5,
            }}
          >
            No matches currently, please{"\n"}start one ! 🚀
          </Text>
        </View>
      ) : !stats || !Array.isArray(stats.teams) ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>
            Chargement...
          </Text>
        </View>
      ) : (
        <>
          {/* HEADER */}
          <View style={{ alignItems: "center", marginTop: height * 0.08 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
              {stats.pseudo}
            </Text>
            <Text style={{ fontSize: 16, color: "#ccc" }}>
              Rank: {stats.rank}
            </Text>
          </View>

          {/* MATCH HISTORY */}
          <FlatList
            data={stats.matchHistory}
            keyExtractor={(item) => item.matchId}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            style={{ marginTop: height * 0.02, marginBottom: height * 0.1 }}
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
                <Text
                  style={{ color: "black", fontWeight: "600", fontSize: 16 }}
                >
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
        </>
      )}
    </ImageBackground>
  );
};

export default MatchesHistory;
