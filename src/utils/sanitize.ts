import DOMPurify from 'dompurify';

/**
 * XSS 공격 방지를 위한 HTML sanitize
 * @param dirty - 정제할 문자열
 * @returns 정제된 문자열
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // HTML 태그 모두 제거
    ALLOWED_ATTR: [],
  });
};

interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}

/**
 * 채팅 메시지 검증 및 정제
 * @param message - 채팅 메시지
 * @returns 검증 결과 및 정제된 메시지
 */
export const validateAndSanitizeChatMessage = (
  message: string
): ValidationResult => {
  // 빈 메시지 체크
  if (!message || message.trim().length === 0) {
    return {
      isValid: false,
      sanitized: '',
      error: '메시지를 입력해주세요.',
    };
  }

  // 길이 제한 (200자)
  if (message.length > 200) {
    return {
      isValid: false,
      sanitized: '',
      error: '메시지는 200자 이하로 입력해주세요.',
    };
  }

  // HTML sanitize
  const sanitized = sanitizeHTML(message.trim());

  // Sanitize 후 내용이 비었으면 유효하지 않음
  if (sanitized.length === 0) {
    return {
      isValid: false,
      sanitized: '',
      error: '올바른 메시지를 입력해주세요.',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
};
