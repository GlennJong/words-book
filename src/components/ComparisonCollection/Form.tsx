import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { postData, getData } from '@/utils/fetch';
import { useGlobalSettings } from '@/context/GlobalSetting/context';
import '@/components/CardForm/style.css';
import { ComparisonData } from '@/pages/MainScreen/type';
import LoadingAnimation from '../LoadingAnimation';

type ComparisonFormProps = {
  mode: 'create' | 'edit';
  data?: ComparisonData;
  onConfirm: () => void;
  create: (card: ComparisonData) => void;
  update: (card: ComparisonData) => void;
};

type ComparisonResponse = {
  status: string;
  message: string;
  data?: {
    explain?: string;
    synonyms?: string[];
  };
};

function buildComparisonUrl(endpoint?: string, token?: string) {
  if (!endpoint) return undefined;
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  params.set('t', Date.now().toString());
  return `${endpoint}?${params.toString()}`;
}

const getMockComparison = async (words: string[]) => {
  return {
    explain: `Compare ${words.join(', ')} in context.`,
  };
};

function ComparisonForm({ mode, data: initialData, onConfirm, create, update }: ComparisonFormProps) {
  const { isDemo, endpoint, token } = useGlobalSettings();
  const [words, setWords] = useState<string[]>(initialData?.words ?? []);
  const [title, setTitle] = useState(initialData?.title ?? initialData?.words?.join(', ') ?? '');
  const [wordFragment, setWordFragment] = useState('');
  const [explain, setExplain] = useState(initialData?.explain ?? '');
  const [synonyms, setSynonyms] = useState<string[]>(initialData?.synonyms ?? []);
  const displayExplain = explain.replace(/\\n/g, '\n');
  const [level] = useState(initialData?.level ?? 0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isFetchingComparison, setIsFetchingComparison] = useState(false);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const loadedDict = useRef<{ [key: string]: string[] }>({});
  const searchTimerRef = useRef<number | null>(null);

  const addWords = (values: string | string[]) => {
    const nextValues = Array.isArray(values) ? values : [values];
    setWords((prev) => {
      const next = [...prev];
      nextValues.forEach((item) => {
        const trimmed = item.trim();
        if (trimmed && !next.includes(trimmed)) {
          next.push(trimmed);
        }
      });
      setTitle(next.join(', '));
      return next;
    });
    setWordFragment('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeWord = (word: string) => {
    setWords((prev) => {
      const next = prev.filter((item) => item !== word);
      setTitle(next.join(', '));
      return next;
    });
  };

  useEffect(() => {
    if (!showSuggestions) return;
    const handleClick = (e: MouseEvent) => {
      const inputEl = inputRef.current;
      const listEl = listRef.current;
      if (inputEl?.contains(e.target as Node) || listEl?.contains(e.target as Node)) {
        return;
      }
      setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSuggestions]);

  const handleWordsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const parts = value.split(',').map((w) => w.trim());
      const last = parts.pop() ?? '';
      const added = parts.filter(Boolean);
      if (added.length > 0) {
        addWords(added);
      }
      setWordFragment(last);
      return;
    }

    setWordFragment(value);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
    setShowSuggestions(false);

    if (searchTimerRef.current !== null) {
      window.clearTimeout(searchTimerRef.current);
    }

    const fragment = value.trim();
    if (!fragment) return;

    searchTimerRef.current = window.setTimeout(async () => {
      const letter = fragment[0]?.toLowerCase();
      if (!letter || !/^[a-z]$/.test(letter)) return;
      setAutocompleteLoading(true);
      if (!loadedDict.current[letter]) {
        loadedDict.current[letter] = (await getData<string[]>(`./corpus/${letter}.json`)) || [];
      }
      const list = loadedDict.current[letter].filter((w) => w.startsWith(fragment.toLowerCase())).slice(0, 10);
      setSuggestions(list);
      setActiveSuggestionIndex(list.length > 0 ? 0 : -1);
      setShowSuggestions(list.length > 0);
      setAutocompleteLoading(false);
    }, 150);
  };

  const handleWordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && wordFragment.trim()) {
        e.preventDefault();
        addWords(wordFragment.trim());
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = suggestions[activeSuggestionIndex] ?? suggestions[0];
      if (selected) {
        addWords(selected);
      }
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addWords(suggestion);
  };

  const handleFetchComparison = async () => {
    if (words.length === 0) return;
    const parsedWords = words;
    setIsFetchingComparison(true);

    try {
      const url = buildComparisonUrl(endpoint, token);
      let result: ComparisonResponse['data'] | undefined;
      if (isDemo || !url) {
        result = await getMockComparison(parsedWords);
      } else {
        const response = await postData<ComparisonResponse>(url, {
          subject: 'comparison',
          action: 'getComparison',
          data: parsedWords,
        });
        result = response?.data ?? {};
      }

      if (result?.explain !== undefined) {
        setExplain(result.explain.replace(/\n/g, '\\n'));
      }
      if (result?.synonyms !== undefined) {
        setSynonyms(result.synonyms);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingComparison(false);
    }
  };

  const handleSubmit = () => {
    const payload: ComparisonData = {
      id: initialData?.id ?? Date.now(),
      title,
      words,
      explain,
      not_matched: [],
      synonyms,
      level,
    };
    if (mode === 'create') {
      create(payload);
    } else {
      update(payload);
    }
    onConfirm();
  };

  return (
    <div className="form" style={{ width: '350px', height: '540px'}}>
      <div>
        <div className="subtitle">
          Words
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', padding: '6px 8px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }}>
            {words.map((word) => (
              <span key={word} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 4px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '12px' }}>
                {word}
                <button
                  type="button"
                  onClick={() => removeWord(word)}
                  style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '14px', lineHeight: '1' }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              className="input"
              value={wordFragment}
              onChange={handleWordsChange}
              onKeyDown={handleWordKeyDown}
              placeholder="add a word"
              autoComplete="off"
              style={{ flex: 1, minWidth: '120px', border: 'none', outline: 'none', background: 'transparent', color: '#fff', boxShadow: 'none' }}
            />
          </div>
          {showSuggestions && (
            <ul className="autocomplete-list" ref={listRef} style={{ position: 'absolute', maxHeight: '220px', width: '100%', overflowY: 'auto' }}>
              {autocompleteLoading ? (
                <li>Loading...</li>
              ) : (
                suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    style={{
                      background: index === activeSuggestionIndex ? 'rgba(63, 133, 255, 0.5)' : 'transparent',
                      cursor: 'pointer',
                      padding: '8px 12px',
                    }}
                  >
                    {suggestion}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {synonyms.length > 0 && (
          <div style={{ marginTop: '14px', display: 'flex', gap: '8px', overflowX: 'scroll' }}>
            {synonyms.map((synonym) => (
              <button
                key={synonym}
                type="button"
                style={{ fontSize: '12px', height: 'auto', whiteSpace: 'nowrap', background: 'transparent', border: 0, color: '#08d' }}
                onClick={() => addWords(synonym)}
              >
                {synonym}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="subtitle">Explain</div>
        <div className="input-container" style={{ height: '240px' }}>
          <textarea
            className="input"
            value={displayExplain}
            readOnly
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </div>
      </div>


      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="submit" onClick={handleFetchComparison} style={{ marginTop: '18px'}}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isFetchingComparison ? <LoadingAnimation /> : '✦'}
          </div>
        </button>
        <button className="submit" onClick={handleSubmit} style={{ marginTop: '18px'}}>
          Confirm
        </button>
      </div>
    </div>
  );
}

export default ComparisonForm;
