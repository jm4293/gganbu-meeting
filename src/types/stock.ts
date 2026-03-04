export type MarketStatus = 'premarket' | 'regular' | 'aftermarket' | 'closed';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  basePrice: number;
  change: number;
  changeRate: number;
  // 프리마켓/애프터마켓 가격 정보
  preMarketPrice?: number;
  preMarketChange?: number;
  preMarketChangePercent?: number;
  postMarketPrice?: number;
  postMarketChange?: number;
  postMarketChangePercent?: number;
  regularMarketPrice?: number;
  // 현재 시장 상태
  marketStatus: MarketStatus;
}

export interface StockResponse {
  [key: string]: StockData;
}
