# KodeLab API Documentation

This document provides detailed information about the KodeLab API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:8000/api
```

## Authentication

Most API endpoints require authentication using a JWT token. To authenticate, include the token in the Authorization header:

```
Authorization: Bearer <token>
```

You can obtain a token by logging in with the `/api/auth/login` endpoint.

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "loc": ["body", "field_name"],
      "msg": "Field-specific error message",
      "type": "validation_error"
    }
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. The limits are:

- General requests: 100 per minute
- Code execution: 20 per minute
- Submissions: 10 per minute

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
```

## Endpoints

### Authentication

#### Login

```
POST /auth/login
```

Authenticates a user and returns a JWT token.

**Request Body:**

```
username: string (email address)
password: string
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Register

```
POST /auth/register
```

Registers a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "full_name": "Full Name"
}
```

**Response:**

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "is_active": true,
  "is_admin": false,
  "created_at": "2023-04-01T10:30:00Z"
}
```

#### Get Current User

```
GET /auth/me
```

Returns information about the currently authenticated user.

**Response:**

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "is_active": true,
  "is_admin": false,
  "created_at": "2023-04-01T10:30:00Z"
}
```

### Tasks

#### Get Tasks

```
GET /tasks
```

Returns a list of tasks.

**Query Parameters:**

- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum number of items to return (default: 100)
- `difficulty`: Filter by difficulty (easy, medium, hard)
- `category`: Filter by category
- `search`: Search term for task title

**Response:**

```json
[
  {
    "id": "task_id",
    "title": "Task Title",
    "description": "Task description",
    "difficulty": "easy",
    "category": ["backend", "algorithms"],
    "initial_code": {
      "javascript": "// Initial code",
      "python": "# Initial code"
    },
    "supported_languages": ["javascript", "python"],
    "created_at": "2023-04-01T10:30:00Z",
    "updated_at": "2023-04-01T10:30:00Z",
    "created_by": "user_id",
    "is_published": true,
    "test_cases": [
      {
        "id": "test_case_id",
        "input": "Test input",
        "expected_output": "Expected output",
        "is_hidden": false,
        "explanation": "Test case explanation"
      }
    ]
  }
]
```

#### Get Task

```
GET /tasks/{task_id}
```

Returns a specific task by ID.

**Response:**

```json
{
  "id": "task_id",
  "title": "Task Title",
  "description": "Task description",
  "difficulty": "easy",
  "category": ["backend", "algorithms"],
  "initial_code": {
    "javascript": "// Initial code",
    "python": "# Initial code"
  },
  "supported_languages": ["javascript", "python"],
  "created_at": "2023-04-01T10:30:00Z",
  "updated_at": "2023-04-01T10:30:00Z",
  "created_by": "user_id",
  "is_published": true,
  "test_cases": [
    {
      "id": "test_case_id",
      "input": "Test input",
      "expected_output": "Expected output",
      "is_hidden": false,
      "explanation": "Test case explanation"
    }
  ]
}
```

#### Create Task (Admin Only)

```
POST /tasks
```

Creates a new task.

**Request Body:**

```json
{
  "title": "Task Title",
  "description": "Task description",
  "difficulty": "easy",
  "category": ["backend", "algorithms"],
  "initial_code": {
    "javascript": "// Initial code",
    "python": "# Initial code"
  },
  "supported_languages": ["javascript", "python"],
  "test_cases": [
    {
      "input": "Test input",
      "expected_output": "Expected output",
      "is_hidden": false,
      "explanation": "Test case explanation"
    }
  ]
}
```

**Response:**

Same as Get Task.

#### Update Task (Admin Only)

```
PUT /tasks/{task_id}
```

Updates an existing task.

**Request Body:**

Same as Create Task, but all fields are optional.

**Response:**

Same as Get Task.

#### Delete Task (Admin Only)

```
DELETE /tasks/{task_id}
```

Deletes a task.

**Response:**

```json
{
  "message": "Task deleted successfully"
}
```

### Code Execution

#### Execute Code

```
POST /submissions/execute
```

Executes code without running tests.

**Request Body:**

```json
{
  "code": "console.log('Hello, world!');",
  "language": "javascript",
  "test_input": "Optional input for the code"
}
```

**Response:**

```json
{
  "output": "Hello, world!",
  "error": null,
  "execution_time": 0.123,
  "memory_used": 1024
}
```

#### Submit Solution

```
POST /submissions
```

Submits a solution for a task and runs tests.

**Request Body:**

```json
{
  "task_id": "task_id",
  "code": "console.log('Hello, world!');",
  "language": "javascript"
}
```

**Response:**

```json
{
  "id": "submission_id",
  "task_id": "task_id",
  "user_id": "user_id",
  "code": "console.log('Hello, world!');",
  "language": "javascript",
  "status": "pending",
  "execution_time": null,
  "memory_used": null,
  "created_at": "2023-04-01T10:30:00Z",
  "results": []
}
```

#### Get Submission

```
GET /submissions/{submission_id}
```

Returns a specific submission by ID.

**Response:**

```json
{
  "id": "submission_id",
  "task_id": "task_id",
  "user_id": "user_id",
  "code": "console.log('Hello, world!');",
  "language": "javascript",
  "status": "completed",
  "execution_time": 0.123,
  "memory_used": 1024,
  "created_at": "2023-04-01T10:30:00Z",
  "results": [
    {
      "test_case_id": "test_case_id",
      "passed": true,
      "output": "Hello, world!",
      "error": null,
      "execution_time": 0.123
    }
  ]
}
```

#### Get Submissions

```
GET /submissions
```

Returns a list of submissions for the current user.

**Query Parameters:**

- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum number of items to return (default: 100)
- `task_id`: Filter by task ID

**Response:**

```json
[
  {
    "id": "submission_id",
    "task_id": "task_id",
    "user_id": "user_id",
    "code": "console.log('Hello, world!');",
    "language": "javascript",
    "status": "completed",
    "execution_time": 0.123,
    "memory_used": 1024,
    "created_at": "2023-04-01T10:30:00Z",
    "results": [
      {
        "test_case_id": "test_case_id",
        "passed": true,
        "output": "Hello, world!",
        "error": null,
        "execution_time": 0.123
      }
    ]
  }
]
```

### Progress

#### Get User Progress

```
GET /progress
```

Returns progress for all tasks for the current user.

**Response:**

```json
[
  {
    "user_id": "user_id",
    "task_id": "task_id",
    "status": "completed",
    "best_submission_id": "submission_id",
    "attempts": 3,
    "last_attempt_at": "2023-04-01T10:30:00Z",
    "completed_at": "2023-04-01T10:30:00Z"
  }
]
```

#### Get User Stats

```
GET /progress/stats
```

Returns statistics for the current user.

**Response:**

```json
{
  "total_tasks": 10,
  "completed_tasks": 5,
  "in_progress_tasks": 2,
  "completion_rate": 50,
  "total_attempts": 15
}
```

#### Get Task Progress

```
GET /progress/{task_id}
```

Returns progress for a specific task.

**Response:**

```json
{
  "user_id": "user_id",
  "task_id": "task_id",
  "status": "completed",
  "best_submission_id": "submission_id",
  "attempts": 3,
  "last_attempt_at": "2023-04-01T10:30:00Z",
  "completed_at": "2023-04-01T10:30:00Z"
}
```

#### Get Task Leaderboard

```
GET /progress/leaderboard/{task_id}
```

Returns a leaderboard for a specific task.

**Query Parameters:**

- `limit`: Maximum number of items to return (default: 10)

**Response:**

```json
[
  {
    "username": "username",
    "completed_at": "2023-04-01T10:30:00Z",
    "execution_time": 0.123,
    "memory_used": 1024
  }
]
```
