/**
 * Google Analytics 4 (GA4) 유틸리티
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let isInitialized = false;

/**
 * GA4 초기화
 */
export const initGA = (): void => {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Measurement ID가 없거나 이미 초기화된 경우 종료
  if (!measurementId || measurementId === 'G-XXXXXXXXXX' || isInitialized) {
    return;
  }

  // gtag 스크립트 로드
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // gtag 초기화
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
  });

  isInitialized = true;
  console.log('Google Analytics initialized:', measurementId);
};

/**
 * 페이지뷰 이벤트 전송
 * @param path - 페이지 경로
 */
export const logPageView = (path: string): void => {
  if (!isInitialized || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
  });
};

/**
 * 커스텀 이벤트 전송
 * @param eventName - 이벤트 이름
 * @param parameters - 이벤트 파라미터
 */
export const logEvent = (eventName: string, parameters: Record<string, any> = {}): void => {
  if (!isInitialized || !window.gtag) return;

  window.gtag('event', eventName, parameters);
};

/**
 * 사용자 속성 설정
 * @param properties - 사용자 속성
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  if (!isInitialized || !window.gtag) return;

  window.gtag('set', 'user_properties', properties);
};
