'use client';

import React from 'react';

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">This is a simple test page to check if Next.js is working correctly.</p>
      <div className="p-4 bg-blue-100 rounded-md">
        <p>If you can see this page, the basic Next.js functionality is working!</p>
      </div>
    </div>
  );
}
