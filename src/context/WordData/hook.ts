import { getMockWordListData } from "@/mock";
import { WordData } from "@/pages/MainScreen/type";
import { postData } from "@/utils/fetch";
import { useEffect, useState, useRef, useMemo } from "react";

const SEND_DEBOUNCE = 12 * 1000; // 12 seconds

const LOCAL_KEY = 'wordDataCache';

async function getWordData(endpoint?: string, token?: string) {
  try {
    const url = `${endpoint}` +
      `?token=${token}` +
      `&t=${Date.now().toString()}`;

    if (token) {
      const result = await postData<{status: string, data: WordData[]}>(url, { action: 'getWordList' });
      if (result) return result.data;
    }
  } catch (error) {
    console.error(error);
  }
}

async function postWordData(action: string, data: WordData[], endpoint?: string, token?: string) {
  try {
    const url = `${endpoint}` +
      `?token=${token}` +
      `&t=${Date.now().toString()}`;

    if (token) {
      await postData(url, { action, data });
    }
  } catch (error) {
    console.error(error);
  }
}


type useWordDataProps = {
  isDemo: boolean,
  isOffline: boolean,
  endpoint?: string,
  token?: string
}

export const useWordData = ({isDemo, isOffline, endpoint, token}: useWordDataProps) => {
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

  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel])

  // TODO: demo mode
  const isEnabled = endpoint && token || isDemo;

  useEffect(() => {
    if (isEnabled && !isOffline) get();
    if (isOffline) {
      // 離線時直接從 localStorage 取資料
      const cached = localStorage.getItem(LOCAL_KEY);
      if (cached) {
        const wordList = JSON.parse(cached) as WordData[];
        setData(wordList);
        setShuffledIndexes(shuffleIndexes(wordList.length));
        setIsFetched(true);
      } else {
        setIsFetchError(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, isOffline]);

  // Persist data to localStorage asynchronously so writes never block state updates
  useEffect(() => {
    if (!isFetched) return;
    const id = setTimeout(() => localStorage.setItem(LOCAL_KEY, JSON.stringify(data)), 0);
    return () => clearTimeout(id);
  }, [data, isFetched]);

  const debounceTimer = useRef<number | null>(null);

  const triggerDebounce = () => {
  if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      if (
        pendingCreateRef.current.length > 0 ||
        pendingUpdateRef.current.length > 0 ||
        pendingRemoveRef.current.length > 0
      ) {
        submitPending();
      }
    }, SEND_DEBOUNCE);
  };

  const submitPending = async () => {
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
  };

  const get = async () => {
    if (isOffline) return;
    setIsFetching(true);
    const wordList = isDemo ?
      await getMockWordListData(1000)
      :
      await getWordData(endpoint, token) ?? [];

      console.log({wordList})

    if (wordList.length > 0) {
      setData(wordList);
      setShuffledIndexes(shuffleIndexes(wordList.length));
      setIsFetched(true);
    } else {
      setIsFetchError(true);
    }
    setIsFetching(false);
  };

  const create = (word: WordData) => {
    pendingCreateRef.current = [...pendingCreateRef.current, word];
    setData(prev => [...prev, word]);
    triggerDebounce();
  };
  const update = (word: WordData) => {
    pendingUpdateRef.current = [...pendingUpdateRef.current, word];
    setData(prev => prev.map(item => item.id === word.id ? { ...item, ...word } : item));
    triggerDebounce();
  };
  const remove = (word: WordData) => {
    pendingRemoveRef.current = [...pendingRemoveRef.current, word];
    setData(prev => prev.filter(item => item.id !== word.id));
    triggerDebounce();
  };

  // shuffle index array
  const shuffleIndexes = (length: number): number[] => {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const sendCreate = async (words: WordData[]) => {
    if (isDemo || isOffline) return;
    if (isEnabled) await postWordData('createWords', words, endpoint, token);
  };
  const sendUpdate = async (words: WordData[]) => {
    if (isDemo || isOffline) return;
    if (isEnabled) await postWordData('updateWords', words, endpoint, token);
  };
  const sendRemove = async (words: WordData[]) => {
    if (isDemo || isOffline) return;
    if (isEnabled) await postWordData('deleteWords', words, endpoint, token);
  };

  const resultData = useMemo(() => {
    // Shuffle the full dataset first, then filter — avoids out-of-bounds index mapping
    const shuffled = shuffledIndexes.map(i => data[i]).filter((item): item is WordData => item !== undefined);
    if (isLevelMode) {
      return shuffled.filter(item => item.level === currentLevel);
    }
    return shuffled.filter(item => item.level !== 5);
  }, [data, isLevelMode, shuffledIndexes, currentLevel]);

  return {
    data: resultData,
    isFetched,
    isFetching,
    isFetchError,
    isLevelMode,
    setIsLevelMode,
    level: currentLevel,
    upperLevel: (number?: number) => {
      const sumLevel = typeof number === 'number' ?
        number + currentLevelRef.current
        :
        currentLevelRef.current + 1;

      const result = sumLevel > 5 ? sumLevel%6 : sumLevel < 0 ? 5 : sumLevel;
      setCurrentLevel(result)
    },
    create,
    update,
    remove,
    suffle: () => setShuffledIndexes(shuffleIndexes(data.length)),
    submitPending,
    refetch: get
  };
};