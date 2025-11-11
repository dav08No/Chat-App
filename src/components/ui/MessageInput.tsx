import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

type MessageInputProps = {
  onSend: (content: string) => Promise<void>
  conversationId: string
}
export default function MessageInput({ onSend, conversationId }: MessageInputProps) {
  const [content, setContent] = useState<String>('')
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const messageChannel = supabase
      .channel(`messages:conversation_id=eq.${conversationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prevMessages) => {
            if (payload.eventType === 'DELETE') {
              return prevMessages.filter((msg) => msg.id !== payload.old.id)
            } else if (payload.eventType === 'UPDATE') {
              return prevMessages.map((msg) =>
                msg.id === payload.new.id ? payload.new as Message : msg
              )
            } else if (payload.eventType === 'INSERT') {
              return [...prevMessages, payload.new as Message]
            }
            return prevMessages
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(messageChannel) }
  }, [conversationId])

  return (
    <div>
      <input
        type="text"
        value={content as string}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message..."
        className=''
      />
      <button
        onClick={async () => {
          await onSend(content as string)
          setContent('')
        }}
      >
        Send
      </button>
    </div>
  )
}