'use server'
import React from 'react'
import { redirect } from 'next/navigation'
import { createClientForServer } from '@/lib/supabaseServer'
import SidebarShell from './SidebarShell'
import { SupabaseClient } from '@supabase/supabase-js'

type SidebarProps = {
  userId: string
}

async function logoutAction() {
  'use server'
  const supabase = await createClientForServer()
  await supabase.auth.signOut()
  redirect('/auth/signin')
}

export default async function Sidebar({ userId }: SidebarProps) {
  const supabase = await createClientForServer();

  const { data: { user } } = await supabase.auth.getUser()
  if(!user) redirect('/auth/signin')
  const me = user?.id

  const [profileResult, conversationsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', me)
      .maybeSingle(),
    supabase
      .from('members')
      .select('conversation_id, conversations ( id, title, is_group, created_at )')
      .eq('user_id', me)
      .order('created_at', { foreignTable: 'conversations', ascending: false }),
  ])

  async function startNewConversation(invitedUserId: string) {
    'use server'

    const supabaseClient = await createClientForServer()

    if (invitedUserId === me || !invitedUserId) {
      throw new Error('Invited user ID is required and cannot be the same as the current user ID.')
    }

    let lowerId: string
    let higherId: string

    if (me < invitedUserId) {
      lowerId = me
      higherId = invitedUserId
    } else {
      lowerId = invitedUserId
      higherId = me
    }

    const pairKey = `${lowerId}_${higherId}`

    const { data: exististingDm, error: existingDmError } = await supabaseClient
      .from('direct_messages')
      .select('conversation_id')
      .eq('pair_key', pairKey)
      .maybeSingle();

    if (existingDmError && existingDmError.code !== 'PGRST116') {
      console.error('Error checking existing direct message:', existingDmError)
      throw new Error('Failed to check existing direct message.')
    }

    if (exististingDm && exististingDm.conversation_id) {
      redirect(`/chat/${exististingDm.conversation_id}`);
    }

    const { data: newConversation, error: conversationError } = await supabaseClient
      .from('conversations')
      .insert({ is_group: false, created_by: me, title: null, last_message_at: new Date().toISOString() })
      .select('id')
      .single();

      if (conversationError || !newConversation.id) {
        console.error('Error creating new conversation:', conversationError, newConversation)
        throw new Error('Failed to create new conversation.')
      }
    const newConversationId = newConversation.id;


    const { error: membersError } = await supabaseClient
      .from('direct_messages')
      .insert({ conversation_id: newConversationId, user_a: me, user_b: invitedUserId });
    if (membersError) {
      console.error('Error creating direct message entry:', membersError)
      throw new Error('Failed to create direct message entry.')
    }

    const { error: membersInsertError } = await supabaseClient
      .from('members')
      .insert([
        { conversation_id: newConversationId, user_id: me, last_read_at: new Date().toISOString(), role: 'member' },
        { conversation_id: newConversationId, user_id: invitedUserId, last_read_at: new Date().toISOString(), role: 'member' },
      ]);

    if (membersInsertError) {
      console.error('Error adding members to conversation:', membersInsertError)
      throw new Error('Failed to add members to conversation.')
    }

    redirect(`/chat/${newConversationId}`);

  }

  async function getUserId(name: string) {
    'use server'
    if (!name) {
      return undefined
    }

    const supabaseClient = await createClientForServer()

    const { data } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('display_name', name)
      .maybeSingle();

    return data?.id;
  }

  async function searchProfiles(query: string) {
    'use server'
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      return []
    }

    const supabaseClient = await createClientForServer()

    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id, display_name')
      .ilike('display_name', `%${trimmedQuery}%`)
      .neq('id', me)
      .limit(5);

    if (error || !data) {
      console.error('Fehler beim Suchen nach Profilen', error)
      return []
    }

    return data
      .filter(
        (profile): profile is { id: string; display_name: string } =>
          Boolean(profile.display_name),
      )
      .map((profile) => ({
        id: profile.id,
        displayName: profile.display_name,
      }))
  }

  return (
    <SidebarShell
      profileResult={profileResult}
      conversationsResult={conversationsResult}
      userId={me}
      logoutAction={logoutAction}
      startNewConversation={startNewConversation}
      getUserId={getUserId}
      searchProfiles={searchProfiles}
    />
  )
}
