export type CharacterType = "X" | "Y";

export interface UserProfile {
  name: string;
  birthday: string;
  character: CharacterType;
  onboardingCompleted: boolean;
}

