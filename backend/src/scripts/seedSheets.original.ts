import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DsaSheet } from '../models/DsaSheet';
import { DsaStep } from '../models/DsaStep';
import { MasterProblem } from '../models/MasterProblem';
import { SheetProblem } from '../models/SheetProblem';

dotenv.config();

const sheetsData = [
  {
    slug: 'striver-a2z',
    title: 'Striver A2Z DSA Sheet',
    description: 'Complete DSA roadmap from beginner to advanced.',
    source: 'Take U Forward',
    totalProblems: 455,
    icon: 'Code2',
    color: 'from-purple-600 to-indigo-600',
    tags: ['DSA', 'Beginner to Advanced', 'Complete DSA'],
    steps: [
      { stepNumber: 1, title: 'Step 1: Learn the basics', totalProblems: 30 },
      { stepNumber: 2, title: 'Step 2: Important Sorting Techniques', totalProblems: 7 },
      { stepNumber: 3, title: 'Step 3: Solve Problems on Arrays', totalProblems: 40 },
      { stepNumber: 4, title: 'Step 4: Binary Search [1D, 2D Arrays, Search Space]', totalProblems: 32 },
      { stepNumber: 5, title: 'Step 5: Strings [Basic and Medium]', totalProblems: 15 },
      { stepNumber: 6, title: 'Step 6: Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]', totalProblems: 35 },
      { stepNumber: 7, title: 'Step 7: Recursion [PatternWise]', totalProblems: 20 },
      { stepNumber: 8, title: 'Step 8: Bit Manipulation [Learn, Problems]', totalProblems: 18 },
      { stepNumber: 9, title: 'Step 9: Stack and Queues', totalProblems: 35 },
      { stepNumber: 10, title: 'Step 10: Sliding Window & Two Pointer', totalProblems: 22 },
      { stepNumber: 11, title: 'Step 11: Heaps', totalProblems: 15 },
      { stepNumber: 12, title: 'Step 12: Greedy Algorithms', totalProblems: 20 },
      { stepNumber: 13, title: 'Step 13: Binary Trees', totalProblems: 45 },
      { stepNumber: 14, title: 'Step 14: Binary Search Trees', totalProblems: 18 },
      { stepNumber: 15, title: 'Step 15: Graphs', totalProblems: 54 },
      { stepNumber: 16, title: 'Step 16: Dynamic Programming', totalProblems: 62 },
      { stepNumber: 17, title: 'Step 17: Tries', totalProblems: 8 },
    ],
  },
  {
    slug: 'love-babbar',
    title: 'Love Babbar Sheet',
    description: '450 selected questions to build strong problem solving skills.',
    source: 'Love Babbar',
    totalProblems: 450,
    icon: 'Heart',
    color: 'from-emerald-600 to-green-600',
    tags: ['DSA', 'Interview Preparation'],
    steps: [
      { stepNumber: 1, title: 'Arrays', totalProblems: 36 },
      { stepNumber: 2, title: 'Matrix', totalProblems: 10 },
      { stepNumber: 3, title: 'Strings', totalProblems: 42 },
      { stepNumber: 4, title: 'Searching & Sorting', totalProblems: 36 },
      { stepNumber: 5, title: 'LinkedList', totalProblems: 33 },
      { stepNumber: 6, title: 'Binary Trees', totalProblems: 38 },
      { stepNumber: 7, title: 'Binary Search Trees', totalProblems: 22 },
      { stepNumber: 8, title: 'Greedy', totalProblems: 35 },
      { stepNumber: 9, title: 'Backtracking', totalProblems: 19 },
      { stepNumber: 10, title: 'Stacks & Queues', totalProblems: 28 },
      { stepNumber: 11, title: 'Heaps', totalProblems: 18 },
      { stepNumber: 12, title: 'Graphs', totalProblems: 44 },
      { stepNumber: 13, title: 'Trie', totalProblems: 6 },
      { stepNumber: 14, title: 'Dynamic Programming', totalProblems: 56 },
      { stepNumber: 15, title: 'Bit Manipulation', totalProblems: 10 },
    ],
  },
  {
    slug: 'neetcode-150',
    title: 'Neetcode 150',
    description: 'The most popular 150 LeetCode patterns for FAANG interviews.',
    source: 'NeetCode',
    totalProblems: 150,
    icon: 'Zap',
    color: 'from-blue-600 to-cyan-600',
    tags: ['DSA', 'FAANG', 'Patterns'],
    steps: [
      { stepNumber: 1, title: 'Arrays & Hashing', totalProblems: 9 },
      { stepNumber: 2, title: 'Two Pointers', totalProblems: 5 },
      { stepNumber: 3, title: 'Sliding Window', totalProblems: 4 },
      { stepNumber: 4, title: 'Stack', totalProblems: 4 },
      { stepNumber: 5, title: 'Binary Search', totalProblems: 7 },
      { stepNumber: 6, title: 'LinkedList', totalProblems: 6 },
      { stepNumber: 7, title: 'Trees', totalProblems: 13 },
      { stepNumber: 8, title: 'Tries', totalProblems: 3 },
      { stepNumber: 9, title: 'Heap / Priority Queue', totalProblems: 5 },
      { stepNumber: 10, title: 'Backtracking', totalProblems: 7 },
      { stepNumber: 11, title: 'Graphs', totalProblems: 9 },
      { stepNumber: 12, title: 'Advanced Graphs', totalProblems: 5 },
      { stepNumber: 13, title: '1D Dynamic Programming', totalProblems: 12 },
      { stepNumber: 14, title: '2D Dynamic Programming', totalProblems: 10 },
      { stepNumber: 15, title: 'Greedy', totalProblems: 5 },
      { stepNumber: 16, title: 'Intervals', totalProblems: 5 },
      { stepNumber: 17, title: 'Math & Geometry', totalProblems: 6 },
      { stepNumber: 18, title: 'Bit Manipulation', totalProblems: 5 },
    ],
  },
  {
    slug: 'blind-75',
    title: 'Blind 75',
    description: 'Curated list of 75 Leetcode questions to land a job at top tech companies.',
    source: 'Blind',
    totalProblems: 75,
    icon: 'Target',
    color: 'from-purple-500 to-fuchsia-600',
    tags: ['DSA', 'FAANG', 'Quick Revision'],
    steps: [
      { stepNumber: 1, title: 'Array', totalProblems: 9 },
      { stepNumber: 2, title: 'Binary', totalProblems: 3 },
      { stepNumber: 3, title: 'Dynamic Programming', totalProblems: 10 },
      { stepNumber: 4, title: 'Graph', totalProblems: 7 },
      { stepNumber: 5, title: 'Interval', totalProblems: 3 },
      { stepNumber: 6, title: 'LinkedList', totalProblems: 5 },
      { stepNumber: 7, title: 'Matrix', totalProblems: 3 },
      { stepNumber: 8, title: 'String', totalProblems: 10 },
      { stepNumber: 9, title: 'Tree', totalProblems: 9 },
      { stepNumber: 10, title: 'Heap', totalProblems: 2 },
    ],
  },
  {
    slug: 'top-interview-150',
    title: 'Top Interview 150',
    description: 'Must-do questions directly recommended by top tech companies.',
    source: 'LeetCode',
    totalProblems: 150,
    icon: 'Briefcase',
    color: 'from-violet-600 to-purple-600',
    tags: ['DSA', 'Interview Preparation', 'LeetCode'],
    steps: [
      { stepNumber: 1, title: 'Array / String', totalProblems: 26 },
      { stepNumber: 2, title: 'Two Pointers', totalProblems: 7 },
      { stepNumber: 3, title: 'Sliding Window', totalProblems: 4 },
      { stepNumber: 4, title: 'Matrix', totalProblems: 6 },
      { stepNumber: 5, title: 'Hashmap', totalProblems: 8 },
      { stepNumber: 6, title: 'Intervals', totalProblems: 4 },
      { stepNumber: 7, title: 'Stack', totalProblems: 4 },
      { stepNumber: 8, title: 'LinkedList', totalProblems: 7 },
      { stepNumber: 9, title: 'Binary Tree General', totalProblems: 14 },
      { stepNumber: 10, title: 'Binary Tree BFS', totalProblems: 6 },
      { stepNumber: 11, title: 'Binary Search Tree', totalProblems: 5 },
      { stepNumber: 12, title: 'Graph General', totalProblems: 8 },
      { stepNumber: 13, title: 'Graph BFS', totalProblems: 4 },
      { stepNumber: 14, title: 'Trie', totalProblems: 3 },
      { stepNumber: 15, title: 'Backtracking', totalProblems: 7 },
      { stepNumber: 16, title: 'Divide & Conquer', totalProblems: 3 },
      { stepNumber: 17, title: 'Kadane\'s Algorithm', totalProblems: 2 },
      { stepNumber: 18, title: 'Binary Search', totalProblems: 7 },
      { stepNumber: 19, title: 'Heap', totalProblems: 5 },
      { stepNumber: 20, title: 'Bit Manipulation', totalProblems: 4 },
      { stepNumber: 21, title: 'Math', totalProblems: 6 },
      { stepNumber: 22, title: '1D DP', totalProblems: 8 },
      { stepNumber: 23, title: 'Multidimensional DP', totalProblems: 6 },
    ],
  },
  {
    slug: 'striver-sde',
    title: 'Striver SDE Sheet',
    description: 'Top 190 questions for last-minute SDE interview preparation.',
    source: 'Take U Forward',
    totalProblems: 190,
    icon: 'Code2',
    color: 'from-orange-600 to-red-600',
    tags: ['DSA', 'SDE', 'Interview Preparation'],
    steps: [
      { stepNumber: 1, title: 'Arrays', totalProblems: 36 },
      { stepNumber: 2, title: 'LinkedList', totalProblems: 15 },
      { stepNumber: 3, title: 'Greedy', totalProblems: 12 },
      { stepNumber: 4, title: 'Recursion & Backtracking', totalProblems: 10 },
      { stepNumber: 5, title: 'Binary Search', totalProblems: 10 },
      { stepNumber: 6, title: 'Stacks & Queues', totalProblems: 17 },
      { stepNumber: 7, title: 'Strings', totalProblems: 13 },
      { stepNumber: 8, title: 'Binary Trees', totalProblems: 22 },
      { stepNumber: 9, title: 'Binary Search Trees', totalProblems: 8 },
      { stepNumber: 10, title: 'Heaps', totalProblems: 6 },
      { stepNumber: 11, title: 'Graphs', totalProblems: 18 },
      { stepNumber: 12, title: 'Dynamic Programming', totalProblems: 27 },
      { stepNumber: 13, title: 'Trie', totalProblems: 3 },
    ],
  },
  {
    slug: 'dp-master',
    title: 'DP Master Sheet',
    description: 'Handpicked DP questions to become a DP master.',
    source: 'Coderyx',
    totalProblems: 120,
    icon: 'Brain',
    color: 'from-pink-600 to-rose-600',
    tags: ['DP', 'Dynamic Programming', 'Advanced'],
    steps: [
      { stepNumber: 1, title: '1D DP', totalProblems: 15 },
      { stepNumber: 2, title: '2D DP', totalProblems: 20 },
      { stepNumber: 3, title: 'DP on Grids', totalProblems: 10 },
      { stepNumber: 4, title: 'DP on Strings', totalProblems: 15 },
      { stepNumber: 5, title: 'DP on Subsequences', totalProblems: 15 },
      { stepNumber: 6, title: 'DP on Trees', totalProblems: 10 },
      { stepNumber: 7, title: 'DP on Graphs', totalProblems: 10 },
      { stepNumber: 8, title: 'DP with Bitmasking', totalProblems: 8 },
      { stepNumber: 9, title: 'Digit DP', totalProblems: 7 },
      { stepNumber: 10, title: 'DP with Probability', totalProblems: 5 },
      { stepNumber: 11, title: 'Advanced DP', totalProblems: 5 },
    ],
  },
  {
    slug: 'system-design',
    title: 'System Design Sheet',
    description: 'Learn system design with real-world case studies and problems.',
    source: 'Coderyx',
    totalProblems: 85,
    icon: 'Box',
    color: 'from-sky-600 to-blue-600',
    tags: ['System Design', 'Architecture', 'HLD'],
    steps: [
      { stepNumber: 1, title: 'Basics of System Design', totalProblems: 10 },
      { stepNumber: 2, title: 'Load Balancing & Proxies', totalProblems: 8 },
      { stepNumber: 3, title: 'Caching', totalProblems: 8 },
      { stepNumber: 4, title: 'Database Design', totalProblems: 10 },
      { stepNumber: 5, title: 'Distributed Systems', totalProblems: 10 },
      { stepNumber: 6, title: 'Microservices', totalProblems: 8 },
      { stepNumber: 7, title: 'Message Queues', totalProblems: 6 },
      { stepNumber: 8, title: 'Design Case Studies - 1', totalProblems: 10 },
      { stepNumber: 9, title: 'Design Case Studies - 2', totalProblems: 10 },
      { stepNumber: 10, title: 'LLD & Design Patterns', totalProblems: 5 },
    ],
  },
];

const striverProblems: Array<{
  stepNumber: number;
  problems: Array<{ problemId: number; name: string; difficulty: 'Easy' | 'Medium' | 'Hard'; platform: string }>;
}> = [
  {
    stepNumber: 1,
    problems: [
      { problemId: 101, name: 'User Input / Output', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 102, name: 'Data Types', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 103, name: 'If Else statements', difficulty: 'Easy', platform: 'GeeksforGeeks' },
      { problemId: 104, name: 'Switch Statement', difficulty: 'Easy', platform: 'GeeksforGeeks' },
      { problemId: 105, name: 'For loops', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 106, name: 'While loops', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 107, name: 'Pattern: Rectangular Star', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 108, name: 'Pattern: Right-Angled Triangle', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 109, name: 'Count Digits', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 110, name: 'Reverse a Number', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 111, name: 'Check Palindrome', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 112, name: 'GCD Or HCF', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 113, name: 'Armstrong Numbers', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 114, name: 'Print all Divisors', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 115, name: 'Check for Prime', difficulty: 'Easy', platform: 'CodeStudio' },
    ],
  },
  {
    stepNumber: 2,
    problems: [
      { problemId: 201, name: 'Selection Sort', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 202, name: 'Bubble Sort', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 203, name: 'Insertion Sort', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 204, name: 'Merge Sort', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 205, name: 'Recursive Bubble Sort', difficulty: 'Medium', platform: 'CodeStudio' },
      { problemId: 206, name: 'Recursive Insertion Sort', difficulty: 'Medium', platform: 'CodeStudio' },
      { problemId: 207, name: 'Quick Sort', difficulty: 'Medium', platform: 'CodeStudio' },
    ],
  },
  {
    stepNumber: 3,
    problems: [
      { problemId: 301, name: 'Largest Element in Array', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 302, name: 'Second Largest Element', difficulty: 'Easy', platform: 'GeeksforGeeks' },
      { problemId: 303, name: 'Check if Array is Sorted', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 304, name: 'Remove Duplicates', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 305, name: 'Left Rotate Array by One', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 306, name: 'Two Sum', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 307, name: 'Sort an array of 0s, 1s and 2s', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 308, name: 'Majority Element (>N/2)', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 309, name: "Kadane's Algorithm", difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 310, name: 'Stock Buy and Sell', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 311, name: 'Next Permutation', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 312, name: '3Sum', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 313, name: '4Sum', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 314, name: 'Largest subarray with 0 sum', difficulty: 'Medium', platform: 'GeeksforGeeks' },
      { problemId: 315, name: 'Subarray with given XOR', difficulty: 'Medium', platform: 'InterviewBit' },
      { problemId: 316, name: 'Merge Overlapping Subintervals', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 317, name: 'Merge two sorted arrays without extra space', difficulty: 'Hard', platform: 'LeetCode' },
      { problemId: 318, name: 'Find the repeating and missing number', difficulty: 'Hard', platform: 'CodeStudio' },
      { problemId: 319, name: 'Inversions of Array', difficulty: 'Hard', platform: 'CodeStudio' },
      { problemId: 320, name: 'Reverse Pairs', difficulty: 'Hard', platform: 'LeetCode' },
    ],
  },
  {
    stepNumber: 4,
    problems: [
      { problemId: 401, name: 'Binary Search', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 402, name: 'Lower Bound', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 403, name: 'Upper Bound', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 404, name: 'Search Insert Position', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 405, name: 'First and Last Occurrences', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 406, name: 'Search in Rotated Sorted Array I', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 407, name: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 408, name: 'Find out how many times array has been rotated', difficulty: 'Medium', platform: 'CodeStudio' },
      { problemId: 409, name: 'Single Element in a Sorted Array', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 410, name: 'Find Peak Element', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 411, name: 'Square Root of a number', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 412, name: 'Find the Nth root of an integer', difficulty: 'Medium', platform: 'CodeStudio' },
      { problemId: 413, name: 'Koko Eating Bananas', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 414, name: 'Minimum days to make M bouquets', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 415, name: 'Find the smallest divisor given a threshold', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 416, name: 'Capacity to Ship Packages within D Days', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 417, name: 'Aggressive Cows', difficulty: 'Hard', platform: 'CodeStudio' },
      { problemId: 418, name: 'Book Allocation Problem', difficulty: 'Hard', platform: 'CodeStudio' },
      { problemId: 419, name: 'Split Array - Largest Sum', difficulty: 'Hard', platform: 'LeetCode' },
    ],
  },
  {
    stepNumber: 5,
    problems: [
      { problemId: 501, name: 'Remove outermost Parenthesis', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 502, name: 'Reverse words in a given string', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 503, name: 'Largest odd number in a string', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 504, name: 'Longest Common Prefix', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 505, name: 'Isomorphic String', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 506, name: 'Check whether one string is a rotation of another', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 507, name: 'Check if two strings are anagrams of each other', difficulty: 'Easy', platform: 'LeetCode' },
      { problemId: 508, name: 'Sort Characters by frequency', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 509, name: 'Maximum Nesting Depth of Parenthesis', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 510, name: 'Roman Number to Integer', difficulty: 'Medium', platform: 'LeetCode' },
    ],
  },
  {
    stepNumber: 6,
    problems: [
      { problemId: 601, name: 'Introduction to LinkedList', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 602, name: 'Insert Node in LL', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 603, name: 'Delete Node in LL', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 604, name: 'Find length of LL', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 605, name: 'Search an element in LL', difficulty: 'Easy', platform: 'CodeStudio' },
      { problemId: 606, name: 'Reverse a LL', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 607, name: 'Middle of a LL', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 608, name: 'Detect a loop in LL', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 609, name: 'Find the starting point in LL', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 610, name: 'Length of Loop in LL', difficulty: 'Medium', platform: 'CodeStudio' },
      { problemId: 611, name: 'Check if LL is palindrome', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 612, name: 'Sort a LL', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 613, name: 'Intersection of Two LLs', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 614, name: 'Reverse LL in groups of size k', difficulty: 'Hard', platform: 'LeetCode' },
      { problemId: 615, name: 'Rotate a LL', difficulty: 'Hard', platform: 'LeetCode' },
      { problemId: 616, name: 'Flattening of LL', difficulty: 'Hard', platform: 'GeeksforGeeks' },
      { problemId: 617, name: 'Clone a LL with random and next pointer', difficulty: 'Hard', platform: 'LeetCode' },
    ],
  },
  {
    stepNumber: 7,
    problems: [
      { problemId: 701, name: 'Recursive Implementation of atoi()', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 702, name: 'Pow(x, n)', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 703, name: 'Count Good numbers', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 704, name: 'Sort a stack using recursion', difficulty: 'Medium', platform: 'CodeStudio' },
      { problemId: 705, name: 'Generate Parentheses', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 706, name: 'Print all subsequences', difficulty: 'Medium', platform: 'CodeStudio' },
      { problemId: 707, name: 'Combination Sum', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 708, name: 'Combination Sum II', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 709, name: 'Subset Sum I', difficulty: 'Medium', platform: 'CodeStudio' },
      { problemId: 710, name: 'Subset Sum II', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 711, name: 'Print all Permutations of a string/array', difficulty: 'Medium', platform: 'LeetCode' },
      { problemId: 712, name: 'N Queens', difficulty: 'Hard', platform: 'LeetCode' },
      { problemId: 713, name: 'Rat in a Maze', difficulty: 'Hard', platform: 'GeeksforGeeks' },
      { problemId: 714, name: 'Word Break', difficulty: 'Hard', platform: 'LeetCode' },
      { problemId: 715, name: 'M-Coloring Problem', difficulty: 'Hard', platform: 'GeeksforGeeks' },
      { problemId: 716, name: 'Sudoku Solver', difficulty: 'Hard', platform: 'LeetCode' },
    ],
  },
];

export async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in environment');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await DsaSheet.deleteMany({});
    await DsaStep.deleteMany({});
    await SheetProblem.deleteMany({});
    console.log('Cleared existing data');

    for (const sheetData of sheetsData) {
      const { steps, ...sheetInfo } = sheetData;
      const sheet = await DsaSheet.create(sheetInfo);
      console.log(`Created sheet: ${sheet.slug}`);

      for (const stepData of steps) {
        const step = await DsaStep.create({
          sheetId: sheet._id,
          stepNumber: stepData.stepNumber,
          title: stepData.title,
          totalProblems: stepData.totalProblems,
        });
        console.log(`  Created step: ${step.title}`);

        if (sheet.slug === 'striver-a2z') {
          const stepProblems = striverProblems.find((sp) => sp.stepNumber === stepData.stepNumber);
          if (stepProblems) {
            let order = 1;
            for (const p of stepProblems.problems) {
              const titleKey = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              let mp = await MasterProblem.findOne({ problemId: p.problemId });
              if (!mp) {
                mp = await MasterProblem.create({
                  problemId: p.problemId,
                  title: p.name,
                  titleKey,
                  difficulty: p.difficulty,
                  platform: p.platform,
                  link: '',
                  active: true
                });
              }
              await SheetProblem.create({
                sheetId: sheet._id,
                stepId: step._id,
                masterProblemId: p.problemId,
                orderInStep: order++
              });
            }
            console.log(`    Created ${stepProblems.problems.length} problems`);
          }
        }
      }
    }

    console.log('\nSeeding completed successfully!');
    // Removed process.exit(0) for safe calling
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

// Only run automatically if called directly from CLI
if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}
