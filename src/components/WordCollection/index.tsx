import CardCollection from '@/components/CardCollection';
import Card from '@/components/CardCollection/Card';
import CardForm from '@/components/CardForm';
import { useWordDataContext } from '@/context/WordData/context';
import { WordData } from '@/pages/MainScreen/type';

const WordCollection = () => {
  const { create, update, data } = useWordDataContext();

  const FormComponent = (props: { mode: 'create' | 'edit'; data?: WordData; onConfirm: () => void }) => (
    <CardForm
      {...props}
      title="Word"
      subject="word"
      create={create}
      update={update}
    />
  );

  const WrappedCard = () => <Card data={data} update={update} />;

  return (
    <CardCollection
      CardComponent={WrappedCard}
      FormComponent={FormComponent}
      useCollectionContext={useWordDataContext}
    />
  );
};

export default WordCollection;
