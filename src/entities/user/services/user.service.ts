import type { UserProfile, CharacterType } from "../types/user.types";

const USER_PROFILE_KEY = "grace_user_profile";

export const userService = {
  getUserProfile: (): UserProfile | null => {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data) as UserProfile;
    } catch {
      return null;
    }
  },

  saveUserProfile: (profile: UserProfile): void => {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  },

  determineCharacter: (birthday: string): CharacterType => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Temporarily always return X until Y character is ready
    return "X";
    
    // Future implementation:
    // return age <= 25 ? "Y" : "X";
  },

  hasCompletedOnboarding: (): boolean => {
    const profile = userService.getUserProfile();
    return profile?.onboardingCompleted ?? false;
  },

  clearUserProfile: (): void => {
    localStorage.removeItem(USER_PROFILE_KEY);
  },
};

