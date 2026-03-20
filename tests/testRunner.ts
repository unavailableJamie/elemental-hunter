
export interface TestResult {
    description: string;
    status: 'pass' | 'fail';
    error?: string;
}

// Simple assertion/expectation library
export const expect = <T>(actual: T) => ({
    toBe: (expected: T) => {
        if (actual !== expected) {
            throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
        }
    },
    toEqual: (expected: T) => {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
            throw new Error(`Expected ${actualStr} to equal ${expectedStr}`);
        }
    },
    toBeDefined: () => {
        if (typeof actual === 'undefined' || actual === null) {
            throw new Error(`Expected value to be defined, but it was ${actual}`);
        }
    },
});

// Test runner function
export const test = (description: string, testFn: () => void): TestResult => {
    try {
        testFn();
        return { description, status: 'pass' };
    } catch (e) {
        return { description, status: 'fail', error: (e as Error).stack || (e as Error).message };
    }
};
