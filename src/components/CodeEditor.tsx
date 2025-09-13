import React from 'react';
import { FileText, Bug, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';

const CodeEditor: React.FC = () => {
  const files = [
    { name: 'main.py', active: true, modified: true },
    { name: 'utils.js', active: false, modified: false },
    { name: 'config.json', active: false, modified: false },
  ];

  const aiSuggestions = [
    { type: 'optimization', message: 'Consider using list comprehension for better performance', line: 15 },
    { type: 'bug', message: 'Potential null pointer exception', line: 23 },
    { type: 'suggestion', message: 'Add error handling for API calls', line: 31 },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* File Tabs */}
      <div className="flex bg-white border-b border-gray-200">
        {files.map((file) => (
          <div
            key={file.name}
            className={`px-4 py-2 border-r border-gray-200 flex items-center space-x-2 cursor-pointer ${
              file.active ? 'bg-blue-50 border-b-2 border-blue-500' : 'hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{file.name}</span>
            {file.modified && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
          </div>
        ))}
      </div>

      <div className="flex-1 flex">
        {/* Code Area */}
        <div className="flex-1 p-4">
          <div className="bg-gray-900 rounded-lg p-4 h-full font-mono text-sm">
            <div className="text-gray-300">
              <div className="flex">
                <div className="text-gray-500 select-none w-8 text-right pr-4">1</div>
                <div><span className="text-blue-400">import</span> <span className="text-green-400">pandas</span> <span className="text-blue-400">as</span> <span className="text-green-400">pd</span></div>
              </div>
              <div className="flex">
                <div className="text-gray-500 select-none w-8 text-right pr-4">2</div>
                <div><span className="text-blue-400">import</span> <span className="text-green-400">numpy</span> <span className="text-blue-400">as</span> <span className="text-green-400">np</span></div>
              </div>
              <div className="flex">
                <div className="text-gray-500 select-none w-8 text-right pr-4">3</div>
                <div></div>
              </div>
              <div className="flex">
                <div className="text-gray-500 select-none w-8 text-right pr-4">4</div>
                <div><span className="text-blue-400">def</span> <span className="text-yellow-400">analyze_data</span>(<span className="text-orange-400">data</span>):</div>
              </div>
              <div className="flex">
                <div className="text-gray-500 select-none w-8 text-right pr-4">5</div>
                <div className="pl-4"><span className="text-gray-400"># AI Suggestion: Add input validation</span></div>
              </div>
              <div className="flex">
                <div className="text-gray-500 select-none w-8 text-right pr-4">6</div>
                <div className="pl-4"><span className="text-blue-400">if</span> <span className="text-orange-400">data</span> <span className="text-blue-400">is</span> <span className="text-blue-400">None</span>:</div>
              </div>
              <div className="flex">
                <div className="text-gray-500 select-none w-8 text-right pr-4">7</div>
                <div className="pl-8"><span className="text-blue-400">return</span> <span className="text-green-400">"No data provided"</span></div>
              </div>
              <div className="flex">
                <div className="text-gray-500 select-none w-8 text-right pr-4">8</div>
                <div className="pl-4"></div>
              </div>
              <div className="flex">
                <div className="text-gray-500 select-none w-8 text-right pr-4">9</div>
                <div className="pl-4"><span className="text-orange-400">result</span> = <span className="text-orange-400">data</span>.<span className="text-yellow-400">groupby</span>(<span className="text-green-400">'category'</span>).<span className="text-yellow-400">mean</span>()</div>
              </div>
              <div className="flex">
                <div className="text-gray-500 select-none w-8 text-right pr-4">10</div>
                <div className="pl-4"><span className="text-blue-400">return</span> <span className="text-orange-400">result</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
            AI Assistant
          </h3>
          
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  {suggestion.type === 'bug' && <Bug className="w-4 h-4 text-red-500 mt-0.5" />}
                  {suggestion.type === 'optimization' && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />}
                  {suggestion.type === 'suggestion' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                  <div>
                    <div className="text-sm text-gray-900">{suggestion.message}</div>
                    <div className="text-xs text-gray-500 mt-1">Line {suggestion.line}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Code Quality</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Maintainability</span>
                <span className="text-green-600">A</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Security</span>
                <span className="text-yellow-600">B</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Performance</span>
                <span className="text-green-600">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;