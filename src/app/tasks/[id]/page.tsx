'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { TaskWorkspace } from '@/components/task/task-workspace';
import api from '@/lib/api';

// Mock data - in a real app, this would come from an API
const TASKS = {
  '1': {
    id: '1',
    title: 'Fix the API Error Handler',
    description: `
      # Fix the API Error Handler

      In this challenge, you need to debug and fix the error handling middleware in an Express.js API.

      ## Problem Description

      The current error handler doesn't properly format error responses and doesn't handle different types of errors correctly.

      Your task is to:
      1. Ensure all errors return a consistent JSON format
      2. Add proper status code handling
      3. Add logging for server errors
      4. Make sure validation errors include the validation details

      ## Requirements

      - All responses should have a consistent format: \`{ success: boolean, message: string, data?: any, errors?: any[] }\`
      - Server errors (500) should be logged but not expose internal details to clients
      - Validation errors should return a 400 status with details about the validation failures
      - Not Found errors should return a 404 status
      - Unauthorized errors should return a 401 status
    `,
    initialCode: `// Error handling middleware for Express.js
function errorHandler(err, req, res, next) {
  // TODO: Fix this error handler

  if (err) {
    res.status(500).send(err.message);
  }

  next();
}

module.exports = errorHandler;`,
    language: 'javascript',
    testCases: [
      {
        input: 'ValidationError with message "Name is required"',
        expectedOutput: '400 status with JSON response including validation details'
      },
      {
        input: 'NotFoundError with message "User not found"',
        expectedOutput: '404 status with JSON response'
      },
      {
        input: 'DatabaseError with internal server details',
        expectedOutput: '500 status with generic error message (no internal details exposed)'
      }
    ]
  },
  '2': {
    id: '2',
    title: 'Optimize the Search Algorithm',
    description: `
      # Optimize the Search Algorithm

      In this challenge, you need to improve the performance of a search function that's currently running too slowly.

      ## Problem Description

      The current search algorithm has O(n²) time complexity, making it too slow for large datasets.

      Your task is to optimize it to achieve better performance without changing the function's interface.

      ## Requirements

      - Maintain the same function signature
      - Improve time complexity (aim for O(n log n) or better)
      - All test cases must still pass
      - The solution must handle edge cases (empty arrays, no matches, etc.)
    `,
    initialCode: `function findMatches(items, searchTerm) {
  // Current implementation is inefficient
  const results = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let isMatch = false;

    // Check if the item matches the search term
    for (let j = 0; j < item.length; j++) {
      for (let k = 0; k < searchTerm.length; k++) {
        if (j + k < item.length &&
            item[j + k].toLowerCase() === searchTerm[k].toLowerCase()) {
          if (k === searchTerm.length - 1) {
            isMatch = true;
          }
        } else {
          break;
        }
      }
      if (isMatch) break;
    }

    if (isMatch) {
      results.push(item);
    }
  }

  return results;
}`,
    language: 'javascript',
    testCases: [
      {
        input: 'findMatches(["apple", "banana", "orange"], "an")',
        expectedOutput: '["banana", "orange"]'
      },
      {
        input: 'findMatches(["hello", "world", "hello world"], "o")',
        expectedOutput: '["hello", "world", "hello world"]'
      },
      {
        input: 'findMatches([], "test")',
        expectedOutput: '[]'
      }
    ]
  },
  '3': {
    id: '3',
    title: 'Build a Real-time Chat Feature',
    description: `
      # Build a Real-time Chat Feature

      In this challenge, you need to implement a WebSocket-based chat feature for a social media application.

      ## Problem Description

      You need to create a Python function that handles WebSocket connections and messages for a chat feature.

      ## Requirements

      - Handle new connections
      - Process incoming messages
      - Broadcast messages to all connected clients
      - Handle disconnections gracefully
      - Implement basic error handling
    `,
    initialCode: `import asyncio
import json
from websockets import WebSocketServerProtocol

# Store connected clients
connected_clients = set()

async def handle_connection(websocket: WebSocketServerProtocol):
    # TODO: Implement the WebSocket handler
    pass

# Start the WebSocket server
async def start_server():
    server = await asyncio.start_server(
        handle_connection, 'localhost', 8765
    )

    async with server:
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(start_server())`,
    language: 'python',
    testCases: [
      {
        input: 'New client connects',
        expectedOutput: 'Client added to connected_clients'
      },
      {
        input: 'Client sends message: {"type": "message", "content": "Hello"}',
        expectedOutput: 'Message broadcast to all connected clients'
      },
      {
        input: 'Client disconnects',
        expectedOutput: 'Client removed from connected_clients'
      }
    ]
  }
};

export default function TaskPage() {
  return (
    <ProtectedRoute>
      <TaskPageContent />
    </ProtectedRoute>
  );
}

function TaskPageContent() {
  const params = useParams();
  const taskId = params.id as string;

  // Fetch task data
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => api.tasks.getTask(taskId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Task</h2>
          <p className="text-gray-600">Unable to load the requested task. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Get the initial code for the selected language
  const initialCode = task.initial_code[task.supported_languages[0]] || '';
  const language = task.supported_languages[0] as 'javascript' | 'python';

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <TaskWorkspace
        taskId={task.id}
        title={task.title}
        description={task.description}
        initialCode={initialCode}
        language={language}
        testCases={task.test_cases}
      />
    </div>
  );
}
