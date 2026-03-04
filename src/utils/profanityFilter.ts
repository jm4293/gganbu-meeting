/**
 * 욕설 필터 (현재는 빈 배열, 추후 확장 가능)
 */
const PROFANITY_LIST: string[] = [
  // 욕설 단어 추가 (예시)
  // '욕설1',
  // '욕설2',
];

interface ProfanityFilterResult {
  hasProfanity: boolean;
  filtered: string;
}

/**
 * 욕설 필터링
 * @param text - 검사할 텍스트
 * @returns 욕설 포함 여부 및 필터링된 텍스트
 */
export const filterProfanity = (text: string): ProfanityFilterResult => {
  let filtered = text;
  let hasProfanity = false;

  PROFANITY_LIST.forEach((word) => {
    if (filtered.includes(word)) {
      hasProfanity = true;
      // 욕설을 * 로 대체
      const replacement = '*'.repeat(word.length);
      filtered = filtered.replaceAll(word, replacement);
    }
  });

  return {
    hasProfanity,
    filtered,
  };
};

/**
 * 욕설이 포함되어 있는지만 체크
 * @param text - 검사할 텍스트
 * @returns 욕설 포함 여부
 */
export const containsProfanity = (text: string): boolean => {
  return PROFANITY_LIST.some((word) => text.includes(word));
};
