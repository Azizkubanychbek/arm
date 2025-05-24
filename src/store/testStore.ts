import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Test = Database['public']['Tables']['tests']['Row'];
type TestQuestion = Database['public']['Tables']['test_questions']['Row'];
type TestSubmission = Database['public']['Tables']['test_submissions']['Row'];
type TestResult = Database['public']['Tables']['test_results']['Row'];

interface TestState {
  tests: Test[];
  currentTest: (Test & { test_questions: TestQuestion[] }) | null;
  isLoading: boolean;
  error: string | null;
  
  // Teacher actions
  createTest: (test: Omit<Test, 'id' | 'created_at' | 'updated_at'>, questions: Omit<TestQuestion, 'id' | 'created_at' | 'test_id'>[]) => Promise<string | null>;
  getTeacherTests: (teacherId: string) => Promise<void>;
  getTestSubmissions: (testId: string) => Promise<TestSubmission[]>;
  
  // Student actions
  getAvailableTests: () => Promise<void>;
  getTestById: (id: string) => Promise<void>;
  submitTestResult: (result: Omit<TestSubmission, 'id' | 'started_at' | 'completed_at' | 'graded_at'>) => Promise<void>;
  getStudentResults: (studentId: string) => Promise<TestSubmission[]>;
  
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
        order_index: index + 1,
      }));
      
      const { error: questionsError } = await supabase
        .from('test_questions')
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
  
  getTestSubmissions: async (testId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('test_submissions')
        .select(`
          *,
          profiles!test_submissions_student_id_fkey(full_name, email)
        `)
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
        .eq('is_active', true)
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
      // Get test with questions
      const { data: testWithQuestions, error } = await supabase
        .from('tests')
        .select(`
          *,
          test_questions (
            id,
            question_text,
            question_type,
            options,
            correct_answer,
            explanation,
            points,
            order_index
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      if (!testWithQuestions) throw new Error('Test not found');
      
      // Sort questions by order_index
      const sortedQuestions = (testWithQuestions.test_questions || [])
        .sort((a, b) => a.order_index - b.order_index);
      
      set({ 
        currentTest: { 
          ...testWithQuestions, 
          test_questions: sortedQuestions
        } 
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  submitTestResult: async (submissionData) => {
    set({ isLoading: true, error: null });
    try {
      // Insert test submission
      const { data: submission, error: submissionError } = await supabase
        .from('test_submissions')
        .insert([{
          ...submissionData,
          completed_at: new Date().toISOString(),
          status: 'completed'
        }])
        .select()
        .single();
      
      if (submissionError) throw submissionError;
      if (!submission) throw new Error('Failed to create submission');
      
      // Get current test to create detailed results
      const currentTest = get().currentTest;
      if (currentTest && currentTest.test_questions) {
        const results = currentTest.test_questions.map(question => ({
          submission_id: submission.id,
          question_id: question.id,
          student_answer: submissionData.answers[question.id] || '',
          correct_answer: question.correct_answer,
          is_correct: submissionData.answers[question.id] === question.correct_answer,
          points_earned: submissionData.answers[question.id] === question.correct_answer 
            ? (question.points || 1) : 0,
          points_possible: question.points || 1
        }));
        
        const { error: resultsError } = await supabase
          .from('test_results')
          .insert(results);
        
        if (resultsError) throw resultsError;
      }
      
    } catch (error) {
      set({ error: (error as Error).message });
      throw error; // Re-throw to handle in component
    } finally {
      set({ isLoading: false });
    }
  },
  
  getStudentResults: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('test_submissions')
        .select(`
          *,
          tests (
            title,
            subject,
            difficulty,
            total_questions
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'completed')
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