import { General_Style } from "@/constants/General_Style";
import {
  getUserDashboardStats,
  getUserStatByTeam,
} from "@/services/matchService";
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

interface TeamStats {
  title: string;
  color: string;
  textColor: string;
  played: number;
  won: number;
  lost: number;
  goldenPoint: number;
  winningPercentage: number;
}

const Profile = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [noMatches, setNoMatches] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const fetchStats = async () => {
      try {
        const dashboardData = await getUserDashboardStats();

        if (dashboardData.totalMatches === 0) {
          setNoMatches(true);
        } else {
          setNoMatches(false);
        }

        setStats(dashboardData);
      } catch (err) {
        console.error("Erreur getUserDashboardStats:", err);
        setStats(null);
        setNoMatches(true);
      }

      try {
        const teamData = await getUserStatByTeam();
        setTeamStats(teamData.teamStats || []);
      } catch (err) {
        console.error("Erreur get stat by team:", err);
        setTeamStats([]);
      }

      setLoading(false);
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
          <ActivityIndicator size="large" color="#4094f5ff" />
        </View>
      ) : noMatches ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
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
              marginTop: 15,
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
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "white",
                letterSpacing: 1.5,
              }}
            >
              {stats.pseudo}
            </Text>
            <Text style={{ fontSize: 16, color: "#ccc" }}>
              Rank: {stats.rank}
            </Text>
          </View>

          {/* PIE CHART */}
          {/* PIE CHART */}
          <View
            style={{
              alignItems: "center",
              marginTop: height * 0.05,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            {/* Pie Chart */}
            {/* <PieChart widthAndHeight={height * 0.25} series={series} /> */}

            {/* Stats Summary */}
            <View
              style={{
                marginTop: 15,
                backgroundColor: "rgba(176, 190, 197, 0.6)",
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 20,
                width: "90%",
              }}
            >
              {[
                {
                  label: "Played",
                  value: `${stats.totalMatches} games`,
                  color: "black",
                },
                {
                  label: "Won",
                  value: `${stats.totalWins} games`,
                  color: "#2489feff",
                },
                {
                  label: "Lost",
                  value: `${stats.totalLosses} games`,
                  color: "#dde9eeff",
                },
                {
                  label: "Winning percentage",
                  value:
                    stats.totalMatches > 0
                      ? `${Math.round(
                          (stats.totalWins / stats.totalMatches) * 100
                        )}%`
                      : "0%",
                  color: "black",
                },
              ].map((item, index, arr) => (
                <View key={index}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{ color: "#000", fontSize: 16, fontWeight: "500" }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{
                        color: item.color,
                        fontSize: 15,
                        fontWeight: "500",
                      }}
                    >
                      {item.value}
                    </Text>
                  </View>

                  {/* Ligne séparatrice sauf pour le dernier élément */}
                  {index < arr.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        marginVertical: 2,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Stats by Team */}
          <Text
            style={{
              marginTop: height * 0.04,
              color: "#dde9eeff",
              fontSize: 20,
              marginLeft: width * 0.08,
              fontWeight: "500",
            }}
          >
            📊 Stats by Team
          </Text>

          <FlatList
            data={teamStats}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
            style={{ marginTop: height * 0.01 }}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  padding: 12,
                  marginVertical: 6,
                  backgroundColor: `${item.color}90`,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    color: item.textColor,
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  {item.title} ({item.played} games)
                </Text>
                <Text style={{ color: item.textColor, fontWeight: "bold" }}>
                  {item.winningPercentage}%
                </Text>
              </View>
            )}
          />
        </>
      )}
    </ImageBackground>
  );
};

export default Profile;
