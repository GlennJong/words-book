import { useState } from "react";

export type OfflineHook = {
  isOffline: boolean;
  setIsOffline: (value: boolean) => void;
};

export const useOffline = (): OfflineHook => {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  
  return {
    isOffline,
    setIsOffline
  };
};