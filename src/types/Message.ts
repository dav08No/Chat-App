type Message = {
  id: string,
  conversation_id: string,
  sender_id: string,
  content: string,
  edited_at: string | null,
  deleted_at: string | null,
  created_at: string
  isReaded: boolean | null
}