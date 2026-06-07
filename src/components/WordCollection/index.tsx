import { createCollection } from '@/components/CardCollection/collectionFactory';
import WordForm from './Form';
import { useWordDataContext } from '@/context/WordData/context';
import { WordData } from '@/pages/MainScreen/type';
import CardBody from './CardBody';

const WordCollection = createCollection<WordData>({
  useCollectionContext: useWordDataContext,
  CardBody,
  FormFactory: ({ create, update }) => (props) => (
    <WordForm
      {...props}
      create={create}
      update={update}
    />
  ),
});

export default WordCollection;
