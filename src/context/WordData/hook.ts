import { WordData } from "@/pages/MainScreen/type";
import { getData, postData } from "@/utils/fetch";
import { useEffect, useState, useRef, useMemo } from "react";

const SEND_INTERVAL = 10 * 1000;

async function getWordData(asId: string) {
  try {
    return await getData<WordData[]>(`https://script.google.com/macros/s/${asId}/exec`);
  }
  catch (error) {
    console.error(error);
  }
}
async function postWordData(asId: string, method: string, data: WordData[]) {
  try {
    await postData(`https://script.google.com/macros/s/${asId}/exec`, {method, data})
  }
  catch (error) {
    console.error(error);
  }
}

export const useWordData = (asId?: string) => {
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

  useEffect(() => {
  if (asId) get()
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [asId]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      if (
        pendingCreateRef.current.length > 0 ||
        pendingUpdateRef.current.length > 0 ||
        pendingRemoveRef.current.length > 0
      ) {
        submitPending();
      }
    }, SEND_INTERVAL);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在 mount/unmount 時設置 timer

  const submitPending = async () => {
    console.log('submitPending: start');
    setIsFetching(true);
    if (pendingCreateRef.current.length > 0) {
      await sendCreate(pendingCreateRef.current);
      console.log('setPendingCreate: []');
      pendingCreateRef.current = [];
    }
    if (pendingUpdateRef.current.length > 0) {
      await sendUpdate(pendingUpdateRef.current);
      console.log('setPendingUpdate: []');
      pendingUpdateRef.current = [];
    }
    if (pendingRemoveRef.current.length > 0) {
      await sendRemove(pendingRemoveRef.current);
      console.log('setPendingRemove: []');
      pendingRemoveRef.current = [];
    }
    setIsFetching(false);
    console.log('submitPending: end');
  };

  const get = async () => {
    if (asId){
      setIsFetching(true);
      const wordList = (await getWordData(asId)) ?? [];
      if (wordList.length > 0) {
        setData(wordList);
        setShuffledIndexes(shuffleIndexes(wordList.length));
        setIsFetched(true);
      }
      else {
        setIsFetchError(true);
      }
      setIsFetching(false);
    }
  }

  const create = (word: WordData) => {
    console.log('setPendingCreate: +1');
    pendingCreateRef.current = [...pendingCreateRef.current, word];
  };
  const update = (word: WordData) => {
    console.log('setPendingUpdate: +1');
    pendingUpdateRef.current = [...pendingUpdateRef.current, word];
    console.log('setData: update', word.id);
    setData(prev => prev.map(item => item.id === word.id ? { ...item, ...word } : item));
  };
  const remove = (word: WordData) => {
    console.log('setPendingRemove: +1');
    pendingRemoveRef.current = [...pendingRemoveRef.current, word];
    console.log('setData: remove', word.id);
    setData(prev => prev.filter(item => item.id !== word.id));
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
    if (asId) await postWordData(asId, 'create', words);
  };
  const sendUpdate = async (words: WordData[]) => {
    if (asId) await postWordData(asId, 'update', words);
  };
  const sendRemove = async (words: WordData[]) => {
    if (asId) await postWordData(asId, 'delete', words);
  };

  const resultData = useMemo(() => {
    let result = data;
    if (isLevelMode) result = result.filter(item => item.level === currentLevel);
    
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