import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Save, 
  Play, 
  Settings,
  Search,
  Terminal,
  GitBranch,
  MoreHorizontal,
  Plus,
  Download,
  Upload,
  Minimize,
  Maximize
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const VSCodeEditor: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: '1',
      name: 'src',
      type: 'folder',
      isOpen: true,
      children: [
        {
          id: '2',
          name: 'App.tsx',
          type: 'file',
          language: 'typescript',
          content: `import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';

function App() {
  const [activeTab, setActiveTab] = useState('editor');

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <CodeEditor />
      </div>
    </div>
  );
}

export default App;`
        },
        {
          id: '3',
          name: 'components',
          type: 'folder',
          isOpen: true,
          children: [
            {
              id: '4',
              name: 'Sidebar.tsx',
              type: 'file',
              language: 'typescript',
              content: `import React from 'react';
import { Code2, MessageSquare, BookOpen, Key } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-4">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
        <Code2 className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

export default Sidebar;`
            },
            {
              id: '5',
              name: 'Header.tsx',
              type: 'file',
              language: 'typescript',
              content: `import React from 'react';
import { Search, Bell, Video } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-bold text-gray-900">DevHub Pro</h1>
      <div className="flex items-center space-x-3">
        <Search className="w-5 h-5 text-gray-600" />
        <Bell className="w-5 h-5 text-gray-600" />
        <Video className="w-5 h-5 text-gray-600" />
      </div>
    </div>
  );
};

export default Header;`
            }
          ]
        }
      ]
    },
    {
      id: '6',
      name: 'package.json',
      type: 'file',
      language: 'json',
      content: `{
  "name": "devhub-pro",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "typescript": "^5.5.3",
    "vite": "^5.4.2"
  }
}`
    },
    {
      id: '7',
      name: 'README.md',
      type: 'file',
      language: 'markdown',
      content: `# DevHub Pro

A modern development platform for teams.

## Features

- Real-time collaboration
- Video calling
- Code editor
- Team chat
- Research tools

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Contributing

Please read our contributing guidelines before submitting PRs.`
    }
  ]);

  const [activeFile, setActiveFile] = useState<FileNode | null>(files[0].children?.[0] || null);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selectedLanguage, setSelectedLanguage] = useState('typescript');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeFile) {
      setEditorContent(activeFile.content || '');
      setSelectedLanguage(activeFile.language || 'typescript');
      
      // Add to open files if not already open
      if (!openFiles.find(file => file.id === activeFile.id)) {
        setOpenFiles([...openFiles, activeFile]);
      }
    }
  }, [activeFile]);

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      setActiveFile(file);
    } else {
      // Toggle folder
      const updatedFiles = toggleFolder(files, file.id);
      setFiles(updatedFiles);
    }
  };

  const toggleFolder = (fileList: FileNode[], folderId: string): FileNode[] => {
    return fileList.map(file => {
      if (file.id === folderId) {
        return { ...file, isOpen: !file.isOpen };
      }
      if (file.children) {
        return { ...file, children: toggleFolder(file.children, folderId) };
      }
      return file;
    });
  };

  const handleEditorChange = (value: string) => {
    setEditorContent(value);
    if (activeFile) {
      const updatedFiles = updateFileContent(files, activeFile.id, value);
      setFiles(updatedFiles);
    }
  };

  const updateFileContent = (fileList: FileNode[], fileId: string, content: string): FileNode[] => {
    return fileList.map(file => {
      if (file.id === fileId) {
        return { ...file, content };
      }
      if (file.children) {
        return { ...file, children: updateFileContent(file.children, fileId, content) };
      }
      return file;
    });
  };

  const closeFile = (fileId: string) => {
    const newOpenFiles = openFiles.filter(file => file.id !== fileId);
    setOpenFiles(newOpenFiles);
    
    if (activeFile?.id === fileId) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1] || null);
    }
  };

  const runCode = () => {
    setTerminalOutput(['Running code...', 'Code executed successfully!']);
    setIsTerminalOpen(true);
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      typescript: 'text-blue-600',
      javascript: 'text-yellow-600',
      json: 'text-green-600',
      markdown: 'text-purple-600',
      css: 'text-pink-600',
      html: 'text-orange-600'
    };
    return colors[language] || 'text-gray-600';
  };

  const renderFileTree = (fileList: FileNode[], level = 0) => {
    return fileList.map(file => (
      <div key={file.id}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer text-sm ${
            activeFile?.id === file.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => handleFileClick(file)}
        >
          {file.type === 'folder' ? (
            <>
              {file.isOpen ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              {file.isOpen ? (
                <FolderOpen className="w-4 h-4 mr-2 text-blue-500" />
              ) : (
                <Folder className="w-4 h-4 mr-2 text-blue-500" />
              )}
            </>
          ) : (
            <>
              <div className="w-4 mr-1" />
              <FileText className={`w-4 h-4 mr-2 ${getLanguageColor(file.language || '')}`} />
            </>
          )}
          <span className="truncate">{file.name}</span>
        </div>
        {file.type === 'folder' && file.isOpen && file.children && (
          <div>{renderFileTree(file.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Top Menu Bar */}
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-4 text-xs">
        <div className="flex items-center space-x-4">
          <span className="font-medium">File</span>
          <span className="font-medium">Edit</span>
          <span className="font-medium">View</span>
          <span className="font-medium">Run</span>
          <span className="font-medium">Terminal</span>
          <span className="font-medium">Help</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-gray-700 rounded">
            <Minimize className="w-3 h-3" />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded">
            <Maximize className="w-3 h-3" />
          </button>
          <button className="p-1 hover:bg-gray-700 rounded">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Explorer Header */}
          <div className="h-10 bg-gray-750 border-b border-gray-700 flex items-center px-3 text-sm font-medium">
            EXPLORER
          </div>
          
          {/* File Tree */}
          <div className="flex-1 overflow-y-auto py-2">
            {renderFileTree(files)}
          </div>

          {/* Bottom Panel Tabs */}
          <div className="border-t border-gray-700">
            <div className="flex">
              <button 
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className={`flex-1 px-3 py-2 text-xs hover:bg-gray-700 flex items-center justify-center ${
                  isTerminalOpen ? 'bg-gray-700' : ''
                }`}
              >
                <Terminal className="w-3 h-3 mr-1" />
                TERMINAL
              </button>
              <button className="flex-1 px-3 py-2 text-xs hover:bg-gray-700 flex items-center justify-center">
                <GitBranch className="w-3 h-3 mr-1" />
                SOURCE CONTROL
              </button>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
            {openFiles.map(file => (
              <div
                key={file.id}
                className={`flex items-center px-3 py-2 border-r border-gray-700 text-sm cursor-pointer hover:bg-gray-700 ${
                  activeFile?.id === file.id ? 'bg-gray-900' : ''
                }`}
                onClick={() => setActiveFile(file)}
              >
                <FileText className={`w-4 h-4 mr-2 ${getLanguageColor(file.language || '')}`} />
                <span className="truncate max-w-32">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.id);
                  }}
                  className="ml-2 hover:bg-gray-600 rounded p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button className="px-3 py-2 text-sm hover:bg-gray-700">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Editor Toolbar */}
          <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3 space-x-2">
            <button
              onClick={runCode}
              className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
            >
              <Play className="w-3 h-3" />
              <span>Run</span>
            </button>
            <button className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-700 rounded text-xs"
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </button>
            <span className="text-xs text-gray-400">
              {selectedLanguage.toUpperCase()}
            </span>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex">
            <div className="flex-1 relative">
              <textarea
                ref={editorRef}
                value={editorContent}
                onChange={(e) => handleEditorChange(e.target.value)}
                className="w-full h-full bg-gray-900 text-white p-4 font-mono text-sm resize-none focus:outline-none"
                style={{ 
                  lineHeight: '1.5',
                  tabSize: 2
                }}
                spellCheck={false}
              />
              
              {/* Line Numbers */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 border-r border-gray-700 p-4 font-mono text-sm text-gray-400 select-none">
                {editorContent.split('\n').map((_, index) => (
                  <div key={index} className="leading-6">
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Search Panel */}
            {isSearchOpen && (
              <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="text-sm text-gray-400">
                  {searchQuery ? `Found 0 results for "${searchQuery}"` : 'Enter search term'}
                </div>
              </div>
            )}
          </div>

          {/* Terminal Panel */}
          {isTerminalOpen && (
            <div className="h-48 bg-gray-900 border-t border-gray-700 flex flex-col">
              <div className="h-6 bg-gray-800 border-b border-gray-700 flex items-center px-3 text-xs">
                <Terminal className="w-3 h-3 mr-2" />
                TERMINAL
              </div>
              <div className="flex-1 p-3 font-mono text-sm overflow-y-auto">
                {terminalOutput.map((line, index) => (
                  <div key={index} className="text-green-400">
                    {line}
                  </div>
                ))}
                <div className="text-green-400">
                  <span className="text-blue-400">user@devhub</span>:<span className="text-yellow-400">~</span>$ 
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VSCodeEditor;
