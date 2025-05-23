import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from '../../types/supabase';
import { BookOpen, Calendar, Award } from 'lucide-react';

type Test = Database['public']['Tables']['tests']['Row'];

interface TestCardProps {
  test: Test;
  showActions?: boolean;
}

export const TestCard: React.FC<TestCardProps> = ({ test, showActions = true }) => {
  const navigate = useNavigate();
  
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
  
  const handleTakeTest = () => {
    navigate(`/tests/take/${test.id}`);
  };
  
  const handleViewDetails = () => {
    navigate(`/tests/details/${test.id}`);
  };
  
  return (
    <div className="card group hover:transform hover:scale-[1.01] transition-all duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-heading font-semibold text-xl text-gray-900 line-clamp-1">{test.title}</h3>
          <span className={`badge ${getDifficultyColor(test.difficulty)} capitalize`}>
            {test.difficulty}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{test.description}</p>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <BookOpen className="h-4 w-4 mr-1" />
          <span className="capitalize">{test.topic}</span>
          <span className="mx-2">•</span>
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatDate(test.created_at)}</span>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            <button 
              className="btn-primary flex-1 flex items-center justify-center"
              onClick={handleTakeTest}
            >
              <Award className="h-4 w-4 mr-2" />
              Take Test
            </button>
            <button 
              className="btn-outline flex items-center justify-center"
              onClick={handleViewDetails}
            >
              Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};