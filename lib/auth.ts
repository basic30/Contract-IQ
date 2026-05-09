import { createClient } from '@/lib/supabase';

export async function signUp(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=/auth/verify-success`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, userId: data.user?.id };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  }); 

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, token: data.session?.access_token };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = createClient();
  
  // Get the currently authenticated user session from Supabase
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return null;

  // Fetch the user's history preference from the 'profiles' table
  const { data: profile } = await supabase
    .from('profiles')
    .select('history_enabled')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    historyEnabled: profile?.history_enabled ?? true
  };
}

export async function updateHistoryPreference(userId: string, enabled: boolean) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ history_enabled: enabled })
    .eq('id', userId);

  return !error;
}