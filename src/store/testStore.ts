import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Test = Database['public']['Tables']['tests']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type TestResult = Database['public']['Tables']['test_results']['Row'];

interface TestState {
  tests: Test[];
  currentTest: (Test & { questions: Question[] }) | null;
  isLoading: boolean;
  error: string | null;
  
  // Teacher actions
  createTest: (test: Omit<Test, 'id' | 'created_at'>, questions: Omit<Question, 'id' | 'created_at' | 'test_id'>[]) => Promise<string | null>;
  getTeacherTests: (teacherId: string) => Promise<void>;
  getTestResults: (testId: string) => Promise<TestResult[]>;
  
  // Student actions
  getAvailableTests: () => Promise<void>;
  getTestById: (id: string) => Promise<void>;
  submitTestResult: (result: Omit<TestResult, 'id' | 'completed_at'>) => Promise<void>;
  getStudentResults: (studentId: string) => Promise<TestResult[]>;
  
  // Shared actions
  clearCurrentTest: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  tests: [],
  currentTest: null,
  isLoading: false,
  error: null,
  
  createTest: async (testData, questionsData) => {
    set({ isLoading: true, error: null });
    try {
      // Insert test
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert([testData])
        .select()
        .single();
      
      if (testError) throw testError;
      if (!test) throw new Error('Failed to create test');
      
      // Insert questions
      const questionsWithTestId = questionsData.map((q, index) => ({
        ...q,
        test_id: test.id,
        order: index + 1,
      }));
      
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsWithTestId);
      
      if (questionsError) throw questionsError;
      
      return test.id;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  getTeacherTests: async (teacherId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('created_by', teacherId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ tests: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  getTestResults: async (testId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*, profiles(full_name)')
        .eq('test_id', testId)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      set({ error: (error as Error).message });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  
  getAvailableTests: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ tests: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  getTestById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Get test
      const { data: test, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (testError) throw testError;
      
      // Get questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', id)
        .order('order', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      set({ 
        currentTest: { 
          ...test, 
          questions: questions || [] 
        } 
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  submitTestResult: async (resultData) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('test_results')
        .insert([resultData]);
      
      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  getStudentResults: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*, tests(title, topic, difficulty)')
        .eq('user_id', studentId)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      set({ error: (error as Error).message });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearCurrentTest: () => {
    set({ currentTest: null });
  },
}));