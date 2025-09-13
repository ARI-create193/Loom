import React from 'react';
import { Key, Play, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

const ApiManager: React.FC = () => {
  const apiKeys = [
    {
      name: "OpenAI API",
      key: "sk-proj-*********************",
      status: "active",
      lastUsed: "2 hours ago",
      usage: "1,247 requests"
    },
    {
      name: "GitHub API",
      key: "ghp_*********************",
      status: "active",
      lastUsed: "1 day ago",
      usage: "89 requests"
    },
    {
      name: "Stripe API",
      key: "sk_test_******************",
      status: "inactive",
      lastUsed: "1 week ago",
      usage: "23 requests"
    }
  ];

  const endpoints = [
    {
      method: "GET",
      url: "/api/v1/users",
      description: "Fetch all users",
      status: 200,
      responseTime: "145ms"
    },
    {
      method: "POST",
      url: "/api/v1/auth/login",
      description: "User authentication",
      status: 200,
      responseTime: "89ms"
    },
    {
      method: "GET",
      url: "/api/v1/data/analytics",
      description: "Get analytics data",
      status: 500,
      responseTime: "timeout"
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Key className="w-5 h-5 text-orange-500 mr-2" />
          API Manager
        </h3>
        <p className="text-sm text-gray-500 mt-1">Manage API keys and test endpoints</p>
      </div>

      <div className="flex-1 flex">
        {/* API Keys Section */}
        <div className="flex-1 p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">API Keys</h4>
              <button className="flex items-center space-x-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Key</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {apiKeys.map((api, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h5 className="font-medium text-gray-900">{api.name}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        api.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {api.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="font-mono text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">
                    {api.key}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Last used: {api.lastUsed}</span>
                    <span>{api.usage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Testing Section */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">API Testing</h4>
            
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-4 mb-4">
                <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
                <input
                  type="text"
                  placeholder="https://api.example.com/endpoint"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
                  <Play className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Headers</label>
                  <textarea
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder='{"Authorization": "Bearer token"}'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                  <textarea
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                    placeholder='{"key": "value"}'
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Response</h5>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                <div>Status: 200 OK</div>
                <div>Time: 145ms</div>
                <div className="mt-2">
                  {`{
  "status": "success",
  "data": {
    "users": [
      {"id": 1, "name": "John Doe"},
      {"id": 2, "name": "Jane Smith"}
    ]
  }
}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoints Sidebar */}
        <div className="w-80 border-l border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Recent Endpoints</h4>
          <div className="space-y-2">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className={`text-xs ${
                    endpoint.status === 200 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {endpoint.status}
                  </span>
                </div>
                <div className="text-sm font-mono text-gray-900 mb-1">{endpoint.url}</div>
                <div className="text-xs text-gray-500 mb-1">{endpoint.description}</div>
                <div className="text-xs text-gray-400">{endpoint.responseTime}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Usage Analytics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total requests:</span>
                <span className="font-medium">1,359</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success rate:</span>
                <span className="font-medium text-green-600">98.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg response:</span>
                <span className="font-medium">127ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiManager;