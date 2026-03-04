"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react";
import { useFirebaseChat } from "@/hooks/useFirebaseChat";
import { validateAndSanitizeChatMessage } from "@/utils/sanitize";
import { filterProfanity } from "@/utils/profanityFilter";
import "./ChatPanel.css";
import { Timestamp } from "firebase/firestore";

const ChatPanel = () => {
  const { messages, sendMessage, loading, error } = useFirebaseChat();
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSendTime = useRef(0);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 스팸 방지 (3초 제한)
    const now = Date.now();
    if (now - lastSendTime.current < 3000) {
      setErrorMessage(
        "메시지를 너무 빠르게 전송하고 있습니다. 3초 후 다시 시도해주세요.",
      );
      return;
    }

    // 검증 및 sanitize
    const validation = validateAndSanitizeChatMessage(inputValue);
    if (!validation.isValid) {
      setErrorMessage(validation.error || "");
      return;
    }

    // 욕설 필터
    const { filtered, hasProfanity } = filterProfanity(validation.sanitized);

    if (hasProfanity) {
      setErrorMessage("부적절한 단어가 포함되어 있습니다.");
      return;
    }

    try {
      setSending(true);
      setErrorMessage("");
      await sendMessage(filtered);
      setInputValue("");
      lastSendTime.current = now;
    } catch (err) {
      setErrorMessage("메시지 전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 에러 메시지 초기화
    if (errorMessage) {
      setErrorMessage("");
    }

    // 글자 수 표시
    if (value.length > 200) {
      setErrorMessage("200자를 초과할 수 없습니다.");
    }
  };

  // 날짜/시간 포맷팅 함수
  const formatDateTime = (timestamp: Timestamp | null): string => {
    if (!timestamp?.toDate) return "방금";

    const messageDate = new Date(timestamp.toDate());

    // 날짜 포맷 (YY.MM.DD)
    const year = String(messageDate.getFullYear()).slice(2);
    const month = String(messageDate.getMonth() + 1).padStart(2, "0");
    const day = String(messageDate.getDate()).padStart(2, "0");
    const dateStr = `${year}.${month}.${day}`;

    // 시간 포맷
    const timeStr = messageDate.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${dateStr} ${timeStr}`;
  };

  if (error) {
    return (
      <div className="chat-panel">
        <div className="chat-error">채팅을 불러올 수 없습니다: {error}</div>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>채팅</h3>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">채팅을 불러오는 중...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">첫 메시지를 남겨보세요!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="chat-message">
              <div className="message-text">{msg.text}</div>
              <div className="message-time">
                {formatDateTime(msg.createdAt)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        {errorMessage && <div className="chat-input-error">{errorMessage}</div>}
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="메시지를 입력하세요 (최대 200자)"
            maxLength={200}
            disabled={sending}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={sending || !inputValue.trim()}
            className="chat-send-btn"
          >
            {sending ? "전송 중..." : "전송"}
          </button>
        </div>
        <div className="chat-char-count">{inputValue.length} / 200</div>
      </form>
    </div>
  );
};

export default ChatPanel;
