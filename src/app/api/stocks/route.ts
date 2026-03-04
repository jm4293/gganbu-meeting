import { NextResponse } from 'next/server';
import { STOCK_CODES, BASE_PRICES } from '@/lib/constants';
import { StockData, StockResponse, MarketStatus } from '@/types/stock';

let accessToken: string | null = null;

/**
 * LS 증권 OAuth 토큰 발급
 */
async function getAccessToken(): Promise<string> {
  const url = 'https://openapi.ls-sec.co.kr:8080/oauth2/token';

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    appkey: process.env.LS_APP_KEY || '',
    appsecretkey: process.env.LS_APP_SECRET || '',
    scope: 'oob',
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`토큰 발급 실패 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    console.log('✅ LS 증권 토큰 발급 성공');
    return accessToken as string;
  } catch (error) {
    console.error('❌ LS 증권 토큰 발급 실패:', error);
    throw error;
  }
}

/**
 * LS 증권 REST API로 주식 현재가 조회
 */
async function getLSStockPrice(stockCode: string): Promise<StockData | null> {
  if (!accessToken) {
    await getAccessToken();
  }

  const url = 'https://openapi.ls-sec.co.kr:8080/stock/market-data';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        authorization: `Bearer ${accessToken}`,
        tr_cd: 't1101',
        tr_cont: 'N',
        tr_cont_key: '',
      },
      body: JSON.stringify({
        t1101InBlock: {
          shcode: stockCode,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 요청 실패 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return parseLSStockData(data, stockCode);
  } catch (error) {
    console.error(`❌ ${stockCode} 가격 조회 실패:`, error);
    return null;
  }
}

/**
 * LS 증권 주식 데이터 파싱
 */
function parseLSStockData(data: any, stockCode: string): StockData | null {
  try {
    const outBlock = data.t1101OutBlock;
    if (!outBlock) {
      console.error('t1101OutBlock이 없습니다:', data);
      return null;
    }

    const currentPrice = parseFloat(outBlock.price || outBlock.curprice || 0);

    if (currentPrice === 0) {
      console.error('가격 정보가 없습니다:', outBlock);
      return null;
    }

    let stockBasePrice: number;
    let stockName: string;

    if (stockCode === STOCK_CODES.SAMSUNG) {
      stockBasePrice = BASE_PRICES.SAMSUNG;
      stockName = '삼성전자';
    } else if (stockCode === STOCK_CODES.HYUNDAI) {
      stockBasePrice = BASE_PRICES.HYUNDAI;
      stockName = '현대차';
    } else {
      return null;
    }

    const change = currentPrice - stockBasePrice;
    const changeRate = (change / stockBasePrice) * 100;

    return {
      symbol: stockCode,
      name: stockName,
      price: currentPrice,
      basePrice: stockBasePrice,
      change: change,
      changeRate: changeRate,
      marketStatus: 'regular' as MarketStatus,
    };
  } catch (error) {
    console.error('데이터 파싱 오류:', error);
    return null;
  }
}

/**
 * Yahoo Finance REST API로 주식 현재가 조회
 */
async function getYahooStockPrice(symbol: string): Promise<StockData | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API 요청 실패 (${response.status})`);
    }

    const data = await response.json();
    return parseYahooStockData(data, symbol);
  } catch (error) {
    console.error(`❌ ${symbol} 가격 조회 실패:`, error);
    return null;
  }
}

/**
 * 현재 시장 상태 판단 (미국 시장 기준, 한국 시간)
 */
function getCurrentMarketStatus(): MarketStatus {
  const now = new Date();
  const koreaHours = now.getHours();
  const koreaMinutes = now.getMinutes();
  const currentTime = koreaHours * 60 + koreaMinutes;

  // 프리마켓: 전날 밤 11시 ~ 새벽 2:30 (한국시간)
  // 시간 처리: 23:00-23:59는 당일, 00:00-02:30은 다음날
  const preMarketStart = 23 * 60; // 23:00
  const regularStart = 2 * 60 + 30; // 02:30
  const regularEnd = 9 * 60; // 09:00
  const afterMarketEnd = 13 * 60; // 13:00

  // 프리마켓 (23:00 ~ 23:59 또는 00:00 ~ 02:30)
  if (currentTime >= preMarketStart || currentTime < regularStart) {
    return 'premarket';
  }
  // 정규장 (02:30 ~ 09:00)
  else if (currentTime >= regularStart && currentTime < regularEnd) {
    return 'regular';
  }
  // 애프터마켓 (09:00 ~ 13:00)
  else if (currentTime >= regularEnd && currentTime < afterMarketEnd) {
    return 'aftermarket';
  }
  // 장 마감
  else {
    return 'closed';
  }
}

/**
 * Yahoo Finance 주식 데이터 파싱
 */
function parseYahooStockData(data: any, symbol: string): StockData | null {
  try {
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const basePrice = BASE_PRICES.NVIDIA;

    // 현재 시장 상태 확인
    const marketStatus = getCurrentMarketStatus();

    // 정규장 가격
    const regularMarketPrice = meta.regularMarketPrice;

    // 프리마켓 가격
    const preMarketPrice = meta.preMarketPrice;
    const preMarketChange = meta.preMarketChange;
    const preMarketChangePercent = meta.preMarketChangePercent;

    // 애프터마켓 가격
    const postMarketPrice = meta.postMarketPrice;
    const postMarketChange = meta.postMarketChange;
    const postMarketChangePercent = meta.postMarketChangePercent;

    // 현재 시장 상태에 따라 표시할 가격 결정
    let currentPrice = regularMarketPrice;
    if (marketStatus === 'premarket' && preMarketPrice) {
      currentPrice = preMarketPrice;
    } else if (marketStatus === 'aftermarket' && postMarketPrice) {
      currentPrice = postMarketPrice;
    } else if (marketStatus === 'closed') {
      currentPrice = regularMarketPrice || meta.previousClose;
    }

    const change = currentPrice - basePrice;
    const changeRate = (change / basePrice) * 100;

    return {
      symbol: STOCK_CODES.NVIDIA,
      name: 'NVIDIA',
      price: parseFloat(currentPrice.toFixed(2)),
      basePrice: basePrice,
      change: parseFloat(change.toFixed(2)),
      changeRate: changeRate,
      // 프리마켓/애프터마켓 정보
      preMarketPrice: preMarketPrice ? parseFloat(preMarketPrice.toFixed(2)) : undefined,
      preMarketChange: preMarketChange ? parseFloat(preMarketChange.toFixed(2)) : undefined,
      preMarketChangePercent: preMarketChangePercent ? parseFloat(preMarketChangePercent.toFixed(2)) : undefined,
      postMarketPrice: postMarketPrice ? parseFloat(postMarketPrice.toFixed(2)) : undefined,
      postMarketChange: postMarketChange ? parseFloat(postMarketChange.toFixed(2)) : undefined,
      postMarketChangePercent: postMarketChangePercent ? parseFloat(postMarketChangePercent.toFixed(2)) : undefined,
      regularMarketPrice: regularMarketPrice ? parseFloat(regularMarketPrice.toFixed(2)) : undefined,
      marketStatus,
    };
  } catch (error) {
    console.error('데이터 파싱 오류:', error);
    return null;
  }
}

/**
 * GET /api/stocks - 모든 주식 데이터 조회
 */
export async function GET() {
  try {
    const [samsung, hyundai, nvidia] = await Promise.all([
      getLSStockPrice(STOCK_CODES.SAMSUNG),
      getLSStockPrice(STOCK_CODES.HYUNDAI),
      getYahooStockPrice(STOCK_CODES.NVIDIA),
    ]);

    const stocks: StockResponse = {};

    if (samsung) stocks[STOCK_CODES.SAMSUNG] = samsung;
    if (hyundai) stocks[STOCK_CODES.HYUNDAI] = hyundai;
    if (nvidia) stocks[STOCK_CODES.NVIDIA] = nvidia;

    return NextResponse.json(stocks);
  } catch (error) {
    console.error('주식 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
