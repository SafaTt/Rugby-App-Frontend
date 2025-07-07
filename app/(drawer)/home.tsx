import { General_Style } from "@/constants/General_Style";
import { teams as teamsData } from "@/constants/JSON/Teams";
import {
  createMatch,
  findFirstPendingMatch,
  joinMatch,
} from "@/services/matchService";
import { initializeSocket } from "@/utils/socket";
import { Image, ImageBackground } from "expo-image";
import { router, useNavigation } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import QuestionBox from "./QuestionBox";
import Scoreboard from "./scoreboard";

const { width, height } = Dimensions.get("window");
const Home = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const [competition, setCompetition] = useState<string | null>();
  const [matchDuration, setMatchDuration] = useState<string | null>();
  const [teamSelected, setTeamSelected] = useState<string | null>();
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [oppositionTeam, setOppositionTeam] = useState<string | null>();
  const [bgSelectedTeam, setBgSelectedTeam] = useState<string>();
  const [bgOppositionTeam, setBgOppositionTeam] = useState<string>();
  const [textSelectedTeamColor, setTextSelectedTeamColor] = useState<string>();
  const [textOppositionTeamColor, setTextOppositionTeamColor] =
    useState<string>();
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [createdMatchId, setCreatedMatchId] = useState(null);
  const [currentMatchId, setCurrentMatchId] = useState<any | null>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const timerRef = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(10);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let socket: any;

    const setupSocket = async () => {
      socket = await initializeSocket();
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Connected to socket server");

        if (currentPlayer === 1 && createdMatchId) {
          socket.emit("join_match_room", createdMatchId);
          console.log("👤 Joueur 1 rejoint sa propre room");
        }

        if (currentPlayer === 2 && currentMatchId) {
          socket.emit("join_match_room", currentMatchId);
          console.log("👤 Joueur 2 rejoint sa propre room");
        }
      });

      socket.on("new_match_created", (data: any) => {
        const match = data.match;
        if (
          currentPlayer === 2 &&
          match.competition === competition &&
          match.duration === matchDuration &&
          match.status === "waiting"
        ) {
          console.log("🎯 Nouveau match détecté par joueur 2");
          tryJoinMatch(match);
        }
      });

      socket.on("match_joined", (data: any) => {
        const match = data.match;
        if (currentPlayer === 1 && match._id === createdMatchId) {
          console.log("🎉 Joueur 2 a rejoint !");
          setWaitingForPlayer(false);
          setCurrentMatchId(match._id);
        }
      });

      socket.on("quiz_start", (data: any) => {
        console.log("🔥 Quiz starting!");
        setShowQuestion(true);
        setCurrentQuestionIndex(0);
        socket.emit("request_current_question", { matchId: data.matchId });
      });
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.off("new_match_created");
        socket.off("match_joined");
        socket.off("quiz_start");

        socket.disconnect();
      }
    };
  }, [currentPlayer, competition, matchDuration, createdMatchId]);

  // 🔁 Fonction pour joindre un match côté joueur 2
  const tryJoinMatch = async (match: any) => {
    try {
      setCurrentMatchId(match._id);

      const result = await joinMatch(match._id, {
        title: teamSelected!,
        color: bgSelectedTeam!,
        textColor: textSelectedTeamColor!,
      });

      if (result) {
        setOppositionTeam(result.playerOneTeam.title);
        setBgOppositionTeam(result.playerOneTeam.color);
        setTextOppositionTeamColor(result.playerOneTeam.textColor);
        setStep(7);
        socketRef.current?.emit("match_joined", { match });
      } else {
        resetToHome("Unable to join the match.");
      }
    } catch (error) {
      console.error("Join match error:", error);
      resetToHome("Something went wrong while joining the match.");
    }
  };

  // ✅ Créer un match côté joueur 1
  const handleCreateMatch = async () => {
    if (
      !competition ||
      !matchDuration ||
      !teamSelected ||
      !bgSelectedTeam ||
      !textSelectedTeamColor
    ) {
      Toast.show({
        type: "error",
        text1: "Missing data",
        text2: "Please select all required options before creating a match.",
      });
      return;
    }

    try {
      const result = await createMatch({
        competition,
        duration: matchDuration,
        playerOneTeam: {
          title: teamSelected,
          color: bgSelectedTeam,
          textColor: textSelectedTeamColor,
        },
      });

      if (result && result._id) {
        setCreatedMatchId(result._id);
        setCurrentMatchId(result._id);
        setWaitingForPlayer(true);
        setStep(7);

        socketRef.current?.emit("join_match_room", result._id);
      } else {
        resetToHome("Unable to create match.");
      }
    } catch (error) {
      resetToHome("Match creation failed.");
    }
  };

  // 🔍 Rechercher un match existant (joueur 2)
  const fetchLatestWaitingMatch = async () => {
    try {
      const latest = await findFirstPendingMatch(competition, matchDuration);
      if (latest) {
        console.log("✅ Match trouvé :", latest._id);
        tryJoinMatch(latest);
        socketRef.current?.emit("join_match_room", latest._id);
      } else {
        setStep(0);
        Toast.show({
          type: "info",
          text1: "Info",
          text2: "No pending matches right now!",
        });
        console.log("❌ Aucun match en attente");
      }
    } catch (err) {
      console.log("Erreur recherche match :", err);
    }
  };

  // 🔄 Fonction de reset en cas d'erreur
  const resetToHome = (message: string) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: message,
    });
    setStep(1);
    setCurrentMatchId(null);
    setWaitingForPlayer(false);
  };

  const handleMatchEnd = () => {
    setShowQuestion(false);
    setStep(0);
    setTimeout(() => {
      router.replace("/(drawer)/home");
    }, 100);
  };

  return (
    <ImageBackground
      style={General_Style.container}
      source={require("../../assets/images/generals/1.png")}
    >
      {step === 0 && (
        <>
          <Text style={General_Style.titleHome}>GAME{`\n`}ON</Text>
          <Image
            source={require("../../assets/images/generals/ball.png")}
            style={General_Style.imgBall}
          />
          <Text style={General_Style.subtitleHome}>QUIZ GAME</Text>
          <TouchableOpacity
            style={General_Style.clickBtn}
            onPress={() => setStep(1)}
          >
            <Text style={General_Style.clickText}>Click here to start</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 1 && (
        <>
          <Text
            style={[
              General_Style.titleHome,
              { fontSize: 30, letterSpacing: 2 },
            ]}
          >
            PLEASE SELECT{`\n`}THE NUMBER{`\n`}OF PLAYERS
          </Text>

          <TouchableOpacity
            style={General_Style.playerNbBtn}
            onPress={() => {
              setCurrentPlayer(1);
              setStep(2);
            }}
          >
            <Text style={General_Style.playerNbTxt}>
              1 PLAYER{`\n`}
              <Text style={{ fontWeight: "500", fontSize: 15 }}>
                {"(play against the app)"}
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[General_Style.playerNbBtn, { top: height * 0.23 }]}
            onPress={() => {
              setCurrentPlayer(2);
              setStep(2);
            }}
          >
            <Text style={General_Style.playerNbTxt}>
              2 PLAYERS{`\n`}
              <Text style={{ fontWeight: "500", fontSize: 15 }}>
                {"(PVP multiplayer)"}
              </Text>
            </Text>
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/generals/ball.png")}
            style={[General_Style.imgBall, { bottom: height * 0.08 }]}
          />
        </>
      )}

      {step === 2 && (
        <>
          <Text
            style={[
              General_Style.titleHome,
              { fontSize: 30, letterSpacing: 2 },
            ]}
          >
            SELECT YOUR{`\n`}COMPETITION
          </Text>

          <TouchableOpacity
            style={General_Style.playerNbBtn}
            onPress={() => {
              setCompetition("NRL");
              setStep(3);
            }}
          >
            <Text style={General_Style.playerNbTxt}>NRL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[General_Style.playerNbBtn, { top: height * 0.2 }]}
            onPress={() => {
              setCompetition("SUPER LEAGUE");
              setStep(3);
            }}
          >
            <Text style={General_Style.playerNbTxt}>SUPER LEAGUE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[General_Style.playerNbBtn, { top: height * 0.23 }]}
            onPress={() => {
              setCompetition("INTERNATIONAL");
              setStep(3);
            }}
          >
            <Text style={General_Style.playerNbTxt}>INTERNATIONAL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[General_Style.playerNbBtn, { top: height * 0.26 }]}
            onPress={() => {
              setCompetition("OTHER");
              setStep(3);
            }}
          >
            <Text style={General_Style.playerNbTxt}>OTHER</Text>
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/generals/ball.png")}
            style={[General_Style.imgBall, { bottom: height * 0.08 }]}
          />
        </>
      )}

      {step === 3 && (
        <>
          <Text
            style={[
              General_Style.titleHome,
              { fontSize: 30, letterSpacing: 2 },
            ]}
          >
            SELECT YOUR{`\n`}COMPETITION
          </Text>

          <TouchableOpacity
            style={General_Style.playerNbBtn}
            onPress={() => {
              setMatchDuration("4 MINUTES");
              setStep(4);
            }}
          >
            <Text style={General_Style.playerNbTxt}>4 MINUTES</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[General_Style.playerNbBtn, { top: height * 0.2 }]}
            onPress={() => {
              setMatchDuration("6 MINUTES");
              setStep(4);
            }}
          >
            <Text style={General_Style.playerNbTxt}>6 MINUTES</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[General_Style.playerNbBtn, { top: height * 0.23 }]}
            onPress={() => {
              setMatchDuration("10 MINUTES");
              setStep(4);
            }}
          >
            <Text style={General_Style.playerNbTxt}>10 MINUTES </Text>
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/generals/ball.png")}
            style={[General_Style.imgBall, { bottom: height * 0.08 }]}
          />
        </>
      )}

      {step === 4 && (
        <>
          <Text
            style={[
              General_Style.titleHome,
              { fontSize: 30, letterSpacing: 2, top: 40 },
            ]}
          >
            SELECT YOUR{`\n`}TEAM
          </Text>

          <View style={[General_Style.playerNbBtn, { top: 50 }]}>
            <Text style={General_Style.playerNbTxt}>
              {competition?.toUpperCase()}
            </Text>
          </View>

          {/* Récupération des teams selon la compétition */}
          {(() => {
            const selected = teamsData.find((t) => t.title === competition);
            if (!selected) return <Text>Pas d'équipes disponibles</Text>;

            const teamList = selected.teams;
            const leftTeams = teamList.slice(0, 8);
            const rightTeams = teamList.slice(8, 16);
            const bottomTeam = teamList[16]; // la 17ème

            return (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: 10,
                    justifyContent: "space-between",
                    top: 70,
                  }}
                >
                  {/* Colonne gauche */}
                  <View>
                    {leftTeams.map((team: any, index: any) => (
                      <TouchableOpacity
                        onPress={() => {
                          setTeamSelected(team.title);
                          setBgSelectedTeam(team.color);
                          setTextSelectedTeamColor(team.textColor);
                          setStep(5);
                        }}
                        key={index}
                        style={{
                          backgroundColor: team.color,
                          padding: 10,
                          marginVertical: 4,
                          borderWidth: 1,
                          borderColor: "#fff",
                        }}
                      >
                        <Text style={{ color: team.textColor }}>
                          {team.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Colonne droite */}
                  <View>
                    {rightTeams.map((team, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          backgroundColor: team.color,
                          padding: 10,
                          marginVertical: 4,
                          borderWidth: 1,
                          borderColor: "#fff",
                        }}
                        onPress={() => {
                          setTeamSelected(team.title);
                          setBgSelectedTeam(team.color);
                          setTextSelectedTeamColor(team.textColor);
                          setStep(5);
                        }}
                      >
                        <Text style={{ color: team.textColor }}>
                          {team.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Dernier team (en bas) */}
                {bottomTeam && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: bottomTeam.color,
                      padding: 12,
                      marginTop: 30,
                      alignSelf: "center",
                      borderWidth: 1,
                      borderColor: "#fff",
                      top: 60,
                    }}
                    onPress={() => {
                      setTeamSelected(bottomTeam.title);
                      setBgSelectedTeam(bottomTeam.color);
                      setTextSelectedTeamColor(bottomTeam.textColor);
                      setStep(5);
                    }}
                  >
                    <Text style={{ color: bottomTeam.textColor }}>
                      {bottomTeam.title}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            );
          })()}
        </>
      )}

      {step === 5 && (
        <>
          <Text
            style={[
              General_Style.titleHome,
              { fontSize: 30, letterSpacing: 2 },
            ]}
          >
            MULTIPLAYER MODE{"\n"}SELECT AN OPTION
          </Text>

          <TouchableOpacity
            style={General_Style.playerNbBtn}
            onPress={() => {
              setCurrentPlayer(1);
              setStep(7); // on va vers la création → puis match créé côté step 7
              handleCreateMatch(); // commence la création
            }}
          >
            <Text style={General_Style.playerNbTxt}>
              CREATE MATCH{"\n"}
              <Text style={{ fontWeight: "500", fontSize: 15 }}>
                (be the first player)
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[General_Style.playerNbBtn, { top: height * 0.23 }]}
            onPress={() => {
              setCurrentPlayer(2);
              setStep(6);
              fetchLatestWaitingMatch();
            }}
          >
            <Text style={General_Style.playerNbTxt}>
              JOIN MATCH{"\n"}
              <Text style={{ fontWeight: "500", fontSize: 15 }}>
                (find a pending match)
              </Text>
            </Text>
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/generals/ball.png")}
            style={[General_Style.imgBall, { bottom: height * 0.08 }]}
          />
        </>
      )}

      {/* Step 6: Interface choix (joueur 2) */}
      {step === 6 && currentPlayer === 2 && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <LottieView
            source={require("../../assets/lottie/loader.json")}
            autoPlay
            loop
            style={{ width: 180, height: 180 }}
          />
          <Text
            style={{
              color: "#ffffff",
              fontSize: 18,
              marginTop: 20,
              textAlign: "center",
              fontWeight: "500",
              lineHeight: 26,
            }}
          >
            Waiting for available match to be created...
          </Text>
          <Text
            style={{
              color: "#ccc",
              fontSize: 14,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            Please wait while we search for an available match to join.
          </Text>
        </View>
      )}

      {step === 7 && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          {waitingForPlayer ? (
            <View style={{ alignItems: "center" }}>
              <LottieView
                source={require("../../assets/lottie/loader.json")}
                autoPlay
                loop
                style={{ width: 180, height: 180 }}
              />
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 18,
                  marginTop: 20,
                  textAlign: "center",
                  fontWeight: "500",
                  lineHeight: 26,
                }}
              >
                Waiting for the second player to join your match...
              </Text>
            </View>
          ) : (
            <View>
              <Scoreboard
                step={step}
                matchId={currentMatchId}
                onMatchEnd={handleMatchEnd}
              />

              {showQuestion && (
                <QuestionBox
                  matchId={currentMatchId}
                  onMatchEnd={handleMatchEnd}
                  isVisible={showQuestion}
                />
              )}
            </View>
          )}
        </View>
      )}
    </ImageBackground>
  );
};
export default Home;
