import { WordData } from "./pages/MainScreen/type";

export const getMockWordListData = (time: number): Promise<WordData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockdata.wordList);
    }, time);
  })
}

export const getMockGenDefinition = (word: string, time: number): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!mockdata.genDefinition[word]) {
        resolve('sorry, it is demo mode.');
      }
      const index = Math.random() > 0.5 ? 0 : 1;
      resolve(mockdata.genDefinition[word][index] || '');
    }, time);
  })
}

export const getMockGenSentence = (word: string, time: number): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!mockdata.genDefinition[word]) {
        resolve('sorry, it is demo mode.');
      }
      const index = Math.random() > 0.5 ? 0 : 1;
      resolve(mockdata.genSentence[word][index] || '');
    }, time);
  })
}

export const mockdata: {
  genDefinition: { [key: string]: string[] }
  genSentence: { [key: string]: string[] }
  wordList: WordData[]
} = {
  genDefinition: {
    solicit: [ "verb. ask earnestly", "verb. plead for business" ],
    reprimand: [ "noun/verb. formal rebuke (or rebuke formally)", "noun. official censure" ],
    freight: [ "noun. goods transported", "verb. load as cargo" ],
    devote: [ "verb. dedicate wholly", "adjective. deeply religious (as in devoted)" ],
    periodical: [ "noun. published regularly", "adjective. occurring repeatedly" ],
    periodic: [ "adjective. occurring at intervals", "noun. TV series reruns (informal)" ],
    conquered: [ "verb. defeated and taken", "adjective. feeling overcome (by emotion)" ],
    inquire: [ "verb. ask for information", "verb. investigate formally" ],
    coordinate: [ "verb. organize or harmonize", "noun. set of values locating a point" ],
    delineate: [ "verb. describe precisely", "verb. represent with lines" ],
    make: [ "verb. create or construct", "noun. brand or model of a product" ],
    initiate: [ "verb. begin or start", "noun. a new member" ],
    protagonist: [ "noun. main character", "adjective. actively supporting a cause" ],
    reconcile: [ "verb. restore friendly relations", "verb. make compatible" ],
  },
  genSentence: {
    solicit: ["He plans to solicit donations for the local food bank.", "The campaign manager will solicit public opinion via surveys."],
    reprimand: ["The teacher gave him a stern reprimand for being late.", "After the mistake, the employee received a formal reprimand."],
    freight: ["The train carries a heavy freight of lumber and steel.", "The company pays extra to have the freight handled carefully."],
    devote: ["She will devote her time entirely to the new project.", "She chose to devote her Sunday morning to gardening."],
    periodical: ["A science periodical arrives in the mail every month.", "Check the scientific periodical for the latest discoveries."],
    periodic: ["The Earth experiences periodic solar eclipses.", "Maintenance on the machinery is a periodic necessity."],
    conquered: ["The army successfully conquered the enemy stronghold.", "The small team felt conquered by the sheer amount of work."],
    inquire: ["I will inquire about the job openings tomorrow.", "I will inquire with the landlord about the rent payment."],
    coordinate: ["We need to coordinate our schedules for the meeting.", "He was hired to coordinate the efforts of three different departments."],
    delineate: ["The architect needs to delineate the floor plan clearly.", "The map helps to delineate the national park's boundaries."],
    make: ["He decided to make a wooden shelf for the kitchen.", "We need to make a decision before the deadline passes."],
    initiate: ["The group will initiate the fundraising campaign next week.", "The speaker helped initiate a discussion on climate change."],
    protagonist: ["The protagonist faced a difficult moral choice.", "Hamlet is the tormented protagonist of Shakespeare's play."],
    reconcile: ["They found a way to reconcile their differences and work together.", "It took weeks to reconcile the two conflicting reports."],
  },
  wordList: [
    {
        "id": 3,
        "word": "solicit",
        "description": "(vi) request",
        "instance": "solicit nomination of candidate",
        "translation": "徵求",
        "level": 0
    },
    {
        "id": 4,
        "word": "reprimand",
        "description": "v. blaming",
        "instance": "Teachers are advised to reprimand a child who misbehaves",
        "translation": "責怪",
        "level": 1
    },
    {
        "id": 5,
        "word": "freight",
        "description": "(n) cargo, charge for shippment",
        "instance": "The air freight is three times the cost of sending the goods by sea",
        "translation": "貨物",
        "level": 1
    },
    {
        "id": 6,
        "word": "devote",
        "description": "(vt.) sacrificed",
        "instance": "devote myself to education",
        "translation": "",
        "level": 1
    },
    {
        "id": 7,
        "word": "periodical",
        "description": "(n) journal",
        "instance": "weekly periodical",
        "translation": "期刊",
        "level": 4
    },
    {
        "id": 8,
        "word": "periodic",
        "description": "(adj) regular, cyclical",
        "instance": "The class had a periodic review of the material.\n",
        "translation": "週期的",
        "level": 5
    },
    {
        "id": 9,
        "word": "conquered",
        "description": "(v) overcome",
        "instance": "n 1393, the town was conquered by the Ottoman army and burned to the ground.",
        "translation": "克服",
        "level": 2
    },
    {
        "id": 10,
        "word": "inquire",
        "description": "(vi) asking for research",
        "instance": "For any further information inquire at your town hall.",
        "translation": "",
        "level": 1
    },
    {
        "id": 11,
        "word": "coordinate",
        "description": "(v) suitable",
        "instance": "coordinate with",
        "translation": "適合",
        "level": 2
    },
    {
        "id": 12,
        "word": "delineate",
        "description": "v. describe or portray (something) precisely.\nv. indicate the exact position of (a border or boundary).",
        "instance": "the lines that delineate the parking spaces have faded",
        "translation": "",
        "level": 3
    },
    {
        "id": 13,
        "word": "make use of",
        "description": "(v) take advance of",
        "instance": "We might as well make use of the hotel's facilities.",
        "translation": "利用",
        "level": 3
    },
    {
        "id": 14,
        "word": "initiate",
        "description": "vt. begin from\nn. someone who has been inducted into a group",
        "instance": "A potential initiate is hardly going to stumble upon a support group this small.",
        "translation": "",
        "level": 0
    },
    {
        "id": 15,
        "word": "protagonist",
        "description": "(n) main charactor",
        "instance": "The protagonist of the novel faced a difficult moral dilemma.\n",
        "translation": "",
        "level": 4
    },
    {
        "id": 16,
        "word": "reconcile",
        "description": "(v) settle or resolve something",
        "instance": "This kind of thing can reconcile you to camping.",
        "translation": "調停",
        "level": 0
    }
  ]
}