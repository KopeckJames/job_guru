import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { questionAPI } from '../../lib/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);

  // Mock data for categories and questions
  useEffect(() => {
    const mockCategories = [
      { id: 1, name: 'Behavioral', description: 'Questions about your behavior in past situations' },
      { id: 2, name: 'Technical', description: 'Questions testing your technical knowledge' },
      { id: 3, name: 'Situational', description: 'Questions about how you would handle hypothetical situations' },
      { id: 4, name: 'Leadership', description: 'Questions about your leadership experience and style' },
      { id: 5, name: 'Problem Solving', description: 'Questions testing your problem-solving abilities' }
    ];

    const mockQuestions = [
      {
        id: 1,
        text: 'Tell me about a time when you had to deal with a difficult team member.',
        category_id: 1,
        difficulty: 'medium',
        created_at: '2023-05-15T10:00:00Z'
      },
      {
        id: 2,
        text: 'What is the difference between a process and a thread?',
        category_id: 2,
        difficulty: 'hard',
        created_at: '2023-05-16T11:30:00Z'
      },
      {
        id: 3,
        text: 'How would you handle a situation where your team is falling behind on a project deadline?',
        category_id: 3,
        difficulty: 'medium',
        created_at: '2023-05-17T09:45:00Z'
      },
      {
        id: 4,
        text: 'Describe a time when you had to lead a team through a challenging project.',
        category_id: 4,
        difficulty: 'medium',
        created_at: '2023-05-18T14:20:00Z'
      },
      {
        id: 5,
        text: 'How would you design a parking lot system?',
        category_id: 5,
        difficulty: 'hard',
        created_at: '2023-05-19T16:10:00Z'
      },
      {
        id: 6,
        text: 'Tell me about a time when you had to learn a new skill quickly.',
        category_id: 1,
        difficulty: 'easy',
        created_at: '2023-05-20T13:15:00Z'
      },
      {
        id: 7,
        text: 'What is the time complexity of quicksort? How does it compare to other sorting algorithms?',
        category_id: 2,
        difficulty: 'hard',
        created_at: '2023-05-21T10:30:00Z'
      },
      {
        id: 8,
        text: 'How would you handle a conflict between two team members?',
        category_id: 3,
        difficulty: 'medium',
        created_at: '2023-05-22T11:45:00Z'
      }
    ];

    setCategories(mockCategories);
    setQuestions(mockQuestions);
    setIsLoading(false);
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredQuestions = questions.filter(question => {
    const matchesCategory = !filters.category || question.category_id === parseInt(filters.category);
    const matchesDifficulty = !filters.difficulty || question.difficulty === filters.difficulty;
    const matchesSearch = !filters.search ||
      question.text.toLowerCase().includes(filters.search.toLowerCase());

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    setAiAnswer(null);
  };

  const handleGenerateAnswer = async () => {
    if (!selectedQuestion) return;

    setIsGeneratingAnswer(true);

    try {
      // In a real implementation, this would call the API
      // const response = await questionAPI.generateAnswer(selectedQuestion.id, {
      //   context: 'software engineering',
      //   experience_level: 'mid-level',
      //   job_title: 'Software Engineer'
      // });

      // Mock AI-generated answer
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockAnswers = {
        1: "When dealing with a difficult team member, I first try to understand their perspective and the root cause of any issues. In one situation at my previous job, a team member was consistently missing deadlines and seemed disengaged. Instead of escalating immediately, I scheduled a private conversation to check if everything was okay. I discovered they were dealing with some personal challenges that were affecting their work. We worked together to create a temporary adjustment to their workload and connected them with company resources for support. I also made sure to provide clear expectations and regular check-ins. Within a few weeks, their performance improved significantly. This experience taught me the importance of empathy, clear communication, and addressing issues directly but compassionately.",

        2: "A process is an instance of a program that is being executed, while a thread is a flow of execution within a process. The key differences include:\n\n1. Memory allocation: Processes have separate memory spaces, while threads share the memory space of their parent process.\n\n2. Communication: Inter-process communication is more complex and requires mechanisms like pipes or sockets, while threads can communicate directly through shared memory.\n\n3. Context switching: Switching between processes is more expensive than switching between threads because the operating system needs to save and load more state information.\n\n4. Resource ownership: Processes own resources like file handles, while threads share the resources of their process.\n\n5. Fault isolation: A crash in one process doesn't affect other processes, but a crash in one thread can bring down all threads in that process.\n\nProcesses provide better security and stability through isolation, while threads offer better performance for tasks that benefit from shared memory and communication.",

        3: "When facing a project deadline that my team is falling behind on, I would take the following steps:\n\n1. Assess the situation: Understand exactly how far behind we are and identify the critical bottlenecks.\n\n2. Communicate transparently: Inform stakeholders about the situation early rather than waiting until the last minute.\n\n3. Prioritize ruthlessly: Focus on must-have features and identify what can be deferred to a later release.\n\n4. Reallocate resources: Assign more team members to critical path items and remove obstacles that are slowing progress.\n\n5. Consider process improvements: Look for inefficiencies in our workflow that could be streamlined.\n\n6. Evaluate options: Present stakeholders with realistic options, such as extending the deadline, reducing scope, or adding resources.\n\n7. Create a recovery plan: Develop a detailed plan with specific actions, owners, and milestones to get back on track.\n\n8. Monitor closely: Implement more frequent check-ins to catch any new issues quickly.\n\nI believe in being proactive and transparent when challenges arise, while focusing on solutions rather than blame."
      };

      setAiAnswer(mockAnswers[selectedQuestion.id] || "I would approach this question by first understanding the key requirements and expectations. Then, I would draw from my relevant experience to provide a structured and thoughtful response that demonstrates my skills and problem-solving abilities. I would make sure to include specific examples where possible and connect my answer to the value I could bring to the organization.");

      setIsGeneratingAnswer(false);
    } catch (error) {
      console.error('Error generating answer:', error);
      toast.error('Failed to generate answer');
      setIsGeneratingAnswer(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Question Bank | Job Guru</title>
        <meta name="description" content="Practice with common interview questions" />
      </Head>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
          <Link href="/questions/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Add Question
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="input-field"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                className="input-field"
                value={filters.difficulty}
                onChange={handleFilterChange}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Search questions..."
                className="input-field"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>

        {/* Questions and Answer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Questions</h2>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredQuestions.length > 0 ? (
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {filteredQuestions.map(question => (
                    <div
                      key={question.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedQuestion?.id === question.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleSelectQuestion(question)}
                    >
                      <h3 className="font-medium text-gray-800 mb-2">{question.text}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {getCategoryName(question.category_id)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600">No questions match your filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Question Detail and Answer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Question & AI Answer</h2>
              </div>

              {selectedQuestion ? (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{selectedQuestion.text}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {getCategoryName(selectedQuestion.category_id)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        selectedQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedQuestion.difficulty.charAt(0).toUpperCase() + selectedQuestion.difficulty.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-800">AI-Generated Answer</h4>
                      <button
                        onClick={handleGenerateAnswer}
                        disabled={isGeneratingAnswer}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                      >
                        {isGeneratingAnswer ? 'Generating...' : aiAnswer ? 'Regenerate Answer' : 'Generate Answer'}
                      </button>
                    </div>

                    {isGeneratingAnswer ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    ) : aiAnswer ? (
                      <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-line">
                        {aiAnswer}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-lg text-center">
                        <p className="text-gray-600">
                          Click "Generate Answer" to get an AI-generated response to this question.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Tips for Answering</h4>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Be specific and use the STAR method (Situation, Task, Action, Result) for behavioral questions.</li>
                        <li>Keep your answer concise and focused on the question.</li>
                        <li>Use concrete examples from your experience when possible.</li>
                        <li>Practice your answer out loud to improve delivery.</li>
                        <li>Tailor your response to the specific job and company.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-600">
                    Select a question from the list to view details and generate an AI answer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
    </Layout>
  );
}
