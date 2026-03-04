"use client";

import { useStocks } from "@/hooks/useStocks";
import StockOverlay from "@/components/StockOverlay";
import ChatPanel from "@/components/ChatPanel";
import DateTimeDisplay from "@/components/DateTimeDisplay";
import { STOCK_CODES } from "@/lib/constants";

export default function Home() {
  const { stocks, isLoading } = useStocks();

  return (
    <div className="app">
      {/* 메인 이미지 영역 */}
      <div className="main-content">
        {/* 로딩 상태 표시 */}
        {isLoading && (
          <div className="connection-status disconnected">
            🔄 데이터 로딩 중...
          </div>
        )}

        <div className="main-background">
          <div className="image-wrapper">
            <img
              src="/default.jpg"
              alt="Main Background"
              className="background-image"
            />

            {/* 주가 오버레이 */}
            <StockOverlay stock={stocks[STOCK_CODES.SAMSUNG]} position="left" />
            <StockOverlay
              stock={stocks[STOCK_CODES.HYUNDAI]}
              position="center"
            />
            <StockOverlay stock={stocks[STOCK_CODES.NVIDIA]} position="right" />
          </div>
        </div>
      </div>

      {/* 채팅 패널 */}
      <ChatPanel />
    </div>
  );
}
