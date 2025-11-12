import { createContext, useContext, useState } from "react";

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const [profileData, setProfileData] = useState({
    displayName: '',
    units: 'imperial',
    height: '',
    weight: '',
    avatarUrl: '',
  });

  return (
    <OnboardingContext.Provider value={{ profileData, setProfileData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);