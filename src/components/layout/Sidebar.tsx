import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  Book, 
  FileText, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const isTeacher = user?.role === 'teacher';

  return (
    <>
      {/* Floating sidebar trigger */}
      <div 
        className="fixed left-0 top-16 w-1 h-full bg-transparent z-40 hover:w-4 transition-all duration-200 hidden md:block"
        onMouseEnter={() => setIsExpanded(true)}
      />
      
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-200 fixed left-0 h-full pt-16 transition-all duration-300 z-50 shadow-lg ${
          isExpanded ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
        } hidden md:block`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="h-full flex flex-col justify-between py-4">
          <nav className="flex-1 px-2 space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              <span>Dashboard</span>
            </NavLink>

            {isTeacher ? (
              <>
                <NavLink
                  to="/tests/create"
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <FileText className="h-5 w-5 mr-3" />
                  <span>Create Test</span>
                </NavLink>
                
                <NavLink
                  to="/tests/manage"
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Book className="h-5 w-5 mr-3" />
                  <span>Manage Tests</span>
                </NavLink>
                
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  <span>Analytics</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/tests/available"
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Book className="h-5 w-5 mr-3" />
                  <span>Available Tests</span>
                </NavLink>
                
                <NavLink
                  to="/tests/results"
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  <span>My Results</span>
                </NavLink>
              </>
            )}
            
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Settings className="h-5 w-5 mr-3" />
              <span>Settings</span>
            </NavLink>
          </nav>
          
          <div className="px-2">
            <div className="flex items-center justify-between w-full px-2 py-2 text-sm text-gray-500">
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Hover to expand</span>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Backdrop for mobile (optional) */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};