import { General_Style } from "@/constants/General_Style";
import { teams as teamsData } from "@/constants/JSON/Teams";
import { findFirstPendingMatch, joinMatch } from "@/services/matchService";
import { Image, ImageBackground } from "expo-image";
import { useNavigation } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import waitLottie from "../../assets/lottie/loader.json";
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

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // 🧠 Dans le corps du composant (au début ou sous les useState)
  useEffect(() => {
    if (step === 5 && currentPlayer === 2) {
      const tryJoinMatch = async () => {
        const pendingMatch = await findFirstPendingMatch(
          competition,
          matchDuration
        );

        if (pendingMatch) {
          const result = await joinMatch(pendingMatch._id, {
            title: teamSelected,
            color: bgSelectedTeam,
            textColor: textSelectedTeamColor,
          });

          if (result) {
            setOppositionTeam(result.playerOneTeam.title);
            setBgOppositionTeam(result.playerOneTeam.color);
            setTextOppositionTeamColor(result.playerOneTeam.textColor);
            setStep(6);
          } else {
            setStep(1); // Revenir à l'accueil si la jointure échoue
          }
        } else {
          Toast.show({
            type: "info",
            text1: "No matches available",
            text2: "No pending matches found. Please try again later.",
          });
          setStep(1); // Revenir à l'étape initiale
        }
      };

      tryJoinMatch();
    }
  }, [step, currentPlayer]);

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

      {step === 5 &&
        (currentPlayer === 1 ? (
          // Joueur 1 (IA) - choisir manuellement l’équipe adverse
          <View>
            <Text
              style={[
                General_Style.titleHome,
                { fontSize: 30, letterSpacing: 2, top: 40 },
              ]}
            >
              SELECT YOUR{`\n`}OPPOSITION
            </Text>

            <View style={[General_Style.playerNbBtn, { top: 50 }]}>
              <Text style={General_Style.playerNbTxt}>
                {competition?.toUpperCase()}
              </Text>
            </View>

            {/* Récupération des équipes selon la compétition */}
            {(() => {
              const selected = teamsData.find((t) => t.title === competition);
              if (!selected) return <Text>Pas d'équipes disponibles</Text>;

              const teamList = selected.teams;
              const leftTeams = teamList.slice(0, 8);
              const rightTeams = teamList.slice(8, 16);
              const bottomTeam = teamList[16];

              const renderTeamButton = (team: any, index: any) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (team.title === teamSelected) {
                      alert(
                        "Team already chosen. Please select a different one."
                      );
                      return;
                    }
                    setOppositionTeam(team.title);
                    setBgOppositionTeam(team.color);
                    setTextOppositionTeamColor(team.textColor);
                    setStep(6);
                  }}
                  style={{
                    backgroundColor: team.color,
                    padding: 10,
                    marginVertical: 4,
                    borderWidth: 1,
                    borderColor: "#fff",
                  }}
                >
                  <Text style={{ color: team.textColor }}>{team.title}</Text>
                </TouchableOpacity>
              );

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
                    <View>{leftTeams.map(renderTeamButton)}</View>
                    <View>{rightTeams.map(renderTeamButton)}</View>
                  </View>

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
                        if (bottomTeam.title === teamSelected) {
                          alert(
                            "Team already chosen. Please select a different one."
                          );
                          return;
                        }
                        setOppositionTeam(bottomTeam.title);
                        setBgOppositionTeam(bottomTeam.color);
                        setTextOppositionTeamColor(bottomTeam.textColor);
                        setStep(6);
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
          </View>
        ) : (
          // Joueur 2 - on cherche un match existant
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <LottieView
              source={waitLottie}
              autoPlay
              loop
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ color: "#fff", fontSize: 18, marginTop: 20 }}>
              Finding the second player...
            </Text>
          </View>
        ))}

      {step === 6 && (
        <View style={{ flex: 1, alignItems: "center" }}>
          <Scoreboard
            step={step}
            competition={competition}
            bgSelectedTeam={bgSelectedTeam}
            textSelectedTeamColor={textSelectedTeamColor}
            teamSelected={teamSelected}
            scoreUserOne={scoreUserOne}
            scoreUserTwo={scoreUserTwo}
            matchDuration={matchDuration}
            oppositionTeam={oppositionTeam}
            textOppositionTeamColor={textOppositionTeamColor}
          />
        </View>
      )}
    </ImageBackground>
  );
};
export default Home;
