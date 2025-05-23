import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTestStore } from '../../store/testStore';
import { useAuthStore } from '../../store/authStore';
import { AlertCircle, Download, Check, X, Award, BarChart3, Loader } from 'lucide-react';

export const TestResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTestById, currentTest, isLoading, error } = useTestStore();
  const { user } = useAuthStore();
  
  // For the MVP, we'll simulate a test result
  const [result, setResult] = useState<any>(null);
  
  useEffect(() => {
    if (id) {
      getTestById(id);
    }
  }, [id, getTestById]);
  
  useEffect(() => {
    if (currentTest && user) {
      // Simulate a test result for demo purposes
      const simulatedAnswers: Record<string, number> = {};
      let correctCount = 0;
      
      currentTest.questions.forEach((question) => {
        // Randomly determine if the question was answered correctly (70% chance)
        const correct = Math.random() > 0.3;
        simulatedAnswers[question.id] = correct ? question.correct_option : (question.correct_option + 1) % 4;
        
        if (correct) correctCount++;
      });
      
      setResult({
        id: 'simulated-result',
        test_id: currentTest.id,
        user_id: user.id,
        score: correctCount,
        max_score: currentTest.questions.length,
        answers: simulatedAnswers,
        completed_at: new Date().toISOString(),
        method: 'online',
      });
    }
  }, [currentTest, user]);
  
  const handlePrintTest = () => {
    window.print();
  };
  
  const calculatePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100);
  };
  
  const getResultFeedback = (percentage: number) => {
    if (percentage >= 90) return { text: 'Excellent!', color: 'text-success-600' };
    if (percentage >= 75) return { text: 'Good job!', color: 'text-success-600' };
    if (percentage >= 60) return { text: 'Not bad', color: 'text-warning-600' };
    return { text: 'Needs improvement', color: 'text-error-600' };
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }
  
  if (error || !currentTest) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-4">{error || 'Test not found'}</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }
  
  const percentage = calculatePercentage(result.score, result.max_score);
  const feedback = getResultFeedback(percentage);
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
          <p className="text-gray-600 mt-1">{currentTest.title}</p>
        </div>
        
        <button
          className="mt-4 sm:mt-0 btn-outline flex items-center"
          onClick={handlePrintTest}
        >
          <Download className="h-4 w-4 mr-2" />
          Print Results
        </button>
      </div>
      
      <div className="card mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
              <h2 className="text-xl font-bold text-gray-900">Your Score</h2>
              <div className="flex items-center mt-2">
                <Award className="h-6 w-6 text-secondary-500 mr-2" />
                <span className="text-3xl font-bold">{result.score}/{result.max_score}</span>
                <span className="ml-2 text-lg font-medium">({percentage}%)</span>
              </div>
              <p className={`mt-1 font-medium ${feedback.color}`}>{feedback.text}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <BarChart3 className="h-6 w-6 text-gray-500 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Completion Time</p>
              <p className="font-medium">15:23</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Areas for Improvement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">Algebra Concepts</h4>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-error-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">45%</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">Equations</h4>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-warning-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">65%</span>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">Geometric Principles</h4>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-success-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Question Review</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currentTest.questions.map((question, index) => {
            const userAnswer = result.answers[question.id];
            const isCorrect = userAnswer === question.correct_option;
            
            return (
              <div key={question.id} className="p-6">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                    isCorrect ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
                  }`}>
                    {isCorrect ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-base font-medium text-gray-900">
                      Question {index + 1}: {question.text}
                    </h3>
                    
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`px-3 py-2 rounded-md ${
                            optionIndex === question.correct_option
                              ? 'bg-success-50 text-success-700 border border-success-200'
                              : optionIndex === userAnswer && !isCorrect
                              ? 'bg-error-50 text-error-700 border border-error-200'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {optionIndex === question.correct_option && (
                            <span className="font-medium mr-2">✓</span>
                          )}
                          {optionIndex === userAnswer && !isCorrect && (
                            <span className="font-medium mr-2">✗</span>
                          )}
                          {option}
                        </div>
                      ))}
                    </div>
                    
                    {!isCorrect && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p><span className="font-medium">Explanation:</span> The correct answer is "{question.options[question.correct_option]}" because this is the most accurate representation of the concept.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};