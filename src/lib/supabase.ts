import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

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
  try {
    // Регистрация пользователя в Auth с метаданными
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role,
        },
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return { data: null, error: authError };
    }

    // Профиль будет создан автоматически через триггер handle_new_user
    return { data: authData, error: null };

  } catch (error: any) {
    console.error('Unexpected error during signup:', error);
    return { data: null, error: { message: error.message || 'Unexpected error occurred' } };
  }
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

// Получение профиля пользователя
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
}

// Получение текущего профиля пользователя
export async function getCurrentUserProfile() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: { message: 'Not authenticated' } };
  
  return getUserProfile(user.id);
}

// Создание теста
export async function createTest(testData: {
  title: string;
  description?: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_minutes?: number;
  max_attempts?: number;
}) {
  const { data, error } = await supabase
    .from('tests')
    .insert(testData)
    .select()
    .single();
  
  return { data, error };
}

// Получение тестов
export async function getTests(filters?: {
  subject?: string;
  difficulty?: string;
  created_by?: string;
}) {
  let query = supabase
    .from('tests')
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .eq('is_active', true);

  if (filters?.subject) {
    query = query.eq('subject', filters.subject);
  }
  
  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }
  
  if (filters?.created_by) {
    query = query.eq('created_by', filters.created_by);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
}

// Получение вопросов теста
export async function getTestQuestions(testId: string) {
  const { data, error } = await supabase
    .from('test_questions')
    .select('*')
    .eq('test_id', testId)
    .order('order_index');
  
  return { data, error };
}

// Создание вопроса
export async function createTestQuestion(questionData: {
  test_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  points?: number;
  order_index: number;
}) {
  const { data, error } = await supabase
    .from('test_questions')
    .insert(questionData)
    .select()
    .single();
  
  return { data, error };
}

// Создание прохождения теста
export async function createTestSubmission(submissionData: {
  test_id: string;
  submission_type: 'online' | 'offline';
}) {
  const { data, error } = await supabase
    .from('test_submissions')
    .insert(submissionData)
    .select()
    .single();
  
  return { data, error };
}

// Обновление прохождения теста
export async function updateTestSubmission(submissionId: string, updates: {
  answers?: any;
  status?: 'in_progress' | 'completed' | 'graded';
  score?: number;
  max_score?: number;
  percentage?: number;
  time_taken_minutes?: number;
  offline_image_url?: string;
  completed_at?: string;
}) {
  const { data, error } = await supabase
    .from('test_submissions')
    .update(updates)
    .eq('id', submissionId)
    .select()
    .single();
  
  return { data, error };
}

// Получение результатов студента
export async function getStudentSubmissions(studentId?: string) {
  const { data, error } = await supabase
    .from('test_submissions')
    .select(`
      *,
      tests (
        title,
        subject,
        difficulty
      )
    `)
    .eq('student_id', studentId || (await getCurrentUser())?.id)
    .order('created_at', { ascending: false });
  
  return { data, error };
}

// Получение статистики для учителя
export async function getTeacherStatistics(teacherId: string) {
  const { data, error } = await supabase
    .rpc('get_test_statistics', { teacher_id: teacherId });
  
  return { data, error };
}

// Получение анализа ошибок
export async function getErrorAnalysis(teacherId: string) {
  const { data, error } = await supabase
    .rpc('get_error_analysis', { teacher_id: teacherId });
  
  return { data, error };
}