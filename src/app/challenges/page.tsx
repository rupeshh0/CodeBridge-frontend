'use client';

import React from 'react';

export default function ChallengesPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Coding Challenges</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Browse and solve interactive coding challenges to improve your skills</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {[
          { id: '1', title: 'Two Sum', difficulty: 'Easy', category: 'Algorithms' },
          { id: '2', title: 'Reverse a String', difficulty: 'Easy', category: 'Strings' },
          { id: '3', title: 'Merge Two Sorted Lists', difficulty: 'Easy', category: 'Linked Lists' },
          { id: '4', title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stacks' },
          { id: '5', title: 'Maximum Subarray', difficulty: 'Medium', category: 'Dynamic Programming' },
          { id: '6', title: 'Implement Stack using Arrays', difficulty: 'Easy', category: 'Data Structures' },
        ].map(challenge => (
          <div key={challenge.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{
                backgroundColor: challenge.difficulty === 'Easy' ? '#d1fae5' : challenge.difficulty === 'Medium' ? '#fef3c7' : '#fee2e2',
                color: challenge.difficulty === 'Easy' ? '#065f46' : challenge.difficulty === 'Medium' ? '#92400e' : '#b91c1c',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {challenge.difficulty}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{challenge.title}</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{challenge.category}</p>
            <a
              href={`/tasks/${challenge.id}`}
              style={{
                display: 'block',
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 'medium'
              }}
            >
              Solve Challenge
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
