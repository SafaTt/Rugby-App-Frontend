import { PUBLIC_URI } from "@/utils/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const loginUser = async (emailOrPseudo: string, password: string) => {
  try {
    const response = await axios.post(`${PUBLIC_URI}/api/auth/login`, {
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
    const response = await axios.post(`${PUBLIC_URI}/api/auth/generatePseudo`);
    if (response) {
      return response.data.pseudo;
    } else {
      console.warn("Erreur lors de la génération du pseudo");
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
  }
};

export const signupUser = async (
  email: string,
  pseudo: string,
  password: string
) => {
  try {
    const response = await axios.post(`${PUBLIC_URI}/api/auth/register`, {
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
    const response = await axios.post(
      `${PUBLIC_URI}/api/auth/forgot-password`,
      {
        email,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Server error");
    }
  }
};

export const verifyRestCode = async (email: string, code: any) => {
  try {
    const response = await axios.post(`${PUBLIC_URI}/api/auth/verify-code`, {
      email,
      code,
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

export const resetPasswordRequest = async (
  email: string,
  code: string,
  newPassword: string
) => {
  try {
    const response = await axios.post(`${PUBLIC_URI}/api/auth/reset-password`, {
      email,
      code,
      newPassword,
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

export const getUserId = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const res = await axios.get(`${PUBLIC_URI}/api/auth/user-data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.log("Erreur récupération user:", error);
    return null;
  }
};
