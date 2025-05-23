import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTestStore } from '../../store/testStore';
import { useAuthStore } from '../../store/authStore';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Clock, Loader } from 'lucide-react';

export const TakeTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTestById, currentTest, isLoading, error, submitTestResult } = useTestStore();
  const { user } = useAuthStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    if (id) {
      getTestById(id);
    }
    
    // For demo purposes, set a timer for 15 minutes
    setTimeRemaining(15 * 60);
    
    return () => {
      // Clear timer when component unmounts
    };
  }, [id, getTestById]);
  
  useEffect(() => {
    if (!timeRemaining) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
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
  
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };
  
  const handleNext = () => {
    if (currentTest && currentQuestionIndex < currentTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!currentTest || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Calculate score
      let score = 0;
      currentTest.questions.forEach((question) => {
        if (answers[question.id] === question.correct_option) {
          score++;
        }
      });
      
      await submitTestResult({
        test_id: currentTest.id,
        user_id: user.id,
        score,
        max_score: currentTest.questions.length,
        answers,
        method: 'online',
      });
      
      navigate(`/tests/results/${currentTest.id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentQuestion = currentTest?.questions[currentQuestionIndex];
  const isLastQuestion = currentTest && currentQuestionIndex === currentTest.questions.length - 1;
  const allQuestionsAnswered = currentTest && 
    currentTest.questions.every((q) => typeof answers[q.id] === 'number');
  
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
  
  if (!currentTest || !currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Test Not Found</h2>
          <p className="text-gray-600 mb-4">The test you're looking for doesn't exist or has been removed.</p>
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
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentTest.title}</h1>
          <p className="text-gray-600 mt-1">
            {currentTest.topic} • {currentTest.difficulty} difficulty
          </p>
        </div>
        
        {timeRemaining !== null && (
          <div className="mt-4 sm:mt-0 flex items-center bg-gray-100 px-3 py-2 rounded-lg">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>
      
      <div className="card">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-medium">Question {currentQuestionIndex + 1}/{currentTest.questions.length}</span>
            {typeof answers[currentQuestion.id] === 'number' && (
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">{currentQuestion.text}</h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === index
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-primary-600"
                      checked={answers[currentQuestion.id] === index}
                      onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                    />
                    <span className="ml-3">{option}</span>
                  </div>
                </label>
              ))}
            </div>
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
                  disabled={isSubmitting || !allQuestionsAnswered}
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
            {currentTest.questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  currentQuestionIndex === i
                    ? 'bg-primary-600 text-white'
                    : typeof answers[q.id] === 'number'
                    ? 'bg-success-100 text-success-700 border border-success-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};