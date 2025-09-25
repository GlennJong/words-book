import { getMockWordListData } from "@/mock";
import { WordData } from "@/pages/MainScreen/type";
import { getData, postData } from "@/utils/fetch";
import { useEffect, useState, useRef, useMemo } from "react";

const SEND_DEBOUNCE = 12 * 1000; // 12 seconds

async function getWordData(endpoint?: string, token?: string) {
  try {
    const url = `${endpoint}` +
      `?token=${token}` +
      `&t=${Date.now().toString()}`;

    if (token) {
      return await getData<WordData[]>(url);
    }
  } catch (error) {
    console.error(error);
  }
}

async function postWordData(method: string, data: WordData[], endpoint?: string, token?: string) {
  try {
    const url = `${endpoint}` +
      `?token=${token}` +
      `&t=${Date.now().toString()}`;

    if (token) {
      await postData(url, { method, data });
    }
  } catch (error) {
    console.error(error);
  }
}

export const useWordData = (isDemo: boolean, endpoint?: string, token?: string) => {
  const [isLevelMode, setIsLevelMode] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [data, setData] = useState<WordData[]>([]);
  const [shuffledIndexes, setShuffledIndexes] = useState<number[]>([]);
  const pendingCreateRef = useRef<WordData[]>([]);
  const pendingUpdateRef = useRef<WordData[]>([]);
  const pendingRemoveRef = useRef<WordData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [isFetchError, setIsFetchError] = useState(false);

  // TODO: demo mode
  const isEnabled = endpoint && token || isDemo;

  useEffect(() => {
    if (isEnabled) get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);

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
    setIsFetching(true);
    // TODO: demo mode
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
    if (isDemo) return;
    if (isEnabled) await postWordData('create', words, endpoint, token);
  };
  const sendUpdate = async (words: WordData[]) => {
    if (isDemo) return;
    if (isEnabled) await postWordData('update', words, endpoint, token);
  };
  const sendRemove = async (words: WordData[]) => {
    if (isDemo) return;
    if (isEnabled) await postWordData('delete', words, endpoint, token);
  };

  const resultData = useMemo(() => {
    let result = data;
    if (isLevelMode) {
      result = result.filter(item => item.level === currentLevel);
    }
    else {
      result = result.filter(item => item.level !== 5);
    };

    return shuffledIndexes.map(i => result[i]).filter(item => item !== undefined);
  }, [data, isLevelMode, shuffledIndexes, currentLevel]);

  return {
    data: resultData,
    isFetched,
    isFetching,
    isFetchError,
    isLevelMode,
    setIsLevelMode,
    level: currentLevel,
    upperLevel: (number: number) => setCurrentLevel(number > 5 ? 0 : number),
    create,
    update,
    remove,
    suffle: () => setShuffledIndexes(shuffleIndexes(data.length)),
    submitPending,
    refetch: get
  };
};