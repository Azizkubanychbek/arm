import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTestStore } from '../../store/testStore';
import { useAuthStore } from '../../store/authStore';
import { 
  AlertCircle, 
  Award, 
  Camera, 
  Clock, 
  Download, 
  FileText, 
  Loader,
  Printer 
} from 'lucide-react';

export const TestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTestById, currentTest, isLoading, error } = useTestStore();
  const { user } = useAuthStore();
  
  const [testMode, setTestMode] = useState<'online' | 'offline'>('online');
  
  useEffect(() => {
    if (id) {
      getTestById(id);
    }
  }, [id, getTestById]);
  
  const handleStartTest = () => {
    if (testMode === 'online') {
      navigate(`/tests/take/${id}`);
    } else {
      // Open print dialog to print the test form
      window.print();
    }
  };
  
  const handleUploadOfflineTest = () => {
    navigate(`/tests/offline-submission/${id}`);
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Test Not Found</h2>
          <p className="text-gray-600 mb-4">{error ? error : "The test you\'re looking for doesn\'t exist or has been removed."}</p>
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
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success-50 text-success-700';
      case 'medium':
        return 'bg-warning-50 text-warning-700';
      case 'hard':
        return 'bg-error-50 text-error-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <span className={`badge ${getDifficultyColor(currentTest.difficulty)} capitalize`}>
          {currentTest.difficulty}
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{currentTest.title}</h1>
        <div className="flex items-center text-gray-600 mt-2">
          <FileText className="h-4 w-4 mr-1" />
          <span className="capitalize">{currentTest.topic}</span>
          <span className="mx-2">•</span>
          <Clock className="h-4 w-4 mr-1" />
          <span>Created on {formatDate(currentTest.created_at)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-3">About this Test</h2>
              <p className="text-gray-700 mb-4">
                {currentTest.description}
              </p>
              
              <div className="flex items-center text-gray-600 mb-4">
                <Award className="h-5 w-5 mr-2" />
                <span>This test contains {currentTest.questions.length} questions</span>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Test Preview</h3>
                <p className="text-gray-600 text-sm mb-3">Here are some example questions from this test:</p>
                
                <div className="space-y-3">
                  {currentTest.questions.slice(0, 2).map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg bg-white p-3">
                      <p className="font-medium text-gray-900 mb-2">{index + 1}. {question.text}</p>
                      <div className="space-y-1 text-sm text-gray-700">
                        {question.options.slice(0, 2).map((option, i) => (
                          <div key={i} className="flex items-center">
                            <div className="h-3 w-3 rounded-full border border-gray-400 mr-2"></div>
                            <span>{option}</span>
                          </div>
                        ))}
                        <div className="text-gray-500 italic">
                          {question.options.length > 2 ? `+ ${question.options.length - 2} more options` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {currentTest.questions.length > 2 && (
                    <p className="text-gray-500 text-sm italic text-center">
                      + {currentTest.questions.length - 2} more questions
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="card sticky top-20">
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Take this Test</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="form-label">Select Test Mode</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <label
                      className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center transition-colors ${
                        testMode === 'online'
                          ? 'bg-primary-50 border-primary-300 text-primary-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        checked={testMode === 'online'}
                        onChange={() => setTestMode('online')}
                      />
                      <Award className="h-6 w-6 mb-1" />
                      <span className="font-medium">Online</span>
                      <span className="text-xs text-center mt-1">Take the test in your browser</span>
                    </label>
                    
                    <label
                      className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center transition-colors ${
                        testMode === 'offline'
                          ? 'bg-primary-50 border-primary-300 text-primary-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        checked={testMode === 'offline'}
                        onChange={() => setTestMode('offline')}
                      />
                      <Printer className="h-6 w-6 mb-1" />
                      <span className="font-medium">Offline</span>
                      <span className="text-xs text-center mt-1">Print and complete on paper</span>
                    </label>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-700 mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">Estimated time: 15-20 minutes</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Award className="h-4 w-4 mr-2" />
                    <span className="font-medium">{currentTest.questions.length} questions</span>
                  </div>
                </div>
              </div>
              
              <button
                className="btn-primary w-full mb-3"
                onClick={handleStartTest}
              >
                {testMode === 'online' ? 'Start Online Test' : 'Print Test Form'}
              </button>
              
              {testMode === 'offline' && (
                <>
                  <button
                    className="btn-outline w-full flex items-center justify-center"
                    onClick={handleUploadOfflineTest}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Completed Test
                  </button>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <p className="mb-2 flex items-start">
                      <Download className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Print the test form, complete it by hand, then upload a photo of your answers.</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};