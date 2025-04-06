# KodeLab - Interactive Coding Challenge Platform

KodeLab is an interactive coding challenge platform designed to help users improve their programming skills through hands-on practice. The platform provides a variety of coding challenges with real-time feedback and execution.

## Features

- **Interactive Code Editor**: Write and execute code directly in your browser
- **Multiple Languages**: Support for JavaScript, Python, Java, C++, and more
- **Real-time Feedback**: Get immediate results and learn from your mistakes
- **Progress Tracking**: Monitor your improvement over time
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop and mobile devices
- **Leaderboard System**: Compete with other developers and see where you stand
- **Community Forum**: Connect with fellow developers, ask questions, and share knowledge
- **Structured Curriculum**: Follow a progressive learning path designed to take you from beginner to expert

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI
- CodeMirror 6
- React Query

### Backend
- FastAPI
- Supabase (Authentication and Database)
- Docker (Code Execution)
- Python

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- Docker
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kodelab.git
cd kodelab
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

5. Update the `.env` file with your Supabase credentials and other settings.

### Running the Application

1. Start the frontend development server:
```bash
npm run dev
```

2. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

3. Or use Docker Compose to run both frontend and backend:
```bash
docker-compose up
```

### Deployment

#### Frontend Deployment to Vercel

1. Install the Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Set up environment variables:
```bash
vercel secrets add supabase_anon_key "your-supabase-anon-key"
vercel secrets add api_url "https://kodelab-api.vercel.app/api"
```

4. Deploy the frontend:
```bash
vercel
```

5. For production deployment:
```bash
vercel --prod
```

#### Backend Deployment to Vercel

1. Navigate to the backend directory:
```bash
cd backend
```

2. Set up environment variables:
```bash
vercel secrets add supabase_url "https://tpgqvaeyfpalxbxpfrcm.supabase.co"
vercel secrets add supabase_key "your-supabase-key"
vercel secrets add secret_key "your-secret-key"
```

3. Deploy the backend:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

## Project Structure

```
kodelab/
├── src/                      # Frontend source code
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── lib/                  # Utility functions and API clients
│   └── styles/               # CSS styles
├── backend/                  # Backend source code
│   ├── app/                  # FastAPI application
│   ├── scripts/              # Database scripts
│   └── docker/               # Docker configuration
├── public/                   # Static assets
└── docker-compose.yml        # Docker Compose configuration
```

## Database Schema

The application uses Supabase with the following tables:

1. **Authentication**
   - `auth.users` - Managed by Supabase
   - `profiles` - User profiles with additional information

2. **Tasks**
   - `tasks` - Coding challenges
   - `task_submissions` - User submissions for tasks

3. **Forum**
   - `forum_categories` - Forum categories
   - `forum_posts` - Forum posts
   - `forum_comments` - Post comments
   - `forum_post_likes` - Post likes
   - `forum_comment_likes` - Comment likes

4. **Curriculum**
   - `courses` - Curriculum courses
   - `modules` - Course modules
   - `lessons` - Module lessons
   - `user_progress` - User progress tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Tasks
- `GET /api/tasks` - Get list of tasks
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create a new task (admin only)
- `PUT /api/tasks/:id` - Update a task (admin only)
- `DELETE /api/tasks/:id` - Delete a task (admin only)

### Submissions
- `POST /api/submissions` - Submit solution with test execution
- `GET /api/submissions/:id` - Get submission details
- `GET /api/submissions` - Get user's submissions

### Code Execution
- `POST /api/code/execute-code` - Execute code without tests

### Progress
- `GET /api/progress` - Get user's progress
- `GET /api/progress/:courseId` - Get progress for specific course
- `PUT /api/progress/:courseId/:lessonId` - Update progress for a lesson

### Forum
- `GET /api/forum/categories` - Get forum categories
- `GET /api/forum/posts` - Get forum posts
- `GET /api/forum/posts/:id` - Get forum post details
- `POST /api/forum/posts` - Create a forum post
- `GET /api/forum/posts/:id/comments` - Get comments for a post
- `POST /api/forum/posts/:id/comments` - Add a comment to a post

### Curriculum
- `GET /api/curriculum/courses` - Get list of courses
- `GET /api/curriculum/courses/:id` - Get course details
- `GET /api/curriculum/modules/:id` - Get module details
- `GET /api/curriculum/lessons/:id` - Get lesson details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Supabase](https://supabase.io/)
- [CodeMirror](https://codemirror.net/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
