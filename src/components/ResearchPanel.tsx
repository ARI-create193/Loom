import React from 'react';
import { Search, BookOpen, Download, Star, ExternalLink } from 'lucide-react';

const ResearchPanel: React.FC = () => {
  const papers = [
    {
      title: "Attention Is All You Need",
      authors: "Vaswani et al.",
      journal: "NIPS 2017",
      citations: 45000,
      relevance: 95,
      abstract: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms...",
      tags: ["Transformers", "Attention", "NLP"]
    },
    {
      title: "BERT: Pre-training of Deep Bidirectional Transformers",
      authors: "Devlin et al.",
      journal: "NAACL 2019",
      citations: 32000,
      relevance: 88,
      abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder...",
      tags: ["BERT", "Language Models", "Pre-training"]
    },
    {
      title: "GPT-3: Language Models are Few-Shot Learners",
      authors: "Brown et al.",
      journal: "NeurIPS 2020",
      citations: 28000,
      relevance: 92,
      abstract: "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training...",
      tags: ["GPT", "Few-shot Learning", "Large Models"]
    }
  ];

  const savedPapers = [
    "Neural Machine Translation by Jointly Learning to Align and Translate",
    "Deep Residual Learning for Image Recognition",
    "Generative Adversarial Networks"
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <BookOpen className="w-5 h-5 text-purple-500 mr-2" />
            Research Database
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Connected to:</span>
            <span className="font-medium">arXiv, IEEE, ACM, PubMed</span>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search papers, authors, keywords..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-4 mt-3">
          <select className="px-3 py-1 border border-gray-300 rounded text-sm">
            <option>All Fields</option>
            <option>Computer Science</option>
            <option>Machine Learning</option>
            <option>NLP</option>
          </select>
          <select className="px-3 py-1 border border-gray-300 rounded text-sm">
            <option>Last 5 years</option>
            <option>Last year</option>
            <option>Last month</option>
          </select>
          <select className="px-3 py-1 border border-gray-300 rounded text-sm">
            <option>Relevance</option>
            <option>Citations</option>
            <option>Date</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Papers List */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {papers.map((paper, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-lg leading-tight">{paper.title}</h4>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Star className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {paper.authors} • {paper.journal} • {paper.citations.toLocaleString()} citations
                </div>
                
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{paper.abstract}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {paper.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Relevance:</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${paper.relevance}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-purple-600">{paper.relevance}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Papers Sidebar */}
        <div className="w-64 border-l border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Saved Papers</h4>
          <div className="space-y-2">
            {savedPapers.map((paper, index) => (
              <div key={index} className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="text-sm text-gray-900 line-clamp-2">{paper}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Papers saved:</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Citations tracked:</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reading time:</span>
                <span className="font-medium">12h 30m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchPanel;