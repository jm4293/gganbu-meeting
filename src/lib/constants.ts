// 2025년 10월 30일 기준 가격 (만난 날)
export const BASE_PRICES = {
  SAMSUNG: 104100, // 삼성전자 (005930.KS)
  HYUNDAI: 265000, // 현대차 (005380.KS)
  NVIDIA: 202.89, // NVIDIA (NVDA)
} as const;

export const BASE_DATE = "2025-10-30";

// 주식 종목 코드
export const STOCK_CODES = {
  SAMSUNG: "005930",
  HYUNDAI: "005380",
  NVIDIA: "NVDA",
} as const;

// 장 시간 (한국 시간 기준)
export const TRADING_HOURS = {
  KR: {
    NXT: {
      start: "08:30",
      end: "09:00",
    },
    REGULAR: {
      start: "09:00",
      end: "15:30",
    },
  },
  US: {
    PREMARKET: {
      start: "23:00", // 전날 밤 11시 (한국시간)
      end: "02:30", // 새벽 2:30 (한국시간)
    },
    REGULAR: {
      start: "02:30", // 새벽 2:30 (한국시간)
      end: "09:00", // 오전 9:00 (한국시간)
    },
    AFTERMARKET: {
      start: "09:00", // 오전 9:00 (한국시간)
      end: "13:00", // 오후 1:00 (한국시간)
    },
  },
} as const;
