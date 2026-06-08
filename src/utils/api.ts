import { useCallback } from 'react';
import { postData } from '@/utils/fetch';
import { useGlobalSettings } from '@/context/GlobalSetting/context';
import { getMockGenDefinition, getMockGenSentence } from '@/mock';

export type GenerateSubject = 'word' | 'phrase';
export type GenerateAction = 'getInstance' | 'getDefinition' | 'getComparison';

type GenerateTextOptions = {
  endpoint?: string;
  token?: string;
  isDemo: boolean;
  isOffline?: boolean;
};

type GenerateWordResponse = {
  status: string;
  message: string;
  data?: string;
};

function buildApiUrl(endpoint: string, token: string): string {
  const params = new URLSearchParams();
  params.set('token', token);
  params.set('t', Date.now().toString());
  return `${endpoint}?${params.toString()}`;
}

async function generateTextInternal(
  word: string,
  subject: GenerateSubject,
  action: GenerateAction,
  options: GenerateTextOptions
): Promise<string | undefined> {
  const { endpoint, token, isDemo, isOffline } = options;
  if (!word) return undefined;

  if (isDemo) {
    if (action === 'getDefinition') {
      return await getMockGenDefinition(word, 1000);
    }
    if (action === 'getInstance') {
      return await getMockGenSentence(word, 1000);
    }
  }

  if (isOffline) {
    return undefined;
  }

  if (!endpoint || !token) {
    return undefined;
  }

  try {
    const url = buildApiUrl(endpoint, token);
    const result = await postData<GenerateWordResponse>(url, {
      subject,
      action,
      data: [word],
    });
    if (result && result.status !== 'error') {
      return result.data;
    }
  } catch (error) {
    console.error(error);
  }

  return undefined;
}

export function useGenerateText() {
  const { endpoint, token, isDemo, isOffline } = useGlobalSettings();

  return useCallback(
    async (word: string, subject: GenerateSubject, action: GenerateAction) => {
      return generateTextInternal(word, subject, action, {
        endpoint,
        token,
        isDemo,
        isOffline,
      });
    },
    [endpoint, token, isDemo, isOffline]
  );
}
