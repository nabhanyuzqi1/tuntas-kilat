import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AgentStudio() {
  const [code, setCode] = useState<string>(`function hello() {\n  console.log("Hello, World!");\n}`);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [agentResponse, setAgentResponse] = useState<string>('Agent is standing by. Give me a command.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const handleAgentAction = async () => {
    setIsLoading(true);
    setAgentResponse('');
    setConversationHistory(prev => [...prev, { role: 'user', parts: [{ text: userPrompt }] }]);

    const serverUrl = 'http://localhost:5000/api/agent/execute';

    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, userPrompt: userPrompt, history: conversationHistory }),
    });
    
    const data = await response.json();
    setConversationHistory(prev => [...prev, { role: 'model', parts: [{ text: data.result }] }]);
    
    const shouldReplaceCode = userPrompt.includes('create') || userPrompt.includes('fix') || userPrompt.includes('write');

    if (shouldReplaceCode) {
      setCode(data.result);
      setAgentResponse('✅ Agent has updated the code on the screen.');
    } else {
      setAgentResponse(data.result);
    n}
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-mono p-4 gap-4">
      <h1 className="text-2xl font-bold text-center">Gemini AI Agent Studio</h1>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 w-full p-4 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none"
        spellCheck="false"
      />
      <div className="flex gap-2">
        <input
          type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Type your command here..."
          className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-md"
        />
        <button
          onClick={handleAgentAction}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600"
        >
          {isLoading ? 'Thinking...' : 'Run Agent'}
        </button>
      </div>
      <div className="h-48 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-y-auto">
         <ReactMarkdown remarkPlugins={[remarkGfm]}>{agentResponse}</ReactMarkdown>
      </div>
      <div className="h-48 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">Conversation History</h2>
        <div className="text-sm whitespace-pre-wrap">
          {conversationHistory.map((entry, index) => (
            <div key={index} className={`p-2 rounded-md ${entry.role === 'user' ? 'bg-gray-700' : 'bg-gray-600'}`}>
              <strong>{entry.role}:</strong>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.parts[0].text}</ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}