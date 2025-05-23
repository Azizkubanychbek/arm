import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTestStore } from '../../store/testStore';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Loader, AlertCircle, BookOpen, Award, BarChart3 } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { getTeacherTests, tests, isLoading } = useTestStore();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState<string>('all');
  
  useEffect(() => {
    if (user) {
      getTeacherTests(user.id);
    }
  }, [user, getTeacherTests]);
  
  useEffect(() => {
    // In a real app, this would fetch real analytics data
    // For the MVP, we'll simulate data
    
    const simulateData = () => {
      return {
        topicPerformance: {
          labels: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'],
          datasets: [
            {
              label: 'Average Score (%)',
              data: [75, 68, 82, 59, 91],
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1,
            },
          ],
        },
        difficultyDistribution: {
          labels: ['Easy', 'Medium', 'Hard'],
          datasets: [
            {
              label: 'Number of Tests',
              data: [4, 7, 3],
              backgroundColor: [
                'rgba(34, 197, 94, 0.6)',
                'rgba(249, 115, 22, 0.6)',
                'rgba(239, 68, 68, 0.6)',
              ],
              borderColor: [
                'rgb(34, 197, 94)',
                'rgb(249, 115, 22)',
                'rgb(239, 68, 68)',
              ],
              borderWidth: 1,
            },
          ],
        },
        commonMistakes: [
          {
            topic: 'Algebra',
            subtopic: 'Quadratic Equations',
            errorRate: 42,
            description: 'Students often forget to check both positive and negative solutions'
          },
          {
            topic: 'Geometry',
            subtopic: 'Triangles',
            errorRate: 38,
            description: 'Confusion between similar and congruent triangles'
          },
          {
            topic: 'Statistics',
            subtopic: 'Standard Deviation',
            errorRate: 56,
            description: 'Calculation errors when finding variance'
          },
          {
            topic: 'Calculus',
            subtopic: 'Integration',
            errorRate: 61,
            description: 'Difficulty with u-substitution method'
          },
        ],
        recentScores: {
          labels: ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'],
          datasets: [
            {
              label: 'Average Score',
              data: [78, 82, 75, 89, 71],
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1,
            },
          ],
        },
      };
    };
    
    setAnalysisData(simulateData());
  }, []);
  
  if (isLoading || !analysisData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }
  
  if (!user?.role || user.role !== 'teacher') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only teachers can access the analytics dashboard.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Analyze student performance and identify areas for improvement
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <label htmlFor="testFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Test:
          </label>
          <select
            id="testFilter"
            className="form-input max-w-xs"
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
          >
            <option value="all">All Tests</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.title}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button className="btn-outline flex items-center text-sm px-3 py-1.5">
            <BarChart3 className="h-4 w-4 mr-1" />
            Export Report
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">Tests Taken</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">48</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">76%</p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">92%</p>
            </div>
            <div className="bg-success-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">24%</p>
            </div>
            <div className="bg-warning-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Performance by Topic</h2>
          <div className="h-80">
            <Bar 
              data={analysisData.topicPerformance} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Average Score (%)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Topic'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Test Difficulty Distribution</h2>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={analysisData.difficultyDistribution} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Common Mistakes</h2>
          <div className="space-y-4">
            {analysisData.commonMistakes.map((mistake: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{mistake.topic}: {mistake.subtopic}</h3>
                    <p className="text-sm text-gray-600 mt-1">{mistake.description}</p>
                  </div>
                  <span className="bg-error-50 text-error-700 text-sm font-medium px-2 py-1 rounded-full">
                    {mistake.errorRate}% error rate
                  </span>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-error-500 h-2 rounded-full" 
                    style={{ width: `${mistake.errorRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Recent Test Performance</h2>
          <div className="h-80">
            <Bar 
              data={analysisData.recentScores} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Average Score (%)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};