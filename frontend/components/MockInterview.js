import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const MockInterview = ({ interviewId, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [status, setStatus] = useState('ready'); // ready, in-progress, reviewing, completed
  const [responses, setResponses] = useState([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Mock questions data
  useEffect(() => {
    // In a real implementation, this would fetch questions from the API
    const mockQuestions = [
      {
        id: 1,
        text: "Tell me about yourself and your experience.",
        category: "behavioral",
        difficulty: "easy",
        tips: "Keep it professional and relevant to the job. Focus on your most recent and relevant experience."
      },
      {
        id: 2,
        text: "What are your greatest strengths and how do they relate to this position?",
        category: "behavioral",
        difficulty: "medium",
        tips: "Highlight strengths that are directly relevant to the job requirements."
      },
      {
        id: 3,
        text: "Describe a challenging situation you faced at work and how you handled it.",
        category: "behavioral",
        difficulty: "medium",
        tips: "Use the STAR method: Situation, Task, Action, Result."
      },
      {
        id: 4,
        text: "Why are you interested in this position and our company?",
        category: "behavioral",
        difficulty: "easy",
        tips: "Show that you've done your research on the company and understand the role."
      },
      {
        id: 5,
        text: "Where do you see yourself in 5 years?",
        category: "behavioral",
        difficulty: "medium",
        tips: "Be honest but strategic. Focus on career growth that aligns with the company's path."
      }
    ];
    
    setQuestions(mockQuestions);
    setCurrentQuestion(mockQuestions[0]);
  }, [interviewId]);
  
  // Set up speech recognition
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
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript((prev) => prev + finalTranscript + (interimTranscript ? ` ${interimTranscript}` : ''));
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      toast.error(`Speech recognition error: ${event.error}`);
    };
    
    recognition.onend = () => {
      if (isRecording) {
        recognition.start();
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  // Handle recording state changes
  useEffect(() => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.start();
    } else if (!isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);
  
  // Timer logic
  useEffect(() => {
    if (status === 'in-progress') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [status]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const startInterview = () => {
    setStatus('in-progress');
    setIsRecording(true);
    setTimeLeft(120);
  };
  
  const handleNextQuestion = () => {
    // Save current response
    if (status === 'in-progress') {
      setResponses((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          response: transcript,
          feedback: null // This would be filled by AI in a real implementation
        }
      ]);
    }
    
    // Clear transcript for next question
    setTranscript('');
    
    // Move to next question or end interview
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentQuestion(questions[currentIndex + 1]);
      setTimeLeft(120);
    } else {
      // End of interview
      setIsRecording(false);
      setStatus('reviewing');
      
      // In a real implementation, this would send the responses to the API for analysis
      setTimeout(() => {
        // Mock AI feedback
        const updatedResponses = responses.map(response => ({
          ...response,
          feedback: {
            score: Math.floor(Math.random() * 3) + 3, // 3-5 score
            strengths: ["Good articulation", "Relevant examples provided"],
            improvements: ["Could be more concise", "Add more specific achievements"],
            suggestion: "Try to quantify your achievements more and focus on the most relevant experiences for this role."
          }
        }));
        
        setResponses(updatedResponses);
        setStatus('completed');
      }, 3000);
    }
  };
  
  const skipQuestion = () => {
    handleNextQuestion();
  };
  
  const finishInterview = () => {
    if (onComplete) {
      onComplete(responses);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {status === 'ready' && (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start Your Mock Interview?</h2>
          <p className="text-gray-600 mb-8">
            You'll be presented with {questions.length} questions. You'll have 2 minutes to answer each question.
            Your responses will be recorded and analyzed by our AI to provide feedback.
          </p>
          <button
            onClick={startInterview}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Interview
          </button>
        </div>
      )}
      
      {status === 'in-progress' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'} mr-2`}></span>
              <span className="text-sm font-medium">{isRecording ? 'Recording' : 'Not Recording'}</span>
            </div>
            <div className="text-lg font-semibold">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className={`text-lg font-mono ${timeLeft < 30 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{currentQuestion?.text}</h3>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Tip:</span> {currentQuestion?.tips}
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6 h-64 overflow-y-auto">
            <h4 className="font-medium text-gray-700 mb-2">Your Response:</h4>
            <p className="text-gray-800">
              {transcript || 'Start speaking to record your answer...'}
            </p>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`px-4 py-2 rounded-md ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } transition-colors`}
            >
              {isRecording ? 'Pause Recording' : 'Resume Recording'}
            </button>
            
            <div className="space-x-4">
              <button
                onClick={skipQuestion}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Skip Question
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {status === 'reviewing' && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analyzing Your Responses</h2>
          <p className="text-gray-600">
            Our AI is reviewing your answers and preparing feedback. This will take just a moment...
          </p>
        </div>
      )}
      
      {status === 'completed' && (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview Completed</h2>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Performance</h3>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700 font-medium">Average Score:</span>
                <span className="text-lg font-semibold text-blue-600">
                  {responses.reduce((sum, r) => sum + (r.feedback?.score || 0), 0) / responses.length}/5
                </span>
              </div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Key Strengths:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Good communication skills and articulation</li>
                  <li>Provided relevant examples to support answers</li>
                  <li>Demonstrated knowledge of the subject matter</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Areas for Improvement:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Be more concise in your responses</li>
                  <li>Quantify achievements with specific metrics</li>
                  <li>Structure answers using the STAR method more consistently</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Question-by-Question Feedback</h3>
            
            <div className="space-y-6">
              {responses.map((response, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4">
                    <h4 className="font-medium text-gray-800">Question {index + 1}: {response.questionText}</h4>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">Your Response:</h5>
                      <p className="text-gray-600 text-sm">{response.response || 'No response recorded'}</p>
                    </div>
                    
                    {response.feedback && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-700">Feedback:</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            response.feedback.score >= 4 ? 'bg-green-100 text-green-800' :
                            response.feedback.score >= 3 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Score: {response.feedback.score}/5
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-1">Strengths:</h6>
                            <ul className="list-disc list-inside text-xs text-gray-600">
                              {response.feedback.strengths.map((strength, i) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-1">Improvements:</h6>
                            <ul className="list-disc list-inside text-xs text-gray-600">
                              {response.feedback.improvements.map((improvement, i) => (
                                <li key={i}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                          <span className="font-medium">Suggestion: </span>
                          {response.feedback.suggestion}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => {
                // Reset the interview
                setStatus('ready');
                setCurrentIndex(0);
                setCurrentQuestion(questions[0]);
                setTranscript('');
                setResponses([]);
                setTimeLeft(120);
              }}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              Start New Interview
            </button>
            
            <button
              onClick={finishInterview}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save & Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
