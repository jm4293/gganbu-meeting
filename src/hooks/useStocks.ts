'use client';

import useSWR from 'swr';
import { StockResponse } from '@/types/stock';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * SWR을 사용한 주식 데이터 폴링 훅
 * 10초마다 자동으로 데이터를 갱신합니다
 */
export function useStocks() {
  const { data, error, isLoading } = useSWR<StockResponse>(
    '/api/stocks',
    fetcher,
    {
      refreshInterval: 10000, // 10초마다 폴링
      revalidateOnFocus: true, // 탭 포커스 시 재검증
      revalidateOnReconnect: true, // 재연결 시 재검증
    }
  );

  return {
    stocks: data || {},
    isLoading,
    isError: error,
  };
}
