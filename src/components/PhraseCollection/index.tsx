import { createCollection } from '@/components/CardCollection/collectionFactory';
import PhraseForm from './Form';
import { usePhraseDataContext } from '@/context/PhraseData/context';
import { PhraseData } from '@/pages/MainScreen/type';
import CardBody from './CardBody';

const PhraseCollection = createCollection<PhraseData>({
  useCollectionContext: usePhraseDataContext,
  CardBody,
  FormFactory: ({ create, update }) => (props) => (
    <PhraseForm
      {...props}
      create={create}
      update={update}
    />
  ),
});

export default PhraseCollection;
