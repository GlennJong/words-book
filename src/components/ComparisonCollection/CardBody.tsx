import { Fragment, useEffect } from 'react';
import '@/components/CardCollection/Card/style.css';

const cardBackgroundImages = [
  'images/card_1.svg',
  'images/card_2.svg',
  'images/card_3.svg',
  'images/card_4.svg',
  'images/card_5.svg',
  'images/card_max.svg',
];

const wordcardBackground = {
  level_1: {
    backgroundColor: '#28525B',
    backgroundImage: `url('images/card_1.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',
  },
  level_2: {
    backgroundColor: '#2d295b',
    backgroundImage: `url('images/card_2.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',

  },
  level_3: {
    backgroundColor: '#41274C',
    backgroundImage: `url('images/card_3.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',
  },
  level_4: {
    backgroundColor: '#28BBD2',
    backgroundImage: `url('images/card_4.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',
  },
  level_5: {
    backgroundColor: '#2C285B',
    backgroundImage: `url('images/card_5.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',
  },
  level_max: {
    backgroundColor: '#A797FC',
    backgroundImage: `url('images/card_max.svg')`,
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '104% auto',
  }
}

interface CardBodyProps {
  title: string;
  words: string[];
  explain: string;
  not_matched: string[];
  synonyms: string[];
  level: number;
  isEditable?: boolean;
  onEditClick?: () => void;
}

const CARDSIZE = {
  width: '380px',
  height: '560px',
}

const levelBackgroundMap: { [key: number]: keyof typeof wordcardBackground } = {
  0: 'level_1',
  1: 'level_2',
  2: 'level_3',
  3: 'level_4',
  4: 'level_5',
  5: 'level_max',
};

const CardBody = ({ title, explain, level, words, not_matched, synonyms, isEditable=false, onEditClick }: CardBodyProps) => {
  const backgroundKey = levelBackgroundMap[level] || 'level_1';
  const formattedExplain = explain.replace(/\\n/g, '\n');

  useEffect(() => {
    cardBackgroundImages.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, []);

  return (
    <div className="card" style={{ maxWidth: '90vw', maxHeight: '75vh', ...CARDSIZE, ...wordcardBackground[backgroundKey] }}>
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
        {/* <div
          className="word"
          style={{
            marginBottom: '4px',
            fontSize: title.length > 10 ? '14px' : '18px',
          }}
        >{ title }</div> */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px', }}>
          { words.map(word => 
            <div className="tag">
              { word }
            </div>
          )}
        </div>
        <Fragment key={title}>
          { formattedExplain &&
            <div className="content">
              { formattedExplain }
            </div>
          }
          { not_matched.length > 0 &&
            <div className="content">
              <span>misreads:</span> { not_matched.join(', ') }
            </div>
          }
          { synonyms.length > 0 &&
            <div className="content">
              <span>synonyms:</span> { synonyms.join(', ') }
            </div>
          }
        </Fragment>
      </div>
    </div>
  )
}

export default CardBody;