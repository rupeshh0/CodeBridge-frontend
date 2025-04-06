'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          KodeLab
        </Link>

        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <Link href="/challenges" className="hover:text-blue-600 transition-colors">
                Challenges
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="hover:text-blue-600 transition-colors">
                Leaderboard
              </Link>
            </li>
            <li>
              <Link href="/forum" className="hover:text-blue-600 transition-colors">
                Forum
              </Link>
            </li>
            <li>
              <Link href="/curriculum" className="hover:text-blue-600 transition-colors">
                Curriculum
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Link href="/auth/login" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
              Login
            </Link>
            <Link href="/auth/register" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
