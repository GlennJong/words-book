import { getMockComparisonListData } from "@/mock";
import { ComparisonData } from "@/pages/MainScreen/type";
import { postData } from "@/utils/fetch";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SEND_DEBOUNCE = 12 * 1000; // 12 seconds
const LOCAL_KEY = 'comparisonDataCache';

type useComparisonDataProps = {
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

async function getComparisonData(endpoint?: string, token?: string) {
  try {
    const url = buildUrl(endpoint, token);
    if (!url || !token) return;
    const result = await postData<{ status: string; data: ComparisonData[] }>(url, { subject: 'comparison', action: 'getList' });
    return result?.data;
  } catch (error) {
    console.error(error);
  }
}

async function postComparisonData(action: string, comparison: ComparisonData[], endpoint?: string, token?: string) {
  try {
    const url = buildUrl(endpoint, token);
    if (!url || !token) return;
    await postData(url, { subject: 'comparison', action, data: comparison });
  } catch (error) {
    console.error(error);
  }
}

export const useComparisonData = ({ isDemo, isOffline, endpoint, token }: useComparisonDataProps) => {
  const [isLevelMode, setIsLevelMode] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const currentLevelRef = useRef(0);
  const [data, setData] = useState<ComparisonData[]>([]);
  const [shuffledIndexes, setShuffledIndexes] = useState<number[]>([]);
  const pendingCreateRef = useRef<ComparisonData[]>([]);
  const pendingUpdateRef = useRef<ComparisonData[]>([]);
  const pendingRemoveRef = useRef<ComparisonData[]>([]);
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
    async (comparison: ComparisonData[]) => {
      if (isDemo || isOffline) return;
      if (isEnabled) await postComparisonData('create', comparison, endpoint, token);
    },
    [endpoint, isDemo, isEnabled, isOffline, token]
  );

  const sendUpdate = useCallback(
    async (comparison: ComparisonData[]) => {
      if (isDemo || isOffline) return;
      if (isEnabled) await postComparisonData('update', comparison, endpoint, token);
    },
    [endpoint, isDemo, isEnabled, isOffline, token]
  );

  const sendRemove = useCallback(
    async (comparison: ComparisonData[]) => {
      if (isDemo || isOffline) return;
      if (isEnabled) await postComparisonData('delete', comparison, endpoint, token);
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

    const comparisonList = isDemo
      ? await getMockComparisonListData(1000)
      : (await getComparisonData(endpoint, token)) ?? [];

    if (comparisonList.length > 0) {
      setData(comparisonList);
      setShuffledIndexes(shuffleIndexes(comparisonList.length));
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
        const comparisonList = JSON.parse(cached) as ComparisonData[];
        setData(comparisonList);
        setShuffledIndexes(shuffleIndexes(comparisonList.length));
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

  const create = useCallback((comparison: ComparisonData) => {
    pendingCreateRef.current = [...pendingCreateRef.current, comparison];
    setData((prev) => [...prev, comparison]);
    triggerDebounce();
  }, [triggerDebounce]);

  const update = useCallback((comparison: ComparisonData) => {
    pendingUpdateRef.current = [...pendingUpdateRef.current, comparison];
    setData((prev) => prev.map((item) => (item.id === comparison.id ? comparison : item)));
    triggerDebounce();
  }, [triggerDebounce]);

  const remove = useCallback((comparison: ComparisonData) => {
    pendingRemoveRef.current = [...pendingRemoveRef.current, comparison];
    setData((prev) => prev.filter((item) => item.id !== comparison.id));
    triggerDebounce();
  }, [triggerDebounce]);

  const resultData = useMemo(() => {
    const shuffled = shuffledIndexes
      .map((i) => data[i])
      .filter((item): item is ComparisonData => item !== undefined);

    if (isLevelMode) {
      return shuffled.filter((item) => item.level === currentLevel);
    }

    return shuffled.filter((item) => item.level !== 5);
  }, [currentLevel, data, isLevelMode, shuffledIndexes]);

  const upperLevel = useCallback((delta: number) => {
    setCurrentLevel((prev) => {
      const next = Math.min(5, Math.max(0, prev + delta));
      currentLevelRef.current = next;
      return next;
    });
  }, []);

  const shuffle = useCallback(() => {
    setShuffledIndexes(() => shuffleIndexes(data.length));
  }, [data.length, shuffleIndexes]);

  return {
    data: resultData,
    currentLevel,
    isLevelMode,
    isEnabled,
    isFetching,
    isFetched,
    isFetchError,
    level: currentLevel,
    upperLevel,
    shuffle,
    setIsLevelMode,
    setCurrentLevel,
    setData,
    refetch: get,
    create,
    update,
    remove,
    shuffledIndexes,
  };
};
