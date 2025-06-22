import { PIUBLIC_URI } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const findFirstPendingMatch = async (
  competition: any,
  duration: any
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    console.log("Compétition envoyée :", competition, "Durée :", duration);

    const res = await axios.post(
      `${PIUBLIC_URI}/api/match/pending-first`,
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
      `${PIUBLIC_URI}/api/match/join/${matchId}`,
      { playerTwoTeam },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.log("Erreur lors de la jointure :", error.response?.data || error);
    return null;
  }
};
