import { General_Style } from "@/constants/General_Style";
import { teams as teamsData } from "@/constants/JSON/Teams";
import {
  createMatch,
  findFirstPendingMatch,
  getMatchById,
  joinMatch,
} from "@/services/matchService";
import { initializeSocket } from "@/utils/socket";
import { Image, ImageBackground } from "expo-image";
import { useNavigation } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
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
  const [scoreUserOne, setScoreUserOne] = useState<null | number>(0);
  const [scoreUserTwo, setScoreUserTwo] = useState<null | number>(0);
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [createdMatchId, setCreatedMatchId] = useState(null);
  const [currentMatchId, setCurrentMatchId] = useState<any | null>();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Setup socket once + listeners update when relevant states change
  useEffect(() => {
    let socket: any;
    const setupSocket = async () => {
      socket = await initializeSocket();

      socket.on("connect", () => {
        console.log("✅ Connected to socket server");
      });

      socket.on("new_match_created", (data: any) => {
        const match = data.match;
        console.log("🎯 Nouveau match détecté :", match);

        // if (step === 6 && currentPlayer === 2) {
        //   console.log("🔍 Recherche manuelle de match...");
        //   fetchLatestWaitingMatch(); // on la crée maintenant
        // }
      });

      socket.on("match_joined", (data: any) => {
        // S'assurer que c'est bien le joueur 1 qui est concerné
        if (currentPlayer === 1 && data.match?.status === "in-progress") {
          console.log("🎉 Un joueur a rejoint le match !");

          setOppositionTeam(data.match.playerTwoTeam.title);
          setBgOppositionTeam(data.match.playerTwoTeam.color);
          setTextOppositionTeamColor(data.match.playerTwoTeam.textColor);

          setWaitingForPlayer(false);
          setCurrentMatchId(data.match._id);
          setStep(7);
        }
      });
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.off("new_match_created");
        socket.off("match_joined");
        socket.disconnect();
      }
    };
  }, [step, currentPlayer, competition, matchDuration, createdMatchId]);

  // Fonction qui essaye de rejoindre un match reçu via socket
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
      } else {
        setStep(1);
        setCurrentMatchId(null);
      }
    } catch (error) {
      console.error("Join match error:", error);
      Toast.show({
        type: "error",
        text1: "Unexpected error",
        text2: "Something went wrong while joining the match.",
      });
      setStep(1);
      setCurrentMatchId(null);
    }
  };

  // Fonction d'attente côté joueur 1 pour que le joueur 2 rejoigne (polling)
  const waitForSecondPlayer = async (matchId: string) => {
    setWaitingForPlayer(true);
    console.log("match id reçu", matchId);

    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(async () => {
        try {
          const match = await getMatchById(matchId);

          if (!match) {
            clearInterval(interval);
            Toast.show({
              type: "error",
              text1: "Match not found",
              text2: "The match could not be retrieved.",
            });
            setStep(1);
            setWaitingForPlayer(false);
            reject("Match not found");
            return;
          }

          if (match.status === "in-progress") {
            clearInterval(interval);
            setWaitingForPlayer(false);
            console.log("✅ Second player joined.");
            resolve(match);
            return;
          }

          if (match.status === "cancelled") {
            clearInterval(interval);
            Toast.show({
              type: "info",
              text1: "Match cancelled",
              text2: "No player joined. Match was automatically cancelled.",
            });
            setStep(1);
            setWaitingForPlayer(false);
            reject("Match cancelled");
            return;
          }

          attempts++;
          if (attempts >= 6) {
            clearInterval(interval);
            Toast.show({
              type: "info",
              text1: "No one joined",
              text2: "Timeout reached. Returning to home.",
            });
            setStep(1);
            setWaitingForPlayer(false);
            reject("Timeout reached");
            return;
          }
        } catch (error) {
          clearInterval(interval);
          Toast.show({
            type: "error",
            text1: "Error fetching match",
            text2: "Unable to retrieve match data.",
          });
          setStep(1);
          setWaitingForPlayer(false);
          reject(error);
        }
      }, 5000);
    });
  };

  // Création d'un match (joueur 1)
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
      setStep(7);
      try {
        await waitForSecondPlayer(result._id);
        setCurrentMatchId(result._id);
      } catch (error) {
        console.log("Match cancelled or no player joined:", error);
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Match creation failed",
        text2: "Unable to create match. Please try again.",
      });
      setStep(1);
      setWaitingForPlayer(false);
      setCurrentMatchId(null);
    }
  };

  const fetchLatestWaitingMatch = async () => {
    try {
      const latest = await findFirstPendingMatch(competition, matchDuration);
      if (latest) {
        console.log("✅ Match trouvé manuellement :", latest._id);
        tryJoinMatch(latest);
      } else {
        console.log("❌ Aucun match trouvé pour l'instant");
      }
    } catch (err) {
      console.log("Erreur lors de la recherche de match :", err);
    }
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
            <Scoreboard
              step={step}
              matchId={currentMatchId}
              scoreUserOne={scoreUserOne}
              scoreUserTwo={scoreUserTwo}
            />
          )}
        </View>
      )}
    </ImageBackground>
  );
};
export default Home;
