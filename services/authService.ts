import { PIUBLIC_URI } from "@/utils/config";
import axios from "axios";

export const loginUser = async (emailOrPseudo: string, password: string) => {
  try {
    const response = await axios.post(`${PIUBLIC_URI}/api/auth/login`, {
      emailOrPseudo,
      password,
    });

    return response.data; // contient { token, user }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Server error");
    }
  }
};

export const fetchNewPseudo = async () => {
  try {
    const response = await axios.post(`${PIUBLIC_URI}/api/auth/generatePseudo`);
    if (response) {
      console.log(response.data);
      return response.data.pseudo;
    } else {
      console.warn("Erreur lors de la génération du pseudo");
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
  }
};

export const signupUser = async (email: string, pseudo: string, password: string) => {
  try {
    const response = await axios.post(`${PIUBLIC_URI}/api/auth/register`, {
      email,
      pseudo,
      password,
    });
    return response.data; 
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Server error");
    }
  }
};

export const forgotPasswordRequest = async (email: string) => {
  try {
    const response = await axios.post(`${PIUBLIC_URI}/api/auth/forgot-password`, {
      email,
    });
    return response.data; 
 } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Server error");
    }
  }
};
