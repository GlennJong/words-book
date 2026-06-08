import { createCollection } from '@/components/CardCollection/collectionFactory';
import { useComparisonDataContext } from '@/context/ComparisonData/context';
import { ComparisonData } from '@/pages/MainScreen/type';
import CardBody from './CardBody';
import ComparisonForm from './Form';
import './style.css';

const ComparisonCollection = createCollection<ComparisonData>({
  useCollectionContext: useComparisonDataContext,
  CardBody,
  FormFactory: ({ create, update }) => (props) => (
    <ComparisonForm
      {...props}
      create={create}
      update={update}
    />
  ),
});

export default ComparisonCollection;
