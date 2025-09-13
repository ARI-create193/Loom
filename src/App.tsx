import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TeamProvider } from './contexts/TeamContext';
import { ChatProvider } from './contexts/ChatContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import VSCodeEditor from './components/VSCodeEditor';
import TeamChat from './components/TeamChat';
import ResearchPanel from './components/ResearchPanel';
import ApiManager from './components/ApiManager';
import Profile from './components/Profile';
import TeamManagement from './components/TeamManagement';
import UserManagement from './components/UserManagement';
import AuthWrapper from './components/AuthWrapper';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading, sessionExpired } = useAuth();
  const [activeTab, setActiveTab] = useState('editor');

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || sessionExpired) {
    return <AuthWrapper />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'editor':
        return <VSCodeEditor />;
      case 'chat':
        return <TeamChat />;
      case 'research':
        return <ResearchPanel />;
      case 'api':
        return <ApiManager />;
      case 'profile':
        return <Profile />;
      case 'git':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Version Control</h3>
              <p className="text-gray-600">Git integration coming soon...</p>
            </div>
          </div>
        );
      case 'team':
        return <TeamManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <CodeEditor />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex-1 flex min-h-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 overflow-auto">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </TeamProvider>
    </AuthProvider>
  );
}

export default App;