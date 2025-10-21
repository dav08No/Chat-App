import { createClientForServer } from '@/lib/supabaseServer'

export default async function ChatPage() {

  const supabase = await createClientForServer();

  return (
    <div>

    </div>
  )
}
