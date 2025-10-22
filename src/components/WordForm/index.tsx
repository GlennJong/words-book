
import React, { useState, useRef, useEffect } from 'react';
import { getData, postData } from '@/utils/fetch';
import './style.css';
import { useWordDataContext } from '@/context/WordData/context';
import { WordData } from '@/pages/MainScreen/type';
import { useGlobalSettings } from '@/context/GlobalSetting/context';
import LoadingAnimation from '../LoadingAnimation';
import { getMockGenDefinition, getMockGenSentence } from '@/mock';

type WordFormProps = {
  mode: 'create' | 'edit';
  data?: WordData;
  onConfirm: () => void;
}

type GenerateWordResponse = {
  status: string;
  message: string;
  data: string;
};

async function postGenerateSentence(word: string, endpoint: string, token: string) {
  try {
    const url = `${endpoint}` +
      `?token=${token}` +
      `&t=${Date.now().toString()}`;
    
    const result = await postData(
      url,
      {
        action: 'gen-ins',
        data: [word]
      }
    ) as unknown as GenerateWordResponse;
    if (result && result.status !== 'error') {
      return result.data;
    }
  }
  catch (error) {
    console.error(error);
  }
}

async function postGenerateDefinition(word: string, endpoint: string, token: string) {
  try {
    const url = `${endpoint}` +
      `?token=${token}` +
      `&t=${Date.now().toString()}`;

    const result = await postData(
      url,
      {
        action: 'gen-def',
        data: [word]
      }
    ) as unknown as GenerateWordResponse;
    if (result && result.status !== 'error') {
      return result.data;
    }
  }
  catch (error) {
    console.error(error);
  }
}

const WordForm = ({ mode, data, onConfirm }: WordFormProps) => {
  const { isDemo, endpoint, token } = useGlobalSettings();
  const { create, update } = useWordDataContext()
  const [word, setWord] = useState(mode === 'create' ? '' : data?.word);
  const [decription, setDescription] = useState(mode === 'create' ? '' : data?.description);
  const [instance, setInstance] = useState(mode === 'create' ? '' : data?.instance);
  const [translation, setTranslation] = useState(mode === 'create' ? '' : data?.translation);
  
  const [suggestions, setSuggestions]   = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isSentenceGenerating, setIsSentenceGenerating] = useState(false);
  const [isDefinitionGenerating, setIsDefinitionGenerating] = useState(false);
  
  const loadedDict = useRef<{ [key: string]: string[] }>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
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


  const handleGenerateDefenition = async () => {
    if (!endpoint || !token || !word) return;
    setIsDefinitionGenerating(true);
    // TODO: demo
    const result = isDemo ?
      await getMockGenDefinition(word, 1000)
      :
      await postGenerateDefinition(word, endpoint, token);
    if (result) setDescription(result);
    setIsDefinitionGenerating(false);
  }

  const handleGenerateInstance = async () => {
    if (!endpoint || !token || !word) return;
    setIsSentenceGenerating(true);
    // TODO: demo
    const result =  isDemo ?
      await getMockGenSentence(word, 1000)
      :
      await postGenerateSentence(word, endpoint, token);
    if (result) setInstance(result);
    setIsSentenceGenerating(false);
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
      const words = await getData<string[]>(`./corpus/${first}.json`);
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

  const isGenerating = isSentenceGenerating || isDefinitionGenerating;

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
                style={{background: "transparent", color: "#fff", fontSize: "16px", border: 0}}
                onClick={handleGenerateDefenition}
              >
                { isDefinitionGenerating ? <LoadingAnimation /> : '✦'}
              </button>
            </div>
            <div className="input-container">
              <input type="text" className="input" value={decription} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="subtitle" style={{ display: 'flex', fontSize: "16px", alignItems: 'center', gap: '4px' }}>
              <span>Sentence</span>
              <button
                disabled={isGenerating}
                style={{background: "transparent", color: "#fff", fontSize: "16px", border: 0}}
                onClick={handleGenerateInstance}
              >
                { isSentenceGenerating ? <LoadingAnimation /> : '✦'}
              </button>
            </div>
            <div className="input-container large">
              <textarea disabled={isGenerating} rows={2} className="input" value={instance} onChange={e => setInstance(e.target.value)} />
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