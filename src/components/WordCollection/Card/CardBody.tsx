import { Fragment, useState } from 'react';
import './style.css';
import { Book } from '@/components/Icons';

const wordcardBackground = {
  level_1: {
    backgroundColor: '#28525B',
    backgroundImage: `url('./images/card_1.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',
  },
  level_2: {
    backgroundColor: '#2d295b',
    backgroundImage: `url('./images/card_2.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',

  },
  level_3: {
    backgroundColor: '#41274C',
    backgroundImage: `url('./images/card_3.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',
  },
  level_4: {
    backgroundColor: '#28BBD2',
    backgroundImage: `url('./images/card_4.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',
  },
  level_5: {
    backgroundColor: '#2C285B',
    backgroundImage: `url('./images/card_5.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',
  },
  level_max: {
    backgroundColor: '#A797FC',
    backgroundImage: `url('./images/card_max.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',
  }
}

interface CardBodyProps {
  word: string;
  description: string;
  instance: string;
  translation: string;
  level: number;
  isEditable?: boolean;
  onEditClick?: () => void;
}

const CARDSIZE = {
  width: '320px',
  height: '450px',
}

const levelBackgroundMap: { [key: number]: keyof typeof wordcardBackground } = {
  0: 'level_1',
  1: 'level_2',
  2: 'level_3',
  3: 'level_4',
  4: 'level_5',
  5: 'level_max',
};

const CardBody = ({ word, description, instance, translation, level, isEditable=false, onEditClick }: CardBodyProps) => {
  const backgroundKey = levelBackgroundMap[level] || 'level_1';
  return (
    <div className="card" style={{ maxWidth: '65vw', maxHeight: '50vh', ...CARDSIZE, ...wordcardBackground[backgroundKey] }}>
      <div className="inner">
        <div className="level">
          { level === 5 ?
            <span>max</span>
            :
            <span>{ level+1 }.</span>
          }
        </div>
        { isEditable &&
          <div className="edit"
            onClick={onEditClick}
          >
            ✎
          </div>
        }
        <div
          className="word"
          style={{
            fontSize: word.length > 10 ? '24px' : '30px',
          }}
        >{ word }</div>
        <Fragment key={word}>
          <ExtendExtraContent data={description} title="Description" />
          <ExtendExtraContent data={instance} title="Sentence" />
          <ExtendExtraContent data={translation} title="Translation" />
        </Fragment>
      </div>
    </div>
  )
}

const ExtendExtraContent = ({ data, title }: { data: string, title: string }) => {
  const [ isShow, setIsShow ] = useState(false);
  if (!data) return null;
  return (
    <div className="extra">
      { isShow ?
        <span>
          { data }
        </span>
        :
        <button onClick={() => setIsShow(!isShow)}>
          <Book />
          <span>{ title }</span>
        </button>
      }
    </div>
  )
}

export default CardBody;