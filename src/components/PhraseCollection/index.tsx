import CardCollection from '@/components/CardCollection';
import Card from '@/components/CardCollection/Card';
import CardForm from '@/components/CardForm';
import { usePhraseDataContext } from '@/context/PhraseData/context';
import { PhraseData } from '@/pages/MainScreen/type';

const PhraseCollection = () => {
  const { create, update, data } = usePhraseDataContext();

  const FormComponent = (props: { mode: 'create' | 'edit'; data?: PhraseData; onConfirm: () => void }) => (
    <CardForm
      {...props}
      title="Phrase"
      subject="phrase"
      create={create}
      update={update}
    />
  );

  const WrappedCard = () => <Card data={data} update={update} />;

  return (
    <CardCollection
      CardComponent={WrappedCard}
      FormComponent={FormComponent}
      useCollectionContext={usePhraseDataContext}
    />
  );
};

export default PhraseCollection;
