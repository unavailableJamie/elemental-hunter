
import React, { useState } from 'react';
import type { TestResult } from '../tests/testRunner.ts';
import { runGameLogicTests } from '../tests/gameLogic.test.ts';

export const TestingDashboard: React.FC = () => {
    const [results, setResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const handleRunTests = async () => {
        setIsRunning(true);
        setResults([]);
        
        // Simulate a short delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 50));

        const testResults = runGameLogicTests();
        setResults(testResults);
        setIsRunning(false);
    };
    
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'pass').length;
    const failedTests = totalTests - passedTests;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-gray-700 rounded-xl shadow-2xl border border-gray-600">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Unit Testing Dashboard</h1>
                <button
                    onClick={handleRunTests}
                    disabled={isRunning}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:cursor-not-allowed"
                >
                    {isRunning ? 'Running...' : 'Run All Tests'}
                </button>
            </div>

            {totalTests > 0 && (
                 <div className="mb-6 p-4 bg-gray-800 rounded-lg flex justify-around text-center">
                    <div>
                        <span className="block text-2xl font-bold">{totalTests}</span>
                        <span className="text-sm text-gray-400">Total Tests</span>
                    </div>
                    <div>
                        <span className="block text-2xl font-bold text-green-400">{passedTests}</span>
                        <span className="text-sm text-gray-400">Passed</span>
                    </div>
                    <div>
                        <span className="block text-2xl font-bold text-red-400">{failedTests}</span>
                        <span className="text-sm text-gray-400">Failed</span>
                    </div>
                </div>
            )}
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {results.map((result, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${result.status === 'pass' ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700'}`}
                    >
                        <div className="flex items-center">
                            <span className="mr-3 text-xl">{result.status === 'pass' ? '✅' : '❌'}</span>
                            <p className="font-semibold text-white">{result.description}</p>
                        </div>
                        {result.status === 'fail' && result.error && (
                            <div className="mt-3 pl-9">
                                <pre className="bg-gray-900 text-red-300 text-xs p-3 rounded-md whitespace-pre-wrap font-mono">
                                    {result.error}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}
                {isRunning && <p className="text-center text-gray-400">Tests are running...</p>}
            </div>
        </div>
    );
};
