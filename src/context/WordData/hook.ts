import { getMockWordListData } from "@/mock";
import { WordData } from "@/pages/MainScreen/type";
import { postData } from "@/utils/fetch";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SEND_DEBOUNCE = 12 * 1000; // 12 seconds
const LOCAL_KEY = 'wordDataCache';

type useWordDataProps = {
  isDemo: boolean;
  isOffline: boolean;
  endpoint?: string;
  token?: string;
};

const buildUrl = (endpoint?: string, token?: string) => {
  if (!endpoint) return undefined;
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  params.set('t', Date.now().toString());
  return `${endpoint}?${params.toString()}`;
};

async function getWordData(endpoint?: string, token?: string) {
  try {
    const url = buildUrl(endpoint, token);
    if (!url || !token) return;
    const result = await postData<{ status: string; data: WordData[] }>(url, { subject: 'word', action: 'getList' });
    return result?.data;
  } catch (error) {
    console.error(error);
  }
}

async function postWordData(action: string, words: WordData[], endpoint?: string, token?: string) {
  try {
    const url = buildUrl(endpoint, token);
    if (!url || !token) return;
    await postData(url, { subject: 'word' ,action, data: words });
  } catch (error) {
    console.error(error);
  }
}

export const useWordData = ({ isDemo, isOffline, endpoint, token }: useWordDataProps) => {
  const [isLevelMode, setIsLevelMode] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const currentLevelRef = useRef(0);
  const [data, setData] = useState<WordData[]>([]);
  const [shuffledIndexes, setShuffledIndexes] = useState<number[]>([]);
  const pendingCreateRef = useRef<WordData[]>([]);
  const pendingUpdateRef = useRef<WordData[]>([]);
  const pendingRemoveRef = useRef<WordData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [isFetchError, setIsFetchError] = useState(false);
  const debounceTimer = useRef<number | null>(null);

  const isEnabled = useMemo(() => Boolean((endpoint && token) || isDemo), [endpoint, token, isDemo]);

  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  const shuffleIndexes = useCallback((length: number): number[] => {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const sendCreate = useCallback(
    async (words: WordData[]) => {
      if (isDemo || isOffline) return;
      if (isEnabled) await postWordData('create', words, endpoint, token);
    },
    [endpoint, isDemo, isEnabled, isOffline, token]
  );

  const sendUpdate = useCallback(
    async (words: WordData[]) => {
      if (isDemo || isOffline) return;
      if (isEnabled) await postWordData('update', words, endpoint, token);
    },
    [endpoint, isDemo, isEnabled, isOffline, token]
  );

  const sendRemove = useCallback(
    async (words: WordData[]) => {
      if (isDemo || isOffline) return;
      if (isEnabled) await postWordData('delete', words, endpoint, token);
    },
    [endpoint, isDemo, isEnabled, isOffline, token]
  );

  const submitPending = useCallback(async () => {
    setIsFetching(true);
    if (pendingCreateRef.current.length > 0) {
      await sendCreate(pendingCreateRef.current);
      pendingCreateRef.current = [];
    }
    if (pendingUpdateRef.current.length > 0) {
      await sendUpdate(pendingUpdateRef.current);
      pendingUpdateRef.current = [];
    }
    if (pendingRemoveRef.current.length > 0) {
      await sendRemove(pendingRemoveRef.current);
      pendingRemoveRef.current = [];
    }
    setIsFetching(false);
  }, [sendCreate, sendRemove, sendUpdate]);

  const triggerDebounce = useCallback(() => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = window.setTimeout(() => {
      if (
        pendingCreateRef.current.length > 0 ||
        pendingUpdateRef.current.length > 0 ||
        pendingRemoveRef.current.length > 0
      ) {
        void submitPending();
      }
    }, SEND_DEBOUNCE);
  }, [submitPending]);

  const get = useCallback(async () => {
    if (isOffline) return;
    setIsFetching(true);

    const wordList = isDemo
      ? await getMockWordListData(1000)
      : (await getWordData(endpoint, token)) ?? [];

    if (wordList.length > 0) {
      setData(wordList);
      setShuffledIndexes(shuffleIndexes(wordList.length));
      setIsFetched(true);
      setIsFetchError(false);
    } else {
      setIsFetchError(true);
    }

    setIsFetching(false);
  }, [endpoint, isDemo, isOffline, shuffleIndexes, token]);

  useEffect(() => {
    if (isOffline) {
      const cached = localStorage.getItem(LOCAL_KEY);
      if (cached) {
        const wordList = JSON.parse(cached) as WordData[];
        setData(wordList);
        setShuffledIndexes(shuffleIndexes(wordList.length));
        setIsFetched(true);
        setIsFetchError(false);
      } else {
        setIsFetchError(true);
      }
      return;
    }

    if (isEnabled) {
      void get();
    }
  }, [get, isEnabled, isOffline, shuffleIndexes]);

  useEffect(() => {
    if (!isFetched) return;
    const id = window.setTimeout(() => {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    }, 0);
    return () => window.clearTimeout(id);
  }, [data, isFetched]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
      if (
        pendingCreateRef.current.length > 0 ||
        pendingUpdateRef.current.length > 0 ||
        pendingRemoveRef.current.length > 0
      ) {
        void submitPending();
      }
    };
  }, [submitPending]);

  const create = useCallback((word: WordData) => {
    pendingCreateRef.current = [...pendingCreateRef.current, word];
    setData((prev) => [...prev, word]);
    triggerDebounce();
  }, [triggerDebounce]);

  const update = useCallback((word: WordData) => {
    pendingUpdateRef.current = [...pendingUpdateRef.current, word];
    setData((prev) => prev.map((item) => (item.id === word.id ? { ...item, ...word } : item)));
    triggerDebounce();
  }, [triggerDebounce]);

  const remove = useCallback((word: WordData) => {
    pendingRemoveRef.current = [...pendingRemoveRef.current, word];
    setData((prev) => prev.filter((item) => item.id !== word.id));
    triggerDebounce();
  }, [triggerDebounce]);

  const shuffle = useCallback(() => {
    setShuffledIndexes(shuffleIndexes(data.length));
  }, [data.length, shuffleIndexes]);

  const resultData = useMemo(() => {
    const shuffled = shuffledIndexes
      .map((i) => data[i])
      .filter((item): item is WordData => item !== undefined);

    if (isLevelMode) {
      return shuffled.filter((item) => item.level === currentLevel);
    }

    return shuffled.filter((item) => item.level !== 5);
  }, [currentLevel, data, isLevelMode, shuffledIndexes]);

  return {
    data: resultData,
    isFetched,
    isFetching,
    isFetchError,
    isLevelMode,
    setIsLevelMode,
    level: currentLevel,
    upperLevel: (number?: number) => {
      const sumLevel = typeof number === 'number' ? number + currentLevelRef.current : currentLevelRef.current + 1;
      const result = sumLevel > 5 ? sumLevel % 6 : sumLevel < 0 ? 5 : sumLevel;
      setCurrentLevel(result);
    },
    create,
    update,
    remove,
    shuffle,
    submitPending,
    refetch: get,
  };
};
