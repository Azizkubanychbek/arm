import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTestStore } from '../../store/testStore';
import { TestCard } from '../../components/ui/TestCard';
import { 
  BookOpen, 
  FileText, 
  UserCheck, 
  Award, 
  BarChart3,
  Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { getTeacherTests, getAvailableTests, tests, isLoading } = useTestStore();
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  
  const isTeacher = user?.role === 'teacher';
  
  useEffect(() => {
    if (user) {
      if (isTeacher) {
        getTeacherTests(user.id);
      } else {
        getAvailableTests();
      }
    }
  }, [user, isTeacher, getTeacherTests, getAvailableTests]);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return;
      
      setResultsLoading(true);
      try {
        // In a real app, we would fetch real data here
        // Simulating results data for the MVP
        if (isTeacher) {
          setRecentResults([
            {
              id: '1',
              test_title: 'Math Quiz - Algebra',
              student_name: 'Alice Johnson',
              score: 85,
              max_score: 100,
              completed_at: new Date().toISOString(),
            },
            {
              id: '2',
              test_title: 'History Test - World War II',
              student_name: 'Bob Smith',
              score: 92,
              max_score: 100,
              completed_at: new Date().toISOString(),
            },
          ]);
        } else {
          setRecentResults([
            {
              id: '1',
              test_title: 'Math Quiz - Algebra',
              score: 85,
              max_score: 100,
              completed_at: new Date().toISOString(),
            },
            {
              id: '2',
              test_title: 'Science Test - Biology',
              score: 78,
              max_score: 100,
              completed_at: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setResultsLoading(false);
      }
    };
    
    fetchResults();
  }, [user, isTeacher]);
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.full_name}
        </h1>
        <p className="text-gray-600 mt-1">
          {isTeacher
            ? 'Manage your tests and view student performance'
            : 'Take tests and track your progress'}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                {isTeacher ? 'Total Tests Created' : 'Available Tests'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{tests.length || 0}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                {isTeacher ? 'Total Students' : 'Tests Completed'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{isTeacher ? 12 : 3}</p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                {isTeacher ? 'Tests Taken' : 'Average Score'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{isTeacher ? 48 : '85%'}</p>
            </div>
            <div className="bg-success-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                {isTeacher ? 'Average Score' : 'Top Score'}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{isTeacher ? '78%' : '92%'}</p>
            </div>
            <div className="bg-warning-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tests Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {isTeacher ? 'Your Recent Tests' : 'Available Tests'}
            </h2>
            <Link
              to={isTeacher ? '/tests/manage' : '/tests/available'}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-60">
              <Loader className="h-8 w-8 text-primary-600 animate-spin" />
            </div>
          ) : tests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {tests.slice(0, 3).map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-600 mb-4">
                {isTeacher
                  ? "You haven't created any tests yet."
                  : "There are no tests available right now."}
              </p>
              {isTeacher && (
                <Link to="/tests/create" className="btn-primary inline-flex">
                  Create your first test
                </Link>
              )}
            </div>
          )}
        </div>
        
        {/* Recent Results Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {isTeacher ? 'Recent Submissions' : 'Your Recent Results'}
            </h2>
            <Link
              to={isTeacher ? '/analytics' : '/tests/results'}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          {resultsLoading ? (
            <div className="flex items-center justify-center h-60">
              <Loader className="h-8 w-8 text-primary-600 animate-spin" />
            </div>
          ) : recentResults.length > 0 ? (
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div key={result.id} className="card p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {result.test_title}
                  </h3>
                  
                  {isTeacher && (
                    <p className="text-sm text-gray-600 mt-1">
                      Student: {result.student_name}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-secondary-600 mr-1" />
                      <span className="text-sm font-medium">
                        {result.score}/{result.max_score} ({Math.round((result.score / result.max_score) * 100)}%)
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(result.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <BarChart3 className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-gray-900 font-medium">No results yet</h3>
              <p className="text-gray-600 text-sm mt-1">
                {isTeacher
                  ? "Students haven't submitted any tests yet."
                  : "You haven't completed any tests yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};