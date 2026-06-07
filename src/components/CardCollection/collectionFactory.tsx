import { useMemo, type ComponentType } from 'react';
import CardCollection, { type CollectionContextType } from '@/components/CardCollection';
import Card from '@/components/CardCollection/Card';

type FormComponentProps<T> = {
  mode: 'create' | 'edit';
  data?: T;
  onConfirm: () => void;
};

type CollectionContext<T> = {
  data: T[];
  create: (item: T) => void;
  update: (item: T) => void;
};

type FormFactory<T> = (context: CollectionContext<T>) => ComponentType<FormComponentProps<T>>;

type CollectionBuilderConfig<T extends { level: number }> = {
  useCollectionContext: () => CollectionContext<T> & CollectionContextType;
  CardBody: ComponentType<any>;
  FormFactory: FormFactory<T>;
};

export function createCollection<T extends { level: number }>(config: CollectionBuilderConfig<T>) {
  return function CollectionComponent() {
    const { create, update, data } = config.useCollectionContext();
    const FormComponent = useMemo(() => config.FormFactory({ create, update, data }), [create, update, data]);
    const WrappedCard = useMemo(
      () => () => <Card data={data} update={update} body={config.CardBody} FormComponent={FormComponent} />,
      [data, update, FormComponent, config.CardBody],
    );

    return (
      <CardCollection
        CardComponent={WrappedCard}
        FormComponent={FormComponent}
        useCollectionContext={config.useCollectionContext}
      />
    );
  };
}
