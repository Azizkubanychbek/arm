import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTestStore } from '../../store/testStore';
import { useAuthStore } from '../../store/authStore';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Clock, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const TakeTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTestById, currentTest, isLoading, error } = useTestStore();
  const { user } = useAuthStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [canTakeTest, setCanTakeTest] = useState<boolean | null>(null);
  const [testStartTime] = useState<Date>(new Date());
  
  useEffect(() => {
    if (id) {
      getTestById(id);
    }
  }, [id, getTestById]);

  // Check if student can take the test
  useEffect(() => {
    const checkTestEligibility = async () => {
      if (!id || !user) return;
      
      try {
        const { data, error } = await supabase.rpc('can_student_take_test', {
          p_test_id: id,
          p_student_id: user.id
        });
        
        if (error) {
          console.error('Error checking test eligibility:', error);
          setCanTakeTest(false);
        } else {
          setCanTakeTest(data);
        }
      } catch (error) {
        console.error('Error checking test eligibility:', error);
        setCanTakeTest(false);
      }
    };
    
    checkTestEligibility();
  }, [id, user]);

  useEffect(() => {
    if (currentTest && currentTest.duration_minutes) {
      setTimeRemaining(currentTest.duration_minutes * 60);
    }
  }, [currentTest]);
  
  useEffect(() => {
    if (!timeRemaining) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          // Auto-submit when time runs out
          if (currentTest && user && !isSubmitting) {
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };
  
  const handleNext = () => {
    if (currentTest && currentTest.test_questions && currentQuestionIndex < currentTest.test_questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!currentTest || !user || !currentTest.test_questions) return;
    
    setIsSubmitting(true);
    
    try {
      // Calculate time taken
      const timeTaken = Math.round((new Date().getTime() - testStartTime.getTime()) / (1000 * 60));
      
      // Use the stored procedure to submit test results
      const { data, error } = await supabase.rpc('submit_test_results', {
        p_test_id: currentTest.id,
        p_student_id: user.id,
        p_answers: answers,
        p_submission_type: 'online'
      });
  
      if (error) {
        throw error;
      }
  
      console.log('Test submitted successfully:', data);
      
      // Navigate to results page with submission ID
      if (data && data.length > 0) {
        navigate(`/tests/results/${data[0].submission_id}`);
      } else {
        navigate(`/tests/available`);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert(`Error submitting test: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Test</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/tests/available')}
          >
            Go Back to Tests
          </button>
        </div>
      </div>
    );
  }

  // Check if student can take the test
  if (canTakeTest === false) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Test Not Available</h2>
          <p className="text-gray-600 mb-4">
            You have already reached the maximum number of attempts for this test or the test is not active.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate('/tests/available')}
          >
            Go Back to Tests
          </button>
        </div>
      </div>
    );
  }
  
  if (!currentTest || !currentTest.test_questions || currentTest.test_questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Test Not Found</h2>
          <p className="text-gray-600 mb-4">The test you're looking for doesn't exist or has no questions.</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/tests/available')}
          >
            Go Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = currentTest.test_questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentTest.test_questions.length - 1;
  const allQuestionsAnswered = currentTest.test_questions.every((q) => answers[q.id]);
  
  // Parse options from JSONB
  const questionOptions = Array.isArray(currentQuestion.options) 
    ? currentQuestion.options 
    : JSON.parse(currentQuestion.options || '[]');
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentTest.title}</h1>
          <p className="text-gray-600 mt-1">
            {currentTest.subject} • {currentTest.difficulty} difficulty
          </p>
        </div>
        
        {timeRemaining !== null && (
          <div className={`mt-4 sm:mt-0 flex items-center px-3 py-2 rounded-lg ${
            timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100'
          }`}>
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>
      
      <div className="card">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-medium">
              Question {currentQuestionIndex + 1}/{currentTest.test_questions.length}
            </span>
            {answers[currentQuestion.id] && (
              <span className="ml-2 text-success-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Answered
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={isLastQuestion}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestion.question_text}
            </h2>
            
            {currentQuestion.question_type === 'multiple_choice' && (
              <div className="space-y-3">
                {questionOptions.map((option: string, index: number) => (
                  <label
                    key={index}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === option
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-primary-600"
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                      />
                      <span className="ml-3">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            {currentQuestion.question_type === 'true_false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option) => (
                  <label
                    key={option}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === option
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-primary-600"
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                      />
                      <span className="ml-3">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            {currentQuestion.question_type === 'short_answer' && (
              <div>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                  placeholder="Enter your answer here..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                />
              </div>
            )}
            
            {currentQuestion.explanation && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Hint:</strong> {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-4">
            {!isLastQuestion ? (
              <div className="flex space-x-4">
                <button
                  className="btn-outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>
                <button
                  className="btn-primary"
                  onClick={handleNext}
                >
                  Next Question
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <button
                  className="btn-outline"
                  onClick={handlePrevious}
                >
                  Previous
                </button>
                <button
                  className="btn-success flex items-center"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Test'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {currentTest.test_questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  currentQuestionIndex === i
                    ? 'bg-primary-600 text-white'
                    : answers[q.id]
                    ? 'bg-success-100 text-success-700 border border-success-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Progress: {Object.keys(answers).length}/{currentTest.test_questions.length} questions answered
          </div>
        </div>
      </div>
    </div>
  );
};