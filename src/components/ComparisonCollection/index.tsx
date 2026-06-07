import { useState } from 'react';
import CardCollection from '@/components/CardCollection';
import { useComparisonDataContext } from '@/context/ComparisonData/context';
import { ComparisonData } from '@/pages/MainScreen/type';
import Card from '../CardCollection/Card';
import CardBody from './CardBody';

const ComparisonCollection = () => {
  const { create, update, data } = useComparisonDataContext();

  const FormComponent = ({ mode, data: initialData, onConfirm }: { mode: 'create' | 'edit'; data?: ComparisonData; onConfirm: () => void }) => {
    const [title, setTitle] = useState(initialData?.title ?? '');
    const [words, setWords] = useState(initialData?.words.join(', ') ?? '');
    const [explain, setExplain] = useState(initialData?.explain ?? '');
    const [notMatched, setNotMatched] = useState(initialData?.not_matched.join(', ') ?? '');
    const [synonyms, setSynonyms] = useState(initialData?.synonyms.join(', ') ?? '');
    const [level, setLevel] = useState(initialData?.level ?? 0);

    const handleSubmit = () => {
      const parsedWords = words.split(',').map((item) => item.trim()).filter(Boolean);
      const parsedNotMatched = notMatched.split(',').map((item) => item.trim()).filter(Boolean);
      const parsedSynonyms = synonyms.split(',').map((item) => item.trim()).filter(Boolean);

      const payload: ComparisonData = {
        id: initialData?.id ?? Date.now(),
        title,
        words: parsedWords,
        explain,
        not_matched: parsedNotMatched,
        synonyms: parsedSynonyms,
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
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>Title</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>Words</div>
          <input value={words} onChange={(e) => setWords(e.target.value)} style={{ width: '100%', padding: '8px' }} placeholder="comma-separated" />
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>Explain</div>
          <textarea value={explain} onChange={(e) => setExplain(e.target.value)} rows={3} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>Not matched</div>
          <input value={notMatched} onChange={(e) => setNotMatched(e.target.value)} style={{ width: '100%', padding: '8px' }} placeholder="comma-separated" />
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>Synonyms</div>
          <input value={synonyms} onChange={(e) => setSynonyms(e.target.value)} style={{ width: '100%', padding: '8px' }} placeholder="comma-separated" />
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>Level</div>
          <input type="number" value={level} onChange={(e) => setLevel(Math.max(0, Math.min(5, Number(e.target.value))))} style={{ width: '100%', padding: '8px' }} min={0} max={5} />
        </div>
        <button onClick={handleSubmit} style={{ padding: '12px', border: '0', borderRadius: '8px', background: '#333', color: '#fff' }}>
          Confirm
        </button>
      </div>
    );
  };

  const WrappedCard = () => (
    <Card
      data={data}
      update={update}
      body={CardBody}
    />
  );

  return (
    <CardCollection
      CardComponent={WrappedCard}
      FormComponent={FormComponent}
      useCollectionContext={useComparisonDataContext}
    />
  );
};

export default ComparisonCollection;
