'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/context/auth-context';
import api from '@/lib/api';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { ActivityHeatmap } from '@/components/dashboard/activity-heatmap';
import { SkillRadar } from '@/components/dashboard/skill-radar';
import { LanguageDistribution } from '@/components/dashboard/language-distribution';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for completed challenges
const COMPLETED_CHALLENGES = [
  {
    id: '1',
    title: 'Fix the API Error Handler',
    completedAt: '2023-04-01T10:30:00Z',
    score: 85,
  },
];

// Mock data for in-progress challenges
const IN_PROGRESS_CHALLENGES = [
  {
    id: '2',
    title: 'Optimize the Search Algorithm',
    lastAttemptAt: '2023-04-02T14:45:00Z',
    progress: 60,
  },
];

// Mock data for achievements
const ACHIEVEMENTS = [
  {
    id: '1',
    title: 'First Challenge Completed',
    description: 'Successfully completed your first coding challenge',
    icon: '🏆',
    unlockedAt: '2023-04-01T10:30:00Z',
  },
  {
    id: '2',
    title: 'Code Explorer',
    description: 'Attempted challenges in 3 different categories',
    icon: '🔍',
    unlockedAt: null,
    progress: 1,
    total: 3,
  },
  {
    id: '3',
    title: 'Bug Squasher',
    description: 'Fixed 5 bugs in debugging challenges',
    icon: '🐛',
    unlockedAt: null,
    progress: 1,
    total: 5,
  },
];

// Mock data for activity
const ACTIVITY = [
  {
    id: '1',
    type: 'challenge_completed',
    title: 'Completed "Fix the API Error Handler"',
    timestamp: '2023-04-01T10:30:00Z',
  },
  {
    id: '2',
    type: 'challenge_started',
    title: 'Started "Optimize the Search Algorithm"',
    timestamp: '2023-04-02T14:45:00Z',
  },
  {
    id: '3',
    type: 'achievement_unlocked',
    title: 'Unlocked "First Challenge Completed" achievement',
    timestamp: '2023-04-01T10:31:00Z',
  },
];

// Format date for display
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user progress
  const { data: progressData = [], isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => api.progress.getUserProgress(),
  });

  // Fetch user stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => api.progress.getUserStats(),
  });

  // Calculate stats
  const totalChallenges = statsData?.total_tasks || 0;
  const completedChallenges = statsData?.completed_tasks || 0;
  const completionRate = statsData?.completion_rate || 0;
  const averageScore = 0; // This would come from the API in a real implementation

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.full_name || user?.username}</h1>
        <p className="text-gray-600">Track your progress and achievements</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalChallenges}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedChallenges}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completionRate.toFixed(0)}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{averageScore.toFixed(0)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressChart
              data={[
                { category: 'Algorithms', completed: 5, attempted: 8 },
                { category: 'Data Structures', completed: 3, attempted: 6 },
                { category: 'Web Dev', completed: 7, attempted: 10 },
                { category: 'Database', completed: 2, attempted: 4 },
                { category: 'DevOps', completed: 1, attempted: 3 },
              ]}
            />

            <SkillRadar
              data={[
                { subject: 'Problem Solving', score: 80, fullMark: 100 },
                { subject: 'Algorithms', score: 65, fullMark: 100 },
                { subject: 'Data Structures', score: 70, fullMark: 100 },
                { subject: 'Web Development', score: 85, fullMark: 100 },
                { subject: 'Databases', score: 60, fullMark: 100 },
                { subject: 'DevOps', score: 50, fullMark: 100 },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LanguageDistribution
              data={[
                { name: 'JavaScript', value: 25, color: '#f7df1e' },
                { name: 'Python', value: 18, color: '#3776ab' },
                { name: 'Java', value: 12, color: '#007396' },
                { name: 'C++', value: 8, color: '#00599c' },
                { name: 'Rust', value: 5, color: '#dea584' },
              ]}
            />

            <ActivityHeatmap
              data={[
                { date: '2023-06-01', count: 4 },
                { date: '2023-06-02', count: 2 },
                { date: '2023-06-05', count: 7 },
                { date: '2023-06-10', count: 3 },
                { date: '2023-06-15', count: 5 },
                { date: '2023-06-20', count: 8 },
                { date: '2023-06-25', count: 6 },
                { date: '2023-07-01', count: 9 },
                { date: '2023-07-05', count: 3 },
                { date: '2023-07-10', count: 5 },
              ]}
            />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {ACTIVITY.slice(0, 3).map(activity => (
                  <li key={activity.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">{formatDate(activity.timestamp)}</p>
                    </div>
                    {activity.type === 'challenge_completed' && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>
                    )}
                    {activity.type === 'challenge_started' && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Started</span>
                    )}
                    {activity.type === 'achievement_unlocked' && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Achievement</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All Activity
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* In Progress Challenges */}
            <Card>
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
                <CardDescription>Challenges you've started but not completed</CardDescription>
              </CardHeader>
              <CardContent>
                {IN_PROGRESS_CHALLENGES.length > 0 ? (
                  <ul className="space-y-4">
                    {IN_PROGRESS_CHALLENGES.map(challenge => (
                      <li key={challenge.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Link href={`/tasks/${challenge.id}`} className="font-medium hover:text-blue-600">
                            {challenge.title}
                          </Link>
                          <span className="text-sm text-gray-500">
                            Last attempt: {formatDate(challenge.lastAttemptAt)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${challenge.progress}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">You don't have any challenges in progress.</p>
                )}
                <div className="mt-4 text-center">
                  <Link
                    href="/tasks"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Find New Challenges
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {ACHIEVEMENTS.slice(0, 3).map(achievement => (
                    <li key={achievement.id} className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                        {achievement.unlockedAt ? (
                          <p className="text-xs text-gray-500 mt-1">
                            Unlocked on {formatDate(achievement.unlockedAt)}
                          </p>
                        ) : (
                          <div className="mt-1">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-purple-600 h-1.5 rounded-full"
                                  style={{ width: `${(achievement.progress! / achievement.total!) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {achievement.progress}/{achievement.total}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Achievements
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Challenges</CardTitle>
              <CardDescription>Challenges you've successfully completed</CardDescription>
            </CardHeader>
            <CardContent>
              {COMPLETED_CHALLENGES.length > 0 ? (
                <ul className="space-y-4">
                  {COMPLETED_CHALLENGES.map(challenge => (
                    <li key={challenge.id} className="flex justify-between items-center">
                      <div>
                        <Link href={`/tasks/${challenge.id}`} className="font-medium hover:text-blue-600">
                          {challenge.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Completed on {formatDate(challenge.completedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Completed
                        </span>
                        <span className="font-medium">{challenge.score}/100</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">You haven't completed any challenges yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In Progress Challenges</CardTitle>
              <CardDescription>Challenges you've started but not completed</CardDescription>
            </CardHeader>
            <CardContent>
              {IN_PROGRESS_CHALLENGES.length > 0 ? (
                <ul className="space-y-4">
                  {IN_PROGRESS_CHALLENGES.map(challenge => (
                    <li key={challenge.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Link href={`/tasks/${challenge.id}`} className="font-medium hover:text-blue-600">
                          {challenge.title}
                        </Link>
                        <span className="text-sm text-gray-500">
                          Last attempt: {formatDate(challenge.lastAttemptAt)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${challenge.progress}%` }}
                        ></div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">You don't have any challenges in progress.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>Track your accomplishments and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6">
                {ACHIEVEMENTS.map(achievement => (
                  <li key={achievement.id} className="flex items-start gap-4">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                      {achievement.unlockedAt ? (
                        <p className="text-xs text-gray-500 mt-1">
                          Unlocked on {formatDate(achievement.unlockedAt)}
                        </p>
                      ) : (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${(achievement.progress! / achievement.total!) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 min-w-[40px]">
                              {achievement.progress}/{achievement.total}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    {achievement.unlockedAt && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        Unlocked
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Your recent actions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {ACTIVITY.map(activity => (
                  <li key={activity.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">{formatDate(activity.timestamp)}</p>
                    </div>
                    {activity.type === 'challenge_completed' && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>
                    )}
                    {activity.type === 'challenge_started' && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Started</span>
                    )}
                    {activity.type === 'achievement_unlocked' && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Achievement</span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
