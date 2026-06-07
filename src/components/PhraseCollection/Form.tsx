import React, { useEffect, useRef, useState } from 'react';
import { getData } from '@/utils/fetch';
import './style.css';
import { PhraseData } from '@/pages/MainScreen/type';
import LoadingAnimation from '@/components/LoadingAnimation';
import { getMockGenDefinition, getMockGenSentence } from '@/mock';

type PhraseFormProps = {
  mode: 'create' | 'edit';
  data?: PhraseData;
  onConfirm: () => void;
  create: (card: PhraseData) => void;
  update: (card: PhraseData) => void;
};

function PhraseForm({ mode, data, onConfirm, create, update }: PhraseFormProps) {
  const [word, setWord] = useState(mode === 'create' ? '' : data?.word || '');
  const [description, setDescription] = useState(mode === 'create' ? '' : data?.description || '');
  const [instance, setInstance] = useState(mode === 'create' ? '' : data?.instance || '');
  const [translation, setTranslation] = useState(mode === 'create' ? '' : data?.translation || '');

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSentenceGenerating, setIsSentenceGenerating] = useState(false);
  const [isDefinitionGenerating, setIsDefinitionGenerating] = useState(false);

  const loadedDict = useRef<{ [key: string]: string[] }>({});
  const searchTimerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!showSuggestions) return;
    const handleClick = (e: MouseEvent) => {
      const inputEl = inputRef.current;
      const listEl = listRef.current;
      if ((inputEl && inputEl.contains(e.target as Node)) || (listEl && listEl.contains(e.target as Node))) {
        return;
      }
      setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSuggestions]);

  const handleGenerateDefinition = async () => {
    setIsDefinitionGenerating(true);
    const result = await getMockGenDefinition(word, 1000);
    if (result) setDescription(result);
    setIsDefinitionGenerating(false);
  };

  const handleGenerateInstance = async () => {
    setIsSentenceGenerating(true);
    const result = await getMockGenSentence(word, 1000);
    if (result) setInstance(result);
    setIsSentenceGenerating(false);
  };

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWord(value);
    setSuggestions([]);
    setShowSuggestions(false);

    if (searchTimerRef.current !== null) clearTimeout(searchTimerRef.current);
    if (!value) return;
    const first = value[0]?.toLowerCase();
    if (!first || !/^[a-z]$/.test(first)) return;

    searchTimerRef.current = window.setTimeout(async () => {
      if (!loadedDict.current[first]) {
        const words = await getData<string[]>(`./corpus/${first}.json`);
        loadedDict.current[first] = words || [];
      }
      const list = loadedDict.current[first].filter((w) => w.startsWith(value.toLowerCase())).slice(0, 10);
      setSuggestions(list);
      setShowSuggestions(list.length > 0);
    }, 150);
  };

  const handleSuggestionClick = (w: string) => {
    setWord(w);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    const newData: PhraseData = {
      ...data,
      word: word || '',
      description: description || '',
      instance: instance || '',
      translation: translation || '',
    } as PhraseData;

    if (mode === 'create') {
      create(newData);
    } else {
      update(newData);
    }
    onConfirm();
  };

  const isGenerating = isSentenceGenerating || isDefinitionGenerating;

  return (
    <div className="form">
      <div>
        <div className="subtitle">Phrase</div>
        <div className="input-container" style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            className="input"
            value={word}
            onFocus={() => setShowSuggestions(true)}
            onChange={handleWordChange}
            autoComplete="off"
          />
          {showSuggestions && (
            <ul className="autocomplete-list" ref={listRef}>
              {suggestions.map((w) => (
                <li key={w} onClick={() => handleSuggestionClick(w)}>
                  {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <div className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Description</span>
          <button
            disabled={isGenerating}
            style={{ background: 'transparent', color: '#fff', fontSize: '16px', border: 0 }}
            onClick={handleGenerateDefinition}
          >
            {isDefinitionGenerating ? <LoadingAnimation /> : '✦'}
          </button>
        </div>
        <div className="input-container">
          <input type="text" className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      <div>
        <div className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Sentence</span>
          <button
            disabled={isGenerating}
            style={{ background: 'transparent', color: '#fff', fontSize: '16px', border: 0 }}
            onClick={handleGenerateInstance}
          >
            {isSentenceGenerating ? <LoadingAnimation /> : '✦'}
          </button>
        </div>
        <div className="input-container large">
          <textarea disabled={isGenerating} rows={2} className="input" value={instance} onChange={(e) => setInstance(e.target.value)} />
        </div>
      </div>

      <div>
        <div className="subtitle">Translation</div>
        <div className="input-container">
          <input type="text" className="input" value={translation} onChange={(e) => setTranslation(e.target.value)} />
        </div>
      </div>

      <div>
        <button className="submit" onClick={handleSubmit}>Confirm</button>
      </div>
    </div>
  );
}

export default PhraseForm;
