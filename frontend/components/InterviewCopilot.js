import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const InterviewCopilot = ({ interviewId, sessionId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef(null);
  
  // Connect to WebSocket
  useEffect(() => {
    if (!interviewId || !sessionId) return;
    
    const connectWebSocket = () => {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/api/v1/interviews/ws/${interviewId}/${sessionId}`;
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setIsConnected(true);
        toast.success('Connected to interview session');
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'suggestion') {
          setSuggestions((prev) => [...prev, data.content]);
        } else if (data.type === 'error') {
          toast.error(data.content);
        }
      };
      
      socket.onclose = () => {
        setIsConnected(false);
        toast.info('Disconnected from interview session');
        
        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Error connecting to interview session');
      };
      
      socketRef.current = socket;
    };
    
    connectWebSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [interviewId, sessionId]);
  
  // Speech recognition setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          
          // Send transcript to server for processing
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
              type: 'transcript',
              content: transcript
            }));
          }
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript((prev) => prev + finalTranscript + (interimTranscript ? ` ${interimTranscript}` : ''));
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error(`Speech recognition error: ${event.error}`);
    };
    
    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };
    
    // Start/stop recognition based on isListening state
    if (isListening) {
      recognition.start();
    }
    
    return () => {
      recognition.stop();
    };
  }, [isListening]);
  
  const toggleListening = () => {
    setIsListening((prev) => !prev);
  };
  
  const clearTranscript = () => {
    setTranscript('');
  };
  
  const clearSuggestions = () => {
    setSuggestions([]);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-semibold">Interview Copilot</h2>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50">
        {/* Transcript Panel */}
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Transcript</h3>
            <div className="flex space-x-2">
              <button
                onClick={toggleListening}
                className={`px-3 py-1 rounded-md ${
                  isListening ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                }`}
              >
                {isListening ? 'Stop' : 'Start'} Listening
              </button>
              <button
                onClick={clearTranscript}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-md">
            {transcript || 'No transcript yet. Start listening to begin.'}
          </div>
        </div>
        
        {/* Suggestions Panel */}
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">AI Suggestions</h3>
            <button
              onClick={clearSuggestions}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md"
            >
              Clear
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
                    <p className="text-gray-800">{suggestion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Suggestions will appear here as you speak.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-b-lg">
        <p className="text-sm text-gray-600">
          Tip: Speak clearly and at a moderate pace for best results. The AI will provide suggestions based on your conversation.
        </p>
      </div>
    </div>
  );
};

export default InterviewCopilot;
