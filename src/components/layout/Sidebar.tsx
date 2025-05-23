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
  const [collapsed, setCollapsed] = useState(false);

  const isTeacher = user?.role === 'teacher';

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside 
      className={`bg-white border-r border-gray-200 fixed left-0 h-full pt-16 transition-all duration-300 z-0 ${
        collapsed ? 'w-16' : 'w-64'
      } hidden md:block`}
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
            {!collapsed && <span>Dashboard</span>}
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
                {!collapsed && <span>Create Test</span>}
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
                {!collapsed && <span>Manage Tests</span>}
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
                {!collapsed && <span>Analytics</span>}
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
                {!collapsed && <span>Available Tests</span>}
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
                {!collapsed && <span>My Results</span>}
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
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </nav>
        
        <div className="px-2">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};