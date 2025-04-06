-- Sample data for KodeLab

-- Insert forum categories
INSERT INTO forum_categories (name, description, slug)
VALUES
  ('General', 'General discussion about programming and coding', 'general'),
  ('JavaScript', 'Discussion about JavaScript programming language', 'javascript'),
  ('Python', 'Discussion about Python programming language', 'python'),
  ('Java', 'Discussion about Java programming language', 'java'),
  ('C++', 'Discussion about C++ programming language', 'cpp'),
  ('Web Development', 'Discussion about web development', 'web-development'),
  ('Data Structures', 'Discussion about data structures', 'data-structures'),
  ('Algorithms', 'Discussion about algorithms', 'algorithms'),
  ('Help & Support', 'Get help with coding problems', 'help-support');

-- Insert tasks
INSERT INTO tasks (title, description, difficulty, category, languages, initial_code, test_cases, solution, hints)
VALUES
  (
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    'easy',
    ARRAY['algorithms', 'arrays'],
    ARRAY['javascript', 'python', 'java', 'cpp'],
    '{"javascript": "function twoSum(nums, target) {\n  // Your code here\n}", "python": "def two_sum(nums, target):\n    # Your code here\n    pass", "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}", "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};"}',
    '[{"input": "[2,7,11,15], 9", "expected_output": "[0,1]"}, {"input": "[3,2,4], 6", "expected_output": "[1,2]"}, {"input": "[3,3], 6", "expected_output": "[0,1]"}]',
    '{"javascript": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}", "python": "def two_sum(nums, target):\n    map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in map:\n            return [map[complement], i]\n        map[num] = i\n    return []", "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}", "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (map.find(complement) != map.end()) {\n                return {map[complement], i};\n            }\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};"}',
    ARRAY['Try using a hash map to store the numbers you have seen so far', 'For each number, check if its complement (target - num) is in the hash map', 'If you find the complement, return the indices of the two numbers']
  ),
  (
    'Reverse a String',
    'Write a function that reverses a string. The input string is given as an array of characters.',
    'easy',
    ARRAY['algorithms', 'strings'],
    ARRAY['javascript', 'python', 'java', 'cpp'],
    '{"javascript": "function reverseString(s) {\n  // Your code here\n}", "python": "def reverse_string(s):\n    # Your code here\n    pass", "java": "class Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}", "cpp": "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Your code here\n    }\n};"}',
    '[{"input": "[\\"h\\",\\"e\\",\\"l\\",\\"l\\",\\"o\\"]", "expected_output": "[\\"o\\",\\"l\\",\\"l\\",\\"e\\",\\"h\\"]"}, {"input": "[\\"H\\",\\"a\\",\\"n\\",\\"n\\",\\"a\\",\\"h\\"]", "expected_output": "[\\"h\\",\\"a\\",\\"n\\",\\"n\\",\\"a\\",\\"H\\"]"}]',
    '{"javascript": "function reverseString(s) {\n  let left = 0;\n  let right = s.length - 1;\n  while (left < right) {\n    [s[left], s[right]] = [s[right], s[left]];\n    left++;\n    right--;\n  }\n  return s;\n}", "python": "def reverse_string(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1\n    return s", "java": "class Solution {\n    public void reverseString(char[] s) {\n        int left = 0;\n        int right = s.length - 1;\n        while (left < right) {\n            char temp = s[left];\n            s[left] = s[right];\n            s[right] = temp;\n            left++;\n            right--;\n        }\n    }\n}", "cpp": "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        int left = 0;\n        int right = s.size() - 1;\n        while (left < right) {\n            swap(s[left], s[right]);\n            left++;\n            right--;\n        }\n    }\n};"}',
    ARRAY['Try using two pointers, one at the beginning and one at the end', 'Swap the characters at the two pointers', 'Move the pointers towards the middle']
  );

-- Insert courses
INSERT INTO courses (title, description, slug, level, category, tags, image_url, duration_hours)
VALUES
  (
    'JavaScript Fundamentals',
    'Learn the fundamentals of JavaScript programming language, including variables, data types, functions, and control flow.',
    'javascript-fundamentals',
    'beginner',
    'javascript',
    ARRAY['javascript', 'web-development', 'programming'],
    'https://example.com/images/javascript-fundamentals.jpg',
    10
  ),
  (
    'Python for Beginners',
    'Learn the basics of Python programming language, including variables, data types, functions, and control flow.',
    'python-for-beginners',
    'beginner',
    'python',
    ARRAY['python', 'programming'],
    'https://example.com/images/python-for-beginners.jpg',
    8
  );

-- Insert modules for JavaScript Fundamentals course
INSERT INTO modules (course_id, title, description, order_index)
VALUES
  (
    (SELECT id FROM courses WHERE slug = 'javascript-fundamentals'),
    'Introduction to JavaScript',
    'Learn about the history of JavaScript, its role in web development, and how to set up your development environment.',
    1
  ),
  (
    (SELECT id FROM courses WHERE slug = 'javascript-fundamentals'),
    'Variables and Data Types',
    'Learn about variables, data types, and operators in JavaScript.',
    2
  );

-- Insert lessons for Introduction to JavaScript module
INSERT INTO lessons (module_id, title, content, order_index, type, duration_minutes)
VALUES
  (
    (SELECT id FROM modules WHERE title = 'Introduction to JavaScript' AND course_id = (SELECT id FROM courses WHERE slug = 'javascript-fundamentals')),
    'What is JavaScript?',
    'JavaScript is a programming language that was created in 1995 by Brendan Eich while he was working at Netscape Communications Corporation. It was originally designed to add interactivity to web pages, but it has since evolved into a versatile language that can be used for a wide range of applications, including web development, server-side programming, mobile app development, and more.',
    1,
    'text',
    10
  ),
  (
    (SELECT id FROM modules WHERE title = 'Introduction to JavaScript' AND course_id = (SELECT id FROM courses WHERE slug = 'javascript-fundamentals')),
    'Setting Up Your Development Environment',
    'To start coding in JavaScript, you need a text editor and a web browser. Popular text editors include Visual Studio Code, Sublime Text, and Atom. You can also use online code editors like CodePen, JSFiddle, or Replit.',
    2,
    'text',
    15
  );
