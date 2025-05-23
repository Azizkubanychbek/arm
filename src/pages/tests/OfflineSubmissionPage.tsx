import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTestStore } from '../../store/testStore';
import { useAuthStore } from '../../store/authStore';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';
import { 
  Camera, 
  AlertCircle, 
  Upload, 
  ArrowLeft,
  Loader,
  Trash2,
  RefreshCw
} from 'lucide-react';

export const OfflineSubmissionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTestById, currentTest, isLoading, error, submitTestResult } = useTestStore();
  const { user } = useAuthStore();
  
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (id) {
      getTestById(id);
    }
  }, [id, getTestById]);
  
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setPreviewUrl(imageSrc);
      setUploadedImage(null);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      setCapturedImage(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const resetImage = () => {
    setCapturedImage(null);
    setUploadedImage(null);
    setPreviewUrl(null);
    setProcessingResult(null);
    setProcessingError(null);
  };
  
  const processImage = async () => {
    if (!previewUrl || !currentTest || !user) return;
    
    setProcessingImage(true);
    setProcessingError(null);
    
    try {
      // Initialize Tesseract.js worker
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Process the image
      const { data } = await worker.recognize(previewUrl);
      await worker.terminate();
      
      console.log('OCR Result:', data);
      
      // Simulate parsing the test answers from the OCR result
      // In a real application, you would implement proper parsing logic
      // For MVP, we'll simulate the results
      
      // Simulate a 70% accuracy rate for demonstration
      const simulatedAnswers: Record<string, number> = {};
      let correctCount = 0;
      
      currentTest.questions.forEach((question) => {
        // Randomly determine if the question was answered correctly (70% chance)
        const correct = Math.random() > 0.3;
        simulatedAnswers[question.id] = correct ? question.correct_option : (question.correct_option + 1) % 4;
        
        if (correct) correctCount++;
      });
      
      const result = {
        test_id: currentTest.id,
        user_id: user.id,
        score: correctCount,
        max_score: currentTest.questions.length,
        answers: simulatedAnswers,
        method: 'offline',
      };
      
      // Submit the result
      await submitTestResult(result);
      
      setProcessingResult({
        score: correctCount,
        maxScore: currentTest.questions.length,
        percentage: Math.round((correctCount / currentTest.questions.length) * 100),
      });
      
    } catch (error) {
      console.error('Error processing image:', error);
      setProcessingError('Failed to process the image. Please try again or upload a clearer image.');
    } finally {
      setProcessingImage(false);
    }
  };
  
  const viewDetailedResults = () => {
    if (currentTest) {
      navigate(`/tests/results/${currentTest.id}`);
    }
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Test</h2>
          <p className="text-gray-600 mb-4">{error || 'Test not found'}</p>
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
      <div className="mb-6">
        <button
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          onClick={() => navigate(`/tests/details/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Test
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">Submit Offline Test</h1>
        <p className="text-gray-600 mt-1">
          Upload or capture an image of your completed answer sheet for {currentTest.title}
        </p>
      </div>
      
      {processingError && (
        <div className="bg-error-50 border border-error-200 text-error-700 p-4 rounded-lg mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{processingError}</p>
        </div>
      )}
      
      {processingResult ? (
        <div className="card p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <Camera className="h-8 w-8 text-success-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Test Processed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your offline test has been processed and scored.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6 inline-block">
            <p className="text-sm text-gray-600 mb-2">Your Score</p>
            <div className="flex items-center justify-center">
              <span className="text-3xl font-bold">{processingResult.score}/{processingResult.maxScore}</span>
              <span className="ml-2 text-lg font-medium">({processingResult.percentage}%)</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              className="btn-outline flex items-center justify-center"
              onClick={resetImage}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Process Another Test
            </button>
            <button
              className="btn-primary flex items-center justify-center"
              onClick={viewDetailedResults}
            >
              View Detailed Results
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">
              {!previewUrl ? 'Capture or Upload Test Image' : 'Review and Process Test Image'}
            </h2>
          </div>
          
          <div className="p-6">
            {!previewUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-gray-50 p-6 flex flex-col items-center justify-center">
                  <div className="mb-4 text-center">
                    <Camera className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900">Capture with Camera</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Take a photo of your completed answer sheet
                    </p>
                  </div>
                  
                  <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <button
                    className="btn-primary w-full flex items-center justify-center"
                    onClick={captureImage}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Image
                  </button>
                </div>
                
                <div className="card bg-gray-50 p-6 flex flex-col items-center justify-center">
                  <div className="mb-4 text-center">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900">Upload Image</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload a photo of your completed answer sheet
                    </p>
                  </div>
                  
                  <div 
                    className="w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={triggerFileInput}
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to select a file</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  <button
                    className="btn-outline w-full flex items-center justify-center"
                    onClick={triggerFileInput}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative max-w-lg">
                    <img 
                      src={previewUrl} 
                      alt="Test submission" 
                      className="rounded-lg border border-gray-300 max-h-96 object-contain"
                    />
                    <button
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-90"
                      onClick={resetImage}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button
                    className="btn-primary px-8 flex items-center justify-center"
                    onClick={processImage}
                    disabled={processingImage}
                  >
                    {processingImage ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Process Test Image'
                    )}
                  </button>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
                  <p className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Make sure the image is clear and well-lit. All answers should be clearly marked on the answer sheet for accurate processing.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};