import { useEffect, useState } from "react";

export type EndpointHook = {
  endpoint: string | undefined;
  setEndpoint: (value: string | undefined) => void;
};

function getEndpointFromLocalStorage(): string | undefined {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get('endpoint');
  if (value) {
    localStorage.setItem('endpoint', value);
    return value;
  }
  return localStorage.getItem('endpoint') || undefined;
}

export const useEndpoint = (): EndpointHook => {
  const [endpoint, setEndpoint] = useState<string | undefined>(getEndpointFromLocalStorage());

  useEffect(() => {
    if (endpoint) {
      localStorage.setItem('endpoint', endpoint);
    } else {
      localStorage.removeItem('endpoint');
    }
  }, [endpoint]);

  return {
    endpoint,
    setEndpoint,
  };
};