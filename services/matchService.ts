import { PUBLIC_URI } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";

export const findFirstPendingMatch = async (
  competition: any,
  duration: any
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    console.log("Compétition envoyée :", competition, "Durée :", duration);

    const res = await axios.post(
      `${PUBLIC_URI}/api/match/pending-first`,
      { competition, duration },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.log("❌ Erreur axios :", error.message);
    if (error.response) {
      console.log("❗ Réponse serveur :", error.response.data);
    } else if (error.request) {
      console.log("❗ Aucune réponse reçue :", error.request);
    } else {
      console.log("❗ Erreur inconnue :", error);
    }

    return null;
  }
};

export const joinMatch = async (matchId: any, playerTwoTeam: any) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.put(
      `${PUBLIC_URI}/api/match/join/${matchId}`,
      { playerTwoTeam },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    const message = error.response?.data?.message;

    if (message) {
      if (message.includes("same team")) {
        Toast.show({
          type: "error",
          text1: "Team already chosen",
          text2: "You cannot select the same team as Player One.",
        });
      } else if (message.includes("already full")) {
        Toast.show({
          type: "error",
          text1: "Match Full",
          text2: "This match is already full. Try another one.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Join failed",
          text2: message,
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Server Error",
        text2: "Something went wrong. Please try again.",
      });
    }

    return null;
  }
};

export const createMatch = async ({
  competition,
  duration,
  playerOneTeam,
  playerTwoTeam, // optionnel
  isAgainstAI = false,
}: {
  competition: string;
  duration: string;
  playerOneTeam: {
    title: string;
    color: string;
    textColor: string;
  };
  playerTwoTeam?: {
    title: string;
    color: string;
    textColor: string;
    isAI?: boolean; // optionnel, frontend seulement
  };
  isAgainstAI?: boolean;
}) => {
  try {
    const token = await AsyncStorage.getItem("token");

    // Construire le payload selon la logique backend :
    // On envoie playerTwoTeam si isAgainstAI === true
    // OU si playerTwoTeam est défini (match humain avec joueur 2)
    const payload: any = {
      competition,
      duration,
      playerOneTeam,
    };

    if (isAgainstAI) {
      payload.isAgainstAI = true;
      payload.playerTwoTeam = playerTwoTeam;
    } else if (playerTwoTeam) {
      // match humain avec playerTwoTeam déjà défini (match qui démarre)
      payload.playerTwoTeam = playerTwoTeam;
    }
    // Sinon on n’envoie pas playerTwoTeam ni isAgainstAI, backend met status waiting

    const res = await axios.post(`${PUBLIC_URI}/api/match/create`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error: any) {
    console.log(
      "❌ Error while creating match:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const getMatchById = async (matchId: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.get(`${PUBLIC_URI}/api/match/getMatch/${matchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.log("Erreur récupération match:", error);
    return null;
  }
};

export const answerQuestion = async (
  id: string,
  questionData: {
    question: {
      text: string;
      options: string[] | Record<string, string>;
      correctOption: string;
      isConversion: Boolean;
    };
    selectedOption: string;
  }
) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.put(
      `${PUBLIC_URI}/api/match/${id}/question`,
      questionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur lors de l'envoi de la réponse"
    );
  }
};

export const fetchMatchScores = async (matchId: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Token introuvable");

    const response = await axios.get(
      `${PUBLIC_URI}/api/match/calcul-score/${matchId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // { scoreUserOne, scoreUserTwo }
  } catch (error: any) {
    console.error("Erreur fetchMatchScores:", error);
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des scores"
    );
  }
};

export const getQuizQuestions = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(`${PUBLIC_URI}/api/match/quiz`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // tableau des questions
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des questions"
    );
  }
};

export const getNextQuestion = async (id: string) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${PUBLIC_URI}/api/match/${id}/next-question`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const markMatchAsFinished = async (matchId: any) => {
  try {
    await axios.patch(`${PUBLIC_URI}/api/match/${matchId}/finish`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Erreur lors de la récupération des questions"
    );
  }
};
export const cancelMatchApiCall = async (matchId: any) => {
  try {
    const response = await fetch(`${PUBLIC_URI}/api/match/cancel/${matchId}`, {
      method: "PATCH",
    });
    if (!response.ok) {
      throw new Error("Failed to cancel match");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
