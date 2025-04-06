import Link from 'next/link';

// Task card component for the tasks listing page
function TaskListCard({ 
  id, 
  title, 
  description, 
  difficulty, 
  category 
}: { 
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}) {
  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{title}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor[difficulty]}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
              {category}
            </span>
          </div>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        <Link 
          href={`/tasks/${id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          Start Challenge
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// Mock data for tasks
const TASKS = [
  {
    id: '1',
    title: 'Fix the API Error Handler',
    description: 'Debug and fix the error handling middleware in an Express.js API.',
    difficulty: 'easy',
    category: 'Backend',
  },
  {
    id: '2',
    title: 'Optimize the Search Algorithm',
    description: 'Improve the performance of a search function that\'s currently running too slowly.',
    difficulty: 'medium',
    category: 'Algorithms',
  },
  {
    id: '3',
    title: 'Build a Real-time Chat Feature',
    description: 'Implement a WebSocket-based chat feature for a social media application.',
    difficulty: 'hard',
    category: 'Full Stack',
  },
  {
    id: '4',
    title: 'Create a Responsive Navigation Menu',
    description: 'Build a responsive navigation menu with dropdown functionality using HTML, CSS, and JavaScript.',
    difficulty: 'easy',
    category: 'Frontend',
  },
  {
    id: '5',
    title: 'Implement JWT Authentication',
    description: 'Add JSON Web Token (JWT) authentication to a Node.js API.',
    difficulty: 'medium',
    category: 'Security',
  },
  {
    id: '6',
    title: 'Build a Data Visualization Dashboard',
    description: 'Create an interactive dashboard to visualize and analyze data using D3.js or Chart.js.',
    difficulty: 'hard',
    category: 'Data Visualization',
  },
];

// Filter options
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const CATEGORIES = ['All', 'Frontend', 'Backend', 'Full Stack', 'Algorithms', 'Security', 'Data Visualization'];

export default function TasksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Coding Challenges</h1>
        <p className="text-gray-600">Browse and solve interactive coding challenges to improve your skills</p>
      </div>
      
      {/* Filters */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search challenges..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium mb-1">Difficulty</label>
            <select id="difficulty" className="px-3 py-2 border rounded-md">
              {DIFFICULTIES.map(difficulty => (
                <option key={difficulty} value={difficulty.toLowerCase()}>{difficulty}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
            <select id="category" className="px-3 py-2 border rounded-md">
              {CATEGORIES.map(category => (
                <option key={category} value={category.toLowerCase()}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TASKS.map(task => (
          <TaskListCard
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description}
            difficulty={task.difficulty as 'easy' | 'medium' | 'hard'}
            category={task.category}
          />
        ))}
      </div>
    </div>
  );
}
