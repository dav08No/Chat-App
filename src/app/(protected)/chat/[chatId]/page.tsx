import { createClientForServer } from '@/lib/supabaseServer'
import ChatView from '@/components/ui/ChatView'
import { redirect } from 'next/navigation'

export default async function ChatPage(params: Promise<{ conversationId: string }>) {
  const supabase = await createClientForServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')
  const me = user.id
  const { conversationId } = await params

  const { data: membership } = await supabase
    .from('members')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', me)
    .maybeSingle()

  if (!membership) {
    redirect('/chat')
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Error fetching messages:', error)
    redirect('/chat')
  }

  async function handleSendMessage(content: string) {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: me,
        content: content,
        edited_at: null,
        deleted_at: null,
        isReaded: false
      })

    if (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div>
      <ChatView
        initialMessages={messages ?? []}
        me={me}
        conversationId={conversationId}
        onSend={handleSendMessage}
      />
    </div>
  )
}
