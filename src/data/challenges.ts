import { EditorLanguage } from '@/components/code-editor/code-editor';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string[];
  languages: EditorLanguage[];
  completionRate?: number;
  initialCode?: Record<EditorLanguage, string>;
}

export const CHALLENGES: Challenge[] = [
  // Algorithms
  {
    id: '1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'easy',
    category: ['Algorithms', 'Arrays', 'Hash Table'],
    languages: ['javascript', 'python', 'java'],
    completionRate: 75,
    initialCode: {
      javascript: `function twoSum(nums, target) {
  // Your code here
}`,
      python: `def two_sum(nums, target):
    # Your code here
    pass`,
      java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return null;
    }
}`,
    },
  },
  {
    id: '2',
    title: 'Reverse a String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters.',
    difficulty: 'easy',
    category: ['Algorithms', 'Strings', 'Two Pointers'],
    languages: ['javascript', 'python', 'java', 'cpp'],
    completionRate: 82,
    initialCode: {
      javascript: `function reverseString(s) {
  // Your code here
}`,
      python: `def reverse_string(s):
    # Your code here
    pass`,
      java: `public class Solution {
    public void reverseString(char[] s) {
        // Your code here
    }
}`,
      cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
        // Your code here
    }
};`,
    },
  },
  {
    id: '3',
    title: 'Merge Two Sorted Lists',
    description: 'Merge two sorted linked lists and return it as a sorted list.',
    difficulty: 'easy',
    category: ['Algorithms', 'Linked List', 'Recursion'],
    languages: ['javascript', 'python', 'java', 'cpp'],
    completionRate: 68,
  },
  {
    id: '4',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
    difficulty: 'easy',
    category: ['Algorithms', 'Stack', 'Strings'],
    languages: ['javascript', 'python', 'java'],
    completionRate: 70,
  },
  {
    id: '5',
    title: 'Maximum Subarray',
    description: 'Find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    difficulty: 'medium',
    category: ['Algorithms', 'Arrays', 'Dynamic Programming'],
    languages: ['javascript', 'python', 'java', 'cpp'],
    completionRate: 55,
  },
  
  // Data Structures
  {
    id: '6',
    title: 'Implement Stack using Arrays',
    description: 'Implement a stack data structure using arrays with push, pop, and peek operations.',
    difficulty: 'easy',
    category: ['Data Structures', 'Stack', 'Arrays'],
    languages: ['javascript', 'python', 'java', 'cpp'],
    completionRate: 78,
    initialCode: {
      javascript: `class Stack {
  constructor() {
    // Initialize your stack here
  }
  
  push(val) {
    // Your code here
  }
  
  pop() {
    // Your code here
  }
  
  peek() {
    // Your code here
  }
  
  isEmpty() {
    // Your code here
  }
}`,
      python: `class Stack:
    def __init__(self):
        # Initialize your stack here
        pass
    
    def push(self, val):
        # Your code here
        pass
    
    def pop(self):
        # Your code here
        pass
    
    def peek(self):
        # Your code here
        pass
    
    def is_empty(self):
        # Your code here
        pass`,
      java: `public class Stack {
    // Initialize your stack here
    
    public Stack() {
        // Constructor
    }
    
    public void push(int val) {
        // Your code here
    }
    
    public int pop() {
        // Your code here
        return 0;
    }
    
    public int peek() {
        // Your code here
        return 0;
    }
    
    public boolean isEmpty() {
        // Your code here
        return true;
    }
}`,
      cpp: `class Stack {
private:
    // Initialize your stack here
    
public:
    Stack() {
        // Constructor
    }
    
    void push(int val) {
        // Your code here
    }
    
    int pop() {
        // Your code here
        return 0;
    }
    
    int peek() {
        // Your code here
        return 0;
    }
    
    bool isEmpty() {
        // Your code here
        return true;
    }
};`,
    },
  },
  {
    id: '7',
    title: 'Binary Tree Inorder Traversal',
    description: 'Given the root of a binary tree, return the inorder traversal of its nodes values.',
    difficulty: 'medium',
    category: ['Data Structures', 'Tree', 'Depth-First Search'],
    languages: ['javascript', 'python', 'java'],
    completionRate: 60,
  },
  {
    id: '8',
    title: 'Implement Queue using Stacks',
    description: 'Implement a queue using only two stacks. The queue should support all functions of a normal queue (push, peek, pop, and empty).',
    difficulty: 'medium',
    category: ['Data Structures', 'Stack', 'Queue'],
    languages: ['javascript', 'python', 'java', 'cpp'],
    completionRate: 55,
  },
  
  // Web Development
  {
    id: '9',
    title: 'Build a Responsive Navigation Bar',
    description: 'Create a responsive navigation bar that collapses into a hamburger menu on mobile devices.',
    difficulty: 'easy',
    category: ['Web Development', 'HTML', 'CSS', 'JavaScript'],
    languages: ['javascript'],
    completionRate: 80,
    initialCode: {
      javascript: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Navigation</title>
  <style>
    /* Your CSS here */
  </style>
</head>
<body>
  <!-- Your HTML here -->
  
  <script>
    // Your JavaScript here
  </script>
</body>
</html>`,
    },
  },
  {
    id: '10',
    title: 'Implement Form Validation',
    description: 'Create a registration form with client-side validation for email, password strength, and matching password confirmation.',
    difficulty: 'medium',
    category: ['Web Development', 'JavaScript', 'Forms'],
    languages: ['javascript'],
    completionRate: 65,
  },
  {
    id: '11',
    title: 'Build a Todo List App',
    description: 'Create a todo list application with features to add, edit, delete, and mark tasks as complete.',
    difficulty: 'medium',
    category: ['Web Development', 'JavaScript', 'DOM'],
    languages: ['javascript'],
    completionRate: 70,
  },
  
  // Databases
  {
    id: '12',
    title: 'Design a Database Schema',
    description: 'Design a normalized database schema for an e-commerce application with products, customers, orders, and reviews.',
    difficulty: 'medium',
    category: ['Databases', 'SQL', 'Schema Design'],
    languages: ['sql'],
    completionRate: 60,
    initialCode: {
      sql: `-- Create tables for an e-commerce database
-- Include products, customers, orders, and reviews

-- Products table

-- Customers table

-- Orders table

-- Order Items table

-- Reviews table

-- Add any necessary constraints and relationships
`,
    },
  },
  {
    id: '13',
    title: 'Write Complex SQL Queries',
    description: 'Write SQL queries to retrieve data from multiple tables with joins, aggregations, and filtering.',
    difficulty: 'medium',
    category: ['Databases', 'SQL', 'Queries'],
    languages: ['sql'],
    completionRate: 55,
  },
  
  // Backend Development
  {
    id: '14',
    title: 'Build a RESTful API',
    description: 'Create a RESTful API with endpoints for CRUD operations on a resource.',
    difficulty: 'medium',
    category: ['Backend', 'API', 'REST'],
    languages: ['javascript', 'python'],
    completionRate: 62,
  },
  {
    id: '15',
    title: 'Implement Authentication',
    description: 'Add JWT-based authentication to a RESTful API with login, registration, and protected routes.',
    difficulty: 'hard',
    category: ['Backend', 'Security', 'Authentication'],
    languages: ['javascript', 'python'],
    completionRate: 48,
  },
  
  // Advanced Algorithms
  {
    id: '16',
    title: 'Implement Dijkstra\'s Algorithm',
    description: 'Implement Dijkstra\'s algorithm to find the shortest path in a weighted graph.',
    difficulty: 'hard',
    category: ['Algorithms', 'Graph', 'Shortest Path'],
    languages: ['javascript', 'python', 'java', 'cpp'],
    completionRate: 40,
  },
  {
    id: '17',
    title: 'Solve N-Queens Problem',
    description: 'Solve the N-Queens puzzle: place N queens on an NxN chessboard so that no two queens threaten each other.',
    difficulty: 'hard',
    category: ['Algorithms', 'Backtracking', 'Recursion'],
    languages: ['javascript', 'python', 'java', 'cpp'],
    completionRate: 35,
  },
  {
    id: '18',
    title: 'Implement a Trie',
    description: 'Implement a trie (prefix tree) with insert, search, and startsWith methods.',
    difficulty: 'medium',
    category: ['Data Structures', 'Trie', 'Tree'],
    languages: ['javascript', 'python', 'java', 'cpp'],
    completionRate: 52,
  },
];
