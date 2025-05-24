import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTestStore } from '../../store/testStore';
import { Plus, Trash2, Loader, AlertCircle } from 'lucide-react';

interface QuestionFormData {
  text: string;
  options: string[];
  correctOption: number;
}

interface TestFormData {
  title: string;
  description: string;
  subject: string; // Changed from 'topic' to 'subject'
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuestionFormData[];
}

export const CreateTestPage: React.FC = () => {
  const { user } = useAuthStore();
  const { createTest, isLoading, error } = useTestStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'info' | 'questions'>('info');
  
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isValid },
    watch,
  } = useForm<TestFormData>({
    defaultValues: {
      title: '',
      description: '',
      subject: '', // Changed from 'topic' to 'subject'
      difficulty: 'medium',
      questions: [
        {
          text: '',
          options: ['', '', '', ''],
          correctOption: 0,
        },
      ],
    },
    mode: 'onChange',
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });
  
  const watchQuestions = watch('questions');
  
  const onSubmit = async (data: TestFormData) => {
    console.log('Submitting form data:', data);
    if (!user) return;
    
    // Transform questions for API
    const transformedQuestions = data.questions.map((q, index) => ({
      question_text: q.text, // Match database field name
      options: q.options,
      correct_answer: String(q.correctOption), // Convert to string and match field name
      order_index: index + 1, // Match database field name
    }));
    
    const testData = {
      title: data.title,
      description: data.description,
      subject: data.subject, // Changed from 'topic' to 'subject'
      difficulty: data.difficulty,
      created_by: user.id,
    };
    
    const testId = await createTest(testData, transformedQuestions);
    
    if (testId) {
      navigate('/tests/manage');
    }
  };
  
  const addQuestion = () => {
    append({
      text: '',
      options: ['', '', '', ''],
      correctOption: 0,
    });
  };
  
  const isInfoValid = watch('title') && watch('description') && watch('subject'); // Changed from 'topic'
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create a New Test</h1>
        <p className="text-gray-600 mt-1">
          Set up your test questions and details
        </p>
      </div>
      
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="card overflow-visible">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'info'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('info')}
            >
              Test Information
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'questions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('questions')}
              disabled={!isInfoValid}
            >
              Questions
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Test Information Tab */}
          {activeTab === 'info' && (
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="title" className="form-label">
                  Test Title
                </label>
                <input
                  id="title"
                  type="text"
                  className={`form-input ${errors.title ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="e.g., Math Quiz - Algebra Basics"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="form-error">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className={`form-input ${errors.description ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Describe what this test is about..."
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && (
                  <p className="form-error">{errors.description.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="subject" className="form-label">
                  Subject/Topic
                </label>
                <input
                  id="subject"
                  type="text"
                  className={`form-input ${errors.subject ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="e.g., Mathematics, History, Science"
                  {...register('subject', { required: 'Subject is required' })} // Changed from 'topic'
                />
                {errors.subject && (
                  <p className="form-error">{errors.subject.message}</p>
                )}
              </div>
              
              <div>
                <label className="form-label">Difficulty Level</label>
                <div className="flex space-x-4 mt-1">
                  <label className="flex-1">
                    <input
                      type="radio"
                      className="sr-only"
                      value="easy"
                      {...register('difficulty')}
                    />
                    <div className={`cursor-pointer border rounded-lg px-4 py-3 text-center transition-colors ${
                      watch('difficulty') === 'easy'
                        ? 'bg-success-50 border-success-300 text-success-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      Easy
                    </div>
                  </label>
                  
                  <label className="flex-1">
                    <input
                      type="radio"
                      className="sr-only"
                      value="medium"
                      {...register('difficulty')}
                    />
                    <div className={`cursor-pointer border rounded-lg px-4 py-3 text-center transition-colors ${
                      watch('difficulty') === 'medium'
                        ? 'bg-warning-50 border-warning-300 text-warning-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      Medium
                    </div>
                  </label>
                  
                  <label className="flex-1">
                    <input
                      type="radio"
                      className="sr-only"
                      value="hard"
                      {...register('difficulty')}
                    />
                    <div className={`cursor-pointer border rounded-lg px-4 py-3 text-center transition-colors ${
                      watch('difficulty') === 'hard'
                        ? 'bg-error-50 border-error-300 text-error-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      Hard
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={() => setActiveTab('questions')}
                  disabled={!isInfoValid}
                >
                  Continue to Questions
                </button>
              </div>
            </div>
          )}
          
          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="p-6">
              <div className="space-y-8">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Question {index + 1}</h3>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-error-600 hover:text-error-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="form-label">
                          Question Text
                        </label>
                        <textarea
                          className={`form-input ${
                            errors.questions?.[index]?.text ? 'border-error-500 focus:ring-error-500' : ''
                          }`}
                          rows={2}
                          placeholder="Enter your question here..."
                          {...register(`questions.${index}.text` as const, {
                            required: 'Question text is required',
                          })}
                        />
                        {errors.questions?.[index]?.text && (
                          <p className="form-error">{errors.questions?.[index]?.text?.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="form-label">
                          Answer Options
                        </label>
                        <div className="space-y-3">
                          {watchQuestions[index].options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center">
                              <label className="inline-flex items-center mr-3">
                                <input
                                  type="radio"
                                  className="form-radio h-4 w-4 text-primary-600"
                                  value={optionIndex}
                                  {...register(`questions.${index}.correctOption` as const)}
                                />
                              </label>
                              <input
                                className={`form-input flex-1 ${
                                  errors.questions?.[index]?.options?.[optionIndex]
                                    ? 'border-error-500 focus:ring-error-500'
                                    : ''
                                }`}
                                placeholder={`Option ${optionIndex + 1}`}
                                {...register(`questions.${index}.options.${optionIndex}` as const, {
                                  required: 'Option text is required',
                                })}
                              />
                            </div>
                          ))}
                        </div>
                        {errors.questions?.[index]?.options && (
                          <p className="form-error mt-2">All options must have text</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="btn-outline w-full flex items-center justify-center"
                  onClick={addQuestion}
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Add Another Question
                </button>
              </div>
              
              <div className="mt-8 flex space-x-4">
                <button
                  type="button"
                  className="btn-outline flex-1"
                  onClick={() => setActiveTab('info')}
                >
                  Back to Information
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center"
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating Test...
                    </>
                  ) : (
                    'Create Test'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};