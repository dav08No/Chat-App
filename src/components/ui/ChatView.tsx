'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import MessageBox from './MessageBox'

type ChatViewProps = {
  initialMessages?: Message[]
  me: string
  conversationId: string
}

export default function ChatView({ initialMessages, me, conversationId }: ChatViewProps) {

  const [messages, setMessages] = useState<Message[]>(initialMessages || [])

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

    return () => {
      supabase.removeChannel(messageChannel)
    }
  }, [conversationId])

  return (
    <div>
      {messages.map((message: Message) => (
        <MessageBox key={message.id} {...message} />
      ))}
    </div>
  )
}

