
import React, { useState, useRef } from 'react';
import { getData, postData } from '@/utils/fetch';
import './style.css';
import { useWordDataContext } from '@/context/WordData/context';
import { WordData } from '@/pages/MainScreen/type';
import { useGlobalSetting } from '@/App';

type WordFormProps = {
  mode: 'create' | 'edit';
  data?: WordData;
  onConfirm: () => void;
}


type GenerateWordResponse = {
  status: string;
  message: string;
};

async function postGenerateWord(asId: string, word: string) {
  try {
    const result = await postData(
      `https://script.google.com/macros/s/${asId}/exec`,
      {
        method: 'generate-sentence',
        data: { word }
      }
    ) as unknown as GenerateWordResponse;
    if (result && result.status !== 'error') {
      return result.message;
    }
  }
  catch (error) {
    console.error(error);
  }
}

const WordForm = ({ mode, data, onConfirm }: WordFormProps) => {
  const { asId } = useGlobalSetting();
  const { create, update } = useWordDataContext()
  const [word, setWord] = useState(mode === 'create' ? '' : data?.word);
  const [decription, setDescription] = useState(mode === 'create' ? '' : data?.description);
  const [instance, setInstance] = useState(mode === 'create' ? '' : data?.instance);
  const [translation, setTranslation] = useState(mode === 'create' ? '' : data?.translation);
  
  const [suggestions, setSuggestions]   = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  
  const loadedDict = useRef<{ [key: string]: string[] }>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    if (!showSuggestions) return;
    const handleClick = (e: MouseEvent) => {
      const inputEl = inputRef.current;
      const listEl = listRef.current;
      if (
        (inputEl && inputEl.contains(e.target as Node)) ||
        (listEl && listEl.contains(e.target as Node))
      ) {
        return;
      }
      setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSuggestions]);


  const handleGenerateInstance = async () => {
    if (!asId || !word) return;
    setIsGenerating(true);
    const instance = await postGenerateWord(asId, word);
    if (instance) setInstance(instance);
    setIsGenerating(false);
  }

  const handleWordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWord(value);
    if (!value) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const first = value[0]?.toLowerCase();
    if (!first || !/^[a-z]$/.test(first)) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!loadedDict.current[first]) {
      const words = await getData<string[]>(`/corpus/${first}.json`);
      loadedDict.current[first] = words || [];
    }

    const list = loadedDict.current[first].filter(w => w.startsWith(value.toLowerCase())).slice(0, 10);
    setSuggestions(list);
    setShowSuggestions(list.length > 0);
  };

  const handleSuggestionClick = (w: string) => {
    setWord(w);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    const newData = {
      ...data,
      word: word || '',
      description: decription || '',
      instance: instance || '',
      translation: translation || '',
    }
    switch (mode) {
      case 'create':
        create(newData as WordData)
        break;
      case 'edit':
        update(newData as WordData)
        break;
    }
    onConfirm();
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="form">
          <div>
            <div className="subtitle">Word</div>
            <div className="input-container" style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                className="input"
                value={word}
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
            <div className="subtitle">Description</div>
            <div className="input-container">
              <input type="text" className="input" value={decription} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="subtitle">
              Sentence
              <button
                disabled={isGenerating}
                style={{background: "transparent", color: "#fff", border: 0}}
                onClick={handleGenerateInstance}
              >
                { isGenerating ? 'Generating' : '✦'}
              </button>
            </div>
            <div className="input-container">
              <input disabled={isGenerating} type="text" className="input" value={instance} onChange={e => setInstance(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="subtitle">
              Translation
            </div>
            <div className="input-container">
              <input type="text" className="input" value={translation} onChange={e => setTranslation(e.target.value)} />
            </div>
          </div>
          <div>
            <button className="submit" onClick={handleSubmit}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WordForm;