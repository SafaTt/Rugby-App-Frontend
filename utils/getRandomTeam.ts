// utils/getRandomTeam.ts
import { teams  as allCompetitions } from "@/constants/JSON/Teams";

export type Team = {
  title: string;
  color: string;
  textColor: string;
};

/**
 * Retourne une équipe aléatoire différente de celle du joueur humain
 * @param excludedTeam - le nom de l’équipe choisie par le joueur 1
 * @param competitionTeams - tableau d’équipes de la compétition
 */
export function getRandomTeam(excludedTeam: string, competitionTitle: string) {
  // 🔹 trouver la compétition correspondante
  const competitionObj = allCompetitions.find(
    (c) => c.title === competitionTitle
  );

  if (!competitionObj) return null;

  // 🔹 filtrer l'équipe du joueur
  const availableTeams = competitionObj.teams.filter(
    (t) => t.title !== excludedTeam
  );

  if (availableTeams.length === 0) return null;

  // 🔹 choisir une équipe aléatoire
  const randomIndex = Math.floor(Math.random() * availableTeams.length);
  return availableTeams[randomIndex];
}