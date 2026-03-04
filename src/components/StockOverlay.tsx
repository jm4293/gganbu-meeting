'use client';

import { useState, useEffect } from 'react';
import { StockData } from '@/types/stock';
import './StockOverlay.css';

interface StockOverlayProps {
  stock: StockData | undefined;
  position: 'left' | 'center' | 'right';
}

/**
 * 주가 오버레이 컴포넌트
 */
const StockOverlay = ({ stock, position }: StockOverlayProps) => {
  const [animationClass, setAnimationClass] = useState('');
  const [prevPrice, setPrevPrice] = useState<number | null>(null);

  useEffect(() => {
    if (stock && prevPrice !== null && stock.price !== prevPrice) {
      // 가격 변동 애니메이션
      const isIncrease = stock.price > prevPrice;
      setAnimationClass(isIncrease ? 'price-up' : 'price-down');

      // 애니메이션 종료 후 클래스 제거
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (stock) {
      setPrevPrice(stock.price);
    }
  }, [stock, prevPrice]);

  if (!stock) {
    return (
      <div className={`stock-overlay ${position}`}>
        <div className="stock-card loading">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  const isPositive = stock.changeRate >= 0;
  const sign = isPositive ? '+' : '';

  return (
    <div className={`stock-overlay ${position}`}>
      <div
        className={`stock-card ${isPositive ? 'positive' : 'negative'} ${animationClass}`}
      >
        <div className="change-rate">
          {sign}
          {stock.changeRate.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default StockOverlay;
