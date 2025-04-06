'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EnhancedEditor } from '@/components/code-editor/enhanced-editor';
import { EditorLanguage } from '@/components/code-editor/code-editor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface TaskWorkspaceProps {
  taskId: string;
  title: string;
  description: string;
  initialCode: string;
  language: EditorLanguage;
  testCases?: { input: string; expectedOutput: string }[];
}

export function TaskWorkspace({
  taskId,
  title,
  description,
  initialCode,
  language,
  testCases = [],
}: TaskWorkspaceProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[]>([]);

  // Mutation for running code
  const runCodeMutation = useMutation({
    mutationFn: (code: string) => api.submissions.executeCode({
      code,
      language,
    }),
    onSuccess: (data) => {
      setOutput(data.error ? `Error: ${data.error}` : data.output);
      setIsRunning(false);
    },
    onError: (error: any) => {
      setOutput(`Error: ${error.message || 'An error occurred while executing your code.'}`);
      setIsRunning(false);
    },
  });

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running your code...');
    runCodeMutation.mutate(code);
  };

  // Mutation for submitting solution
  const submitCodeMutation = useMutation({
    mutationFn: (code: string) => api.submissions.createSubmission({
      task_id: taskId,
      code,
      language,
    }),
    onSuccess: (data) => {
      // Poll for submission results
      pollSubmissionResults(data.id);
    },
    onError: (error: any) => {
      setOutput(`Error: ${error.message || 'An error occurred while submitting your solution.'}`);
      setIsRunning(false);
    },
  });

  // Poll for submission results
  const pollSubmissionResults = async (submissionId: string) => {
    try {
      const submission = await api.submissions.getSubmission(submissionId);

      if (submission.status === 'completed') {
        const results = submission.results.map(result => ({
          passed: result.passed,
          message: `Test case: ${result.passed ? 'Passed' : 'Failed - ' + (result.error || 'Expected output did not match actual output')}`,
        }));

        setTestResults(results);
        setShowResults(true);
        setIsRunning(false);
      } else if (submission.status === 'failed') {
        setOutput('Error: Submission processing failed.');
        setIsRunning(false);
      } else {
        // Still processing, poll again after a delay
        setTimeout(() => pollSubmissionResults(submissionId), 1000);
      }
    } catch (error) {
      setOutput('Error: Failed to retrieve submission results.');
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput('Testing your solution...');
    submitCodeMutation.mutate(code);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRunCode}
            disabled={isRunning}
          >
            Run Code
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isRunning}
          >
            Submit Solution
          </Button>
        </div>
      </div>

      <Tabs defaultValue="description" className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="code">Code Editor</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="flex-1 overflow-auto p-4 border rounded-md">
          <div className="prose max-w-none">
            <p>{description}</p>

            {testCases.length > 0 && (
              <>
                <h3>Test Cases</h3>
                <ul>
                  {testCases.map((testCase, index) => (
                    <li key={index}>
                      <strong>Input:</strong> {testCase.input}<br />
                      <strong>Expected Output:</strong> {testCase.expectedOutput}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 border rounded-md overflow-hidden">
          <EnhancedEditor
            initialCode={code}
            language={language}
            onChange={setCode}
            supportedLanguages={[language]}
            showRunButton={true}
            showSaveButton={true}
            onRun={handleRunCode}
            onSave={handleSubmit}
          />
        </TabsContent>

        <TabsContent value="output" className="flex-1 border rounded-md">
          <pre className="p-4 font-mono text-sm h-full overflow-auto">
            {output || 'Run your code to see output here.'}
          </pre>
        </TabsContent>
      </Tabs>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Results</DialogTitle>
            <DialogDescription>
              {testResults.filter(r => r.passed).length} of {testResults.length} tests passed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}
              >
                <p className={result.passed ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
