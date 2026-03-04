'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CHAT_COLLECTION = 'messages';
const MAX_MESSAGES = 500;

export interface ChatMessage {
  id: string;
  text: string;
  createdAt: Timestamp | null;
}

/**
 * Firestore 실시간 채팅 훅
 */
export const useFirebaseChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Firestore 실시간 리스너
    const q = query(
      collection(db, CHAT_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(MAX_MESSAGES)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          msgs.push({
            id: doc.id,
            ...(doc.data() as Omit<ChatMessage, 'id'>),
          });
        });
        // 최신순으로 정렬 (역순)
        setMessages(msgs.reverse());
        setLoading(false);
      },
      (err) => {
        console.error('채팅 로딩 오류:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * 메시지 전송
   */
  const sendMessage = async (text: string): Promise<void> => {
    try {
      await addDoc(collection(db, CHAT_COLLECTION), {
        text,
        createdAt: serverTimestamp(),
      });

      // 500개 초과 시 오래된 메시지 삭제
      await cleanupOldMessages();
    } catch (err) {
      console.error('메시지 전송 오류:', err);
      throw err;
    }
  };

  /**
   * 500개 초과 메시지 삭제
   */
  const cleanupOldMessages = async (): Promise<void> => {
    try {
      const q = query(
        collection(db, CHAT_COLLECTION),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);

      if (snapshot.size > MAX_MESSAGES) {
        const deleteCount = snapshot.size - MAX_MESSAGES;
        const docsToDelete: any[] = [];

        snapshot.docs.forEach((doc, index) => {
          if (index < deleteCount) {
            docsToDelete.push(doc.ref);
          }
        });

        // 병렬 삭제
        await Promise.all(docsToDelete.map((ref) => deleteDoc(ref)));
        console.log(`🗑️  오래된 메시지 ${deleteCount}개 삭제`);
      }
    } catch (err) {
      console.error('메시지 정리 오류:', err);
    }
  };

  return {
    messages,
    sendMessage,
    loading,
    error,
  };
};
