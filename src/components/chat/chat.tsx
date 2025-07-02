'use client';

import type { UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';  // AI SDK for React
// This AI SDK helps manage messages, input , also communication with the AI backend 
//This also means it is ready to be used as my AI Assistant.
import { useEffect, useState } from 'react';
import { generateUUID } from '@/lib/utils';
import { MultimodalInput } from '../chat/multimodal-input';
import { Messages } from './messages';
import { toast } from "sonner"
import { useSearchParams } from 'next/navigation';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  autoResume,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  autoResume: boolean;
}) {

  const {
    messages,
    handleSubmit,
    input,
    setInput,
    setMessages,
    append,
    status,
    stop,
    experimental_resume,
  } = useChat({
    id,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    experimental_prepareRequestBody: (body) => ({
      id,
      messages: body.messages,
      selectedChatModel: initialChatModel,
    }),
    // onFinish: () => {
    // },
    onError: (error) => {
      toast.error(error.message)
    },
  });

  useEffect(() => {
    if (autoResume) {
      experimental_resume();
    }

    // note: this hook has no dependencies since it only needs to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      append({
        role: 'user',
        content: query,
      });

      setHasAppendedQuery(true);
      // window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, append, hasAppendedQuery, id]);

  return (
    <div className='relative'>
      <div className="flex flex-col h-full">
        <Messages
          chatId={id}
          status={status}
          messages={messages}
        />

        <form className="flex mx-auto bg-transparent gap-2 fixed bottom-4 left-4 right-4">
          <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
        </form>
      </div>
    </div>
  );
}