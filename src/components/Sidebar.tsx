import React from 'react';
import { 
  Code2, 
  MessageSquare, 
  BookOpen, 
  Key, 
  GitBranch, 
  Users, 
  Search,
  Settings,
  Zap,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { id: 'editor', icon: Code2, label: 'Code Editor', color: 'text-blue-500' },
    { id: 'chat', icon: MessageSquare, label: 'Team Chat', color: 'text-green-500' },
    { id: 'research', icon: BookOpen, label: 'Research', color: 'text-purple-500' },
    { id: 'api', icon: Key, label: 'API Manager', color: 'text-orange-500' },
    { id: 'git', icon: GitBranch, label: 'Version Control', color: 'text-red-500' },
    { id: 'team', icon: Users, label: 'Team', color: 'text-indigo-500' },
    { id: 'users', icon: UserCheck, label: 'User Management', color: 'text-pink-500' },
  ];

  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-4">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
        <Zap className="w-6 h-6 text-white" />
      </div>
      
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group relative ${
            activeTab === item.id 
              ? 'bg-gray-700 shadow-lg' 
              : 'hover:bg-gray-800'
          }`}
        >
          <item.icon className={`w-5 h-5 ${activeTab === item.id ? item.color : 'text-gray-400'}`} />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {item.label}
          </div>
        </button>
      ))}
      
      <div className="flex-1" />
      
      {/* User Avatar */}
      {user && (
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-2">
          <span className="text-white text-sm font-medium">{user.avatar}</span>
        </div>
      )}
      
      <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
        <Settings className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
};

export default Sidebar;