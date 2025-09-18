import { useState } from "react";

export type AsIdHook = {
  asId: string | undefined;
  setAsId: (value: string | undefined) => void;
};

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? undefined;
}


function getAsIdFromUrlOrCookie(): string | undefined {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get('as_id');
  if (value) {
    document.cookie = `as_id=${value}; path=/; max-age=31536000;`;
    return value;
  }
  return getCookie('as_id');
}

export const useAsId = (): AsIdHook => {
  const [asId, setAsId] = useState<string | undefined>(getAsIdFromUrlOrCookie());
  
  return {
    asId,
    setAsId
  };
};