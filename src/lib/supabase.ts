import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// These values would normally come from environment variables
// For MVP purposes, we're using public demo credentials that have limited capabilities
// In a production app, use proper environment variables for these values
const supabaseUrl = 'https://zvpgozkvefpdjcubjmgl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cGdvemt2ZWZwZGpjdWJqbWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NjkyNTksImV4cCI6MjA2MzU0NTI1OX0.uVn7PbOlchqAVxPXIPt6faii8bvSx0vbwaNbN0-M4fY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signUp(email: string, password: string, userData: { 
  full_name: string;
  role: 'teacher' | 'student';
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}