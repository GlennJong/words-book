import { useEffect, useState } from "react";

export type TokenHook = {
  token: string | undefined;
  setToken: (value: string | undefined) => void;
};

function getTokenFromLocalStorage(): string | undefined {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get('token');
  if (value) {
    localStorage.setItem('token', value);
    return value;
  }
  return localStorage.getItem('token') || undefined;
}

export const useToken = (): TokenHook => {
  const [token, setToken] = useState<string | undefined>(getTokenFromLocalStorage());

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return {
    token,
    setToken,
  };
};