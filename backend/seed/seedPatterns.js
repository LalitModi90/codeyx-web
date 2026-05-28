#!/usr/bin/env node
'use strict';

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const URI = process.env.MONGODB_URI || 'mongodb+srv://codeyxAdmin:Ruchika7878@cluster0.bubjmca.mongodb.net/codeyx';

// ============================================================
// Inline schema definitions (no TS compilation needed)
// ============================================================

const PatternCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Folder' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
PatternCategorySchema.index({ order: 1 });

const PatternSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'PatternCategory', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
PatternSchema.index({ categoryId: 1, order: 1 });

const PatternProblemSchema = new mongoose.Schema(
  {
    patternId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pattern', required: true },
    masterProblemId: { type: Number, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
PatternProblemSchema.index({ patternId: 1, masterProblemId: 1 }, { unique: true });
PatternProblemSchema.index({ masterProblemId: 1 });

const PatternCategory = mongoose.models.PatternCategory || mongoose.model('PatternCategory', PatternCategorySchema);
const Pattern = mongoose.models.Pattern || mongoose.model('Pattern', PatternSchema);
const PatternProblem = mongoose.models.PatternProblem || mongoose.model('PatternProblem', PatternProblemSchema);

// ============================================================
// Master Problem auto-create (inline)
// ============================================================
const MasterProblemSchema = new mongoose.Schema(
  {
    problemId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    titleKey: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    platform: { type: String, default: '' },
    link: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    articleUrl: { type: String, default: '' },
    tags: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const MasterProblem = mongoose.models.MasterProblem || mongoose.model('MasterProblem', MasterProblemSchema);

const difficultyMap = {
  Easy: 'Easy', Medium: 'Medium', Hard: 'Hard',
  Beginner: 'Easy', Intermediate: 'Medium', Advanced: 'Hard',
};

async function findOrCreateMasterProblem(title, difficulty) {
  const titleKey = title.toLowerCase().trim();
  let mp = await MasterProblem.findOne({ titleKey });
  if (mp) return mp;

  // Auto-create if not found
  const maxId = await MasterProblem.findOne().sort({ problemId: -1 }).select('problemId');
  const nextId = (maxId?.problemId || 0) + 1;
  const mappedDifficulty = difficultyMap[difficulty] || 'Medium';

  mp = await MasterProblem.create({
    problemId: nextId,
    title,
    titleKey,
    difficulty: mappedDifficulty,
    platform: 'LeetCode',
    link: '',
    active: true,
  });
  console.log(`     ➕ Created master problem: "${title}" (ID: ${nextId}, ${mappedDifficulty})`);
  return mp;
}

// ============================================================
// Pattern Hierarchy Definition — 15 Categories, ~60 Patterns
// ============================================================
const categories = [
  // ──────────────────────────────────────────────────────────
  // 1. ARRAYS (5 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Arrays', description: 'Fundamental array manipulation and traversal techniques.', icon: 'LayoutList', order: 1,
    patterns: [
      {
        title: 'Two Pointer', difficulty: 'Beginner', order: 1,
        description: 'Solve problems by maintaining two pointers that traverse from different directions.',
        problems: ['Two Sum', '3Sum', '3Sum Closest', 'Container With Most Water', 'Remove Duplicates from Sorted Array', 'Move Zeroes', 'Merge Sorted Array', 'Intersection of Two Arrays II', 'Sort Colors', 'Squares of a Sorted Array'],
      },
      {
        title: 'Sliding Window', difficulty: 'Intermediate', order: 2,
        description: 'Maintain a window that expands and contracts to find optimal subarrays or substrings.',
        problems: ['Longest Substring Without Repeating Characters', 'Longest Repeating Character Replacement', 'Minimum Window Substring', 'Permutation in String', 'Find All Anagrams in a String', 'Sliding Window Maximum', 'Minimum Size Subarray Sum', 'Subarray Product Less Than K', 'Fruit Into Baskets', 'Max Consecutive Ones III'],
      },
      {
        title: 'Prefix Sum', difficulty: 'Beginner', order: 3,
        description: 'Precompute prefix sums to answer range sum queries in O(1).',
        problems: ['Product of Array Except Self', 'Subarray Sum Equals K', 'Range Sum Query - Immutable', 'Find Pivot Index', 'Continuous Subarray Sum'],
      },
      {
        title: "Kadane's Algorithm", difficulty: 'Beginner', order: 4,
        description: 'Find maximum subarray sum in O(n) using dynamic programming.',
        problems: ['Maximum Subarray', 'Maximum Product Subarray', 'Maximum Sum Circular Subarray'],
      },
      {
        title: 'Sorting + Local Choice', difficulty: 'Intermediate', order: 5,
        description: 'Sort the array first, then apply greedy or two-pointer strategies for optimal solutions.',
        problems: ['Merge Intervals', 'Non-overlapping Intervals', 'Minimum Number of Arrows to Burst Balloons', 'Insert Interval', 'Meeting Rooms II', 'Meeting Rooms'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 2. STRINGS (4 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Strings', description: 'Techniques for efficient string manipulation and matching.', icon: 'Type', order: 2,
    patterns: [
      {
        title: 'Two Pointer (Palindrome)', difficulty: 'Beginner', order: 1,
        description: 'Use two pointers from ends to validate palindromes and solve string reversal problems.',
        problems: ['Valid Palindrome', 'Longest Palindromic Substring', 'Palindrome Number', 'Valid Palindrome II', 'Break a Palindrome'],
      },
      {
        title: 'Sliding Window (String)', difficulty: 'Intermediate', order: 2,
        description: 'Sliding window techniques applied to string problems like anagrams and substring search.',
        problems: ['Longest Substring Without Repeating Characters', 'Longest Repeating Character Replacement', 'Minimum Window Substring', 'Permutation in String', 'Find All Anagrams in a String', 'Longest Substring with At Most K Distinct Characters', 'Number of Substrings Containing All Three Characters'],
      },
      {
        title: 'String Hashing', difficulty: 'Intermediate', order: 3,
        description: 'Use rolling hashes (Rabin-Karp) or hash maps for efficient string comparison and pattern matching.',
        problems: ['Repeated DNA Sequences', 'Group Anagrams', 'Longest Common Prefix', 'Find the Difference', 'Ransom Note'],
      },
      {
        title: 'Pattern Matching', difficulty: 'Intermediate', order: 4,
        description: 'KMP, Z-algorithm, and regex techniques for finding patterns within strings.',
        problems: ['Implement strStr()', 'Repeated Substring Pattern', 'Shortest Palindrome', 'String Compression'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 3. BINARY SEARCH (5 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Binary Search', description: 'Efficient searching in sorted data using divide and conquer.', icon: 'Search', order: 3,
    patterns: [
      {
        title: 'Classic Binary Search', difficulty: 'Beginner', order: 1,
        description: 'Standard binary search on sorted arrays.',
        problems: ['Binary Search', 'Search Insert Position', 'First Bad Version', 'Find First and Last Position of Element in Sorted Array', 'Sqrt(x)', 'Guess Number Higher or Lower'],
      },
      {
        title: 'Lower / Upper Bound', difficulty: 'Beginner', order: 2,
        description: 'Find the first or last occurrence of an element, or the insertion position in sorted arrays.',
        problems: ['Find First and Last Position of Element in Sorted Array', 'Search Insert Position', 'Kth Missing Positive Number'],
      },
      {
        title: 'Binary Search on Answers', difficulty: 'Intermediate', order: 3,
        description: 'Apply binary search on the answer space rather than the array itself.',
        problems: ['Koko Eating Bananas', 'Capacity To Ship Packages Within D Days', 'Find Peak Element', 'Split Array Largest Sum', 'Minimum Time to Complete Trips'],
      },
      {
        title: 'Search in 2D Matrix', difficulty: 'Intermediate', order: 4,
        description: 'Binary search techniques applied to matrix data.',
        problems: ['Search a 2D Matrix', 'Search in Rotated Sorted Array', 'Find Minimum in Rotated Sorted Array', 'Search in Rotated Sorted Array II'],
      },
      {
        title: 'Time-Based Key-Value', difficulty: 'Advanced', order: 5,
        description: 'Binary search on timestamped data stores.',
        problems: ['Time Based Key-Value Store'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 4. STACK (5 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Stack', description: 'LIFO data structure for nested patterns and monotonic problems.', icon: 'Layers', order: 4,
    patterns: [
      {
        title: 'Monotonic Stack', difficulty: 'Intermediate', order: 1,
        description: 'Maintain increasing or decreasing stack order for nearest greater/smaller element problems.',
        problems: ['Daily Temperatures', 'Next Greater Element I', 'Largest Rectangle in Histogram', 'Next Greater Element II', 'Sum of Subarray Minimums'],
      },
      {
        title: 'Expression Evaluation', difficulty: 'Intermediate', order: 2,
        description: 'Use stacks to evaluate mathematical expressions.',
        problems: ['Evaluate Reverse Polish Notation', 'Basic Calculator II', 'Basic Calculator'],
      },
      {
        title: 'Stack Simulation', difficulty: 'Beginner', order: 3,
        description: 'Simulate processes and operations using a stack.',
        problems: ['Min Stack', 'Asteroid Collision', 'Decode String', 'Implement Queue using Stacks', 'Simplify Path'],
      },
      {
        title: 'Parentheses & Scoring', difficulty: 'Beginner', order: 4,
        description: 'Validate and score nested parentheses expressions.',
        problems: ['Valid Parentheses', 'Generate Parentheses', 'Longest Valid Parentheses', 'Score of Parentheses', 'Minimum Add to Make Parentheses Valid'],
      },
      {
        title: 'Stack + Greedy', difficulty: 'Advanced', order: 5,
        description: 'Combine stack with greedy choices to build lexicographically optimal results.',
        problems: ['Remove K Digits', 'Remove Duplicate Letters', 'Smallest Subsequence of Distinct Characters'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 5. QUEUE (3 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Queue', description: 'FIFO data structure for BFS and ordered processing.', icon: 'IterationCw', order: 5,
    patterns: [
      {
        title: 'BFS Queue', difficulty: 'Beginner', order: 1,
        description: 'Use queues for level-order traversal and shortest path in unweighted graphs.',
        problems: ['Binary Tree Level Order Traversal', 'Number of Islands', 'Rotting Oranges', 'Walls and Gates', '01 Matrix', 'Shortest Path in Binary Matrix', 'Average of Levels in Binary Tree'],
      },
      {
        title: 'Circular Queue', difficulty: 'Intermediate', order: 2,
        description: 'Efficient fixed-size queue implementation using circular arrays.',
        problems: ['Design Circular Queue', 'Design Circular Deque', 'Moving Average from Data Stream'],
      },
      {
        title: 'Monotonic Queue', difficulty: 'Advanced', order: 3,
        description: 'Maintain monotonic order within a queue for sliding window extremum problems.',
        problems: ['Sliding Window Maximum', 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit', 'Shortest Subarray with Sum at Least K'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 6. LINKED LIST (4 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Linked List', description: 'Sequential nodes with pointers for efficient insertions and deletions.', icon: 'Link', order: 6,
    patterns: [
      {
        title: 'Fast & Slow Pointer', difficulty: 'Beginner', order: 1,
        description: 'Two pointers moving at different speeds for cycle detection and middle element.',
        problems: ['Linked List Cycle', 'Middle of the Linked List', 'Palindrome Linked List', 'Linked List Cycle II', 'Happy Number', 'Find the Duplicate Number'],
      },
      {
        title: 'Reverse Pattern', difficulty: 'Beginner', order: 2,
        description: 'Reverse linked list segments without extra space.',
        problems: ['Reverse Linked List', 'Reverse Linked List II', 'Reverse Nodes in k-Group', 'Reorder List', 'Swapping Nodes in a Linked List'],
      },
      {
        title: 'Merge / Reorder', difficulty: 'Intermediate', order: 3,
        description: 'Merge sorted lists or reorder linked lists in-place.',
        problems: ['Merge Two Sorted Lists', 'Merge k Sorted Lists', 'Sort List', 'Remove Nth Node From End of List', 'Rotate List', 'Partition List'],
      },
      {
        title: 'Linked List + Stack', difficulty: 'Intermediate', order: 4,
        description: 'Use stack with linked list for reverse traversal or bracket matching on list values.',
        problems: ['Next Greater Node In Linked List', 'Remove Nodes From Linked List', 'Double a Number Represented as a Linked List', 'Add Two Numbers', 'Add Two Numbers II'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 7. HEAP / PRIORITY QUEUE (4 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Heap / Priority Queue', description: 'Priority queues for efficient k-th element and top-k problems.', icon: 'BarChart4', order: 7,
    patterns: [
      {
        title: 'Top K Elements', difficulty: 'Intermediate', order: 1,
        description: 'Find k largest, smallest, or most frequent elements efficiently.',
        problems: ['Kth Largest Element in an Array', 'Kth Largest Element in a Stream', 'Top K Frequent Elements', 'Top K Frequent Words', 'K Closest Points to Origin', 'Sort Characters By Frequency', 'Task Scheduler', 'Kth Smallest Element in a Sorted Matrix'],
      },
      {
        title: 'Merge K Sorted', difficulty: 'Advanced', order: 2,
        description: 'Merge k sorted sequences using a min-heap.',
        problems: ['Merge k Sorted Lists', 'Smallest Range Covering Elements from K Lists', 'Kth Smallest Element in a Sorted Matrix'],
      },
      {
        title: 'Heap with Sliding Window', difficulty: 'Advanced', order: 3,
        description: 'Use heaps to efficiently track the maximum/minimum in a sliding window.',
        problems: ['Sliding Window Median', 'Find Median from Data Stream', 'IPO'],
      },
      {
        title: 'Huffman Encoding', difficulty: 'Advanced', order: 4,
        description: 'Build optimal prefix codes using a min-heap for lossless data compression.',
        problems: ['Top K Frequent Elements', 'Minimum Cost to Connect Sticks', 'Rearrange String k Distance Apart', 'Reorganize String'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 8. TREE (4 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Tree', description: 'Hierarchical data structures for sorted and hierarchical data.', icon: 'TreeDeciduous', order: 8,
    patterns: [
      {
        title: 'DFS Traversal', difficulty: 'Beginner', order: 1,
        description: 'Traverse trees in different orders: inorder, preorder, postorder.',
        problems: ['Binary Tree Inorder Traversal', 'Maximum Depth of Binary Tree', 'Same Tree', 'Invert Binary Tree', 'Symmetric Tree', 'Diameter of Binary Tree', 'Balanced Binary Tree', 'Path Sum', 'Path Sum II', 'Sum Root to Leaf Numbers', 'Count Good Nodes in Binary Tree', 'Flatten Binary Tree to Linked List'],
      },
      {
        title: 'BFS / Level Order', difficulty: 'Beginner', order: 2,
        description: 'Level-by-level tree traversal for width-related problems.',
        problems: ['Binary Tree Level Order Traversal', 'Binary Tree Right Side View', 'Binary Tree Zigzag Level Order Traversal', 'Average of Levels in Binary Tree', 'Minimum Depth of Binary Tree', 'Binary Tree Maximum Width', 'Populating Next Right Pointers in Each Node'],
      },
      {
        title: 'Lowest Common Ancestor', difficulty: 'Intermediate', order: 3,
        description: 'Find lowest common ancestor and answer ancestor-descendant queries.',
        problems: ['Lowest Common Ancestor of a Binary Tree', 'Subtree of Another Tree', 'Maximum Difference Between Node and Ancestor'],
      },
      {
        title: 'Serialization', difficulty: 'Intermediate', order: 4,
        description: 'Convert trees to strings and back for storage and transmission.',
        problems: ['Serialize and Deserialize Binary Tree', 'Serialize and Deserialize BST', 'Construct Binary Tree from Preorder and Inorder Traversal', 'Construct Binary Tree from Inorder and Postorder Traversal'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 9. BINARY SEARCH TREE (3 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Binary Search Tree', description: 'BST-specific operations leveraging the ordered property.', icon: 'GitCommitVertical', order: 9,
    patterns: [
      {
        title: 'BST Operations', difficulty: 'Beginner', order: 1,
        description: 'Search, insert, delete, and validate binary search trees.',
        problems: ['Validate Binary Search Tree', 'Kth Smallest Element in a BST', 'Convert Sorted Array to Binary Search Tree', 'Search in a Binary Search Tree', 'Insert into a Binary Search Tree', 'Delete Node in a BST', 'Range Sum of BST'],
      },
      {
        title: 'LCA & Range Queries', difficulty: 'Intermediate', order: 2,
        description: 'Leverage BST properties for efficient queries on trees.',
        problems: ['Lowest Common Ancestor of a Binary Search Tree', 'Range Sum of BST', 'Closest Binary Search Tree Value', 'Balance a Binary Search Tree'],
      },
      {
        title: 'Iterator Pattern', difficulty: 'Intermediate', order: 3,
        description: 'Design iterators that traverse BSTs in sorted order.',
        problems: ['Binary Search Tree Iterator', 'Two Sum IV - Input is a BST', 'Recover Binary Search Tree'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 10. GRAPH (6 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Graph', description: 'Connected data structures for relationships and networks.', icon: 'GitBranch', order: 10,
    patterns: [
      {
        title: 'BFS', difficulty: 'Beginner', order: 1,
        description: 'Level-order exploration for shortest path in unweighted graphs.',
        problems: ['Number of Islands', 'Clone Graph', 'Rotting Oranges', 'Walls and Gates', '01 Matrix', 'Word Ladder', 'Shortest Path in Binary Matrix', 'Jump Game III'],
      },
      {
        title: 'DFS', difficulty: 'Beginner', order: 2,
        description: 'Depth-first exploration for connectivity and path problems.',
        problems: ['Max Area of Island', 'Pacific Atlantic Water Flow', 'Surrounded Regions', 'Number of Provinces', 'All Paths From Source to Target', 'Course Schedule', 'Clone Graph'],
      },
      {
        title: 'Topological Sort', difficulty: 'Intermediate', order: 3,
        description: 'Order nodes in a DAG respecting dependency constraints.',
        problems: ['Course Schedule', 'Course Schedule II', 'Alien Dictionary', 'Minimum Height Trees'],
      },
      {
        title: 'Union Find', difficulty: 'Intermediate', order: 4,
        description: 'Efficiently manage disjoint sets for connectivity queries.',
        problems: ['Number of Connected Components in an Undirected Graph', 'Graph Valid Tree', 'Redundant Connection', 'Redundant Connection II', 'Accounts Merge', 'Longest Consecutive Sequence'],
      },
      {
        title: "Dijkstra's Algorithm", difficulty: 'Advanced', order: 5,
        description: 'Find shortest paths from a source node to all others in weighted graphs.',
        problems: ['Network Delay Time', 'Path With Minimum Effort', 'Cheapest Flights Within K Stops', 'Swim in Rising Water'],
      },
      {
        title: 'Minimum Spanning Tree', difficulty: 'Advanced', order: 6,
        description: 'Connect all nodes with minimum total edge weight.',
        problems: ['Min Cost to Connect All Points', 'Connecting Cities With Minimum Cost', 'Optimize Water Distribution in a Village'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 11. BACKTRACKING (4 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Backtracking', description: 'Systematically search all possibilities by building candidates incrementally.', icon: 'RefreshCw', order: 11,
    patterns: [
      {
        title: 'Choice-Based Backtracking', difficulty: 'Intermediate', order: 1,
        description: 'Classic subset, permutation, and combination generation through incremental choices.',
        problems: ['Subsets', 'Permutations', 'Combinations', 'Combination Sum', 'Combination Sum II', 'Letter Combinations of a Phone Number', 'Subsets II', 'Permutations II'],
      },
      {
        title: 'Constraint-Based Backtracking', difficulty: 'Advanced', order: 2,
        description: 'Prune search space with constraint propagation for puzzles.',
        problems: ['N-Queens', 'Sudoku Solver', 'Word Search', 'Palindrome Partitioning', 'Restore IP Addresses'],
      },
      {
        title: 'Grid Backtracking', difficulty: 'Intermediate', order: 3,
        description: 'Backtracking on grids for path finding and unique configurations.',
        problems: ['Word Search', 'Unique Paths III', 'Rat in a Maze', 'The Number of Beautiful Subsets'],
      },
      {
        title: 'Sequence Generation', difficulty: 'Intermediate', order: 4,
        description: 'Generate valid sequences and strings that satisfy given constraints.',
        problems: ['Generate Parentheses', 'Letter Combinations of a Phone Number', 'Permutations', 'Gray Code'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 12. GREEDY (3 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Greedy', description: 'Make locally optimal choices that lead to globally optimal solutions.', icon: 'Zap', order: 12,
    patterns: [
      {
        title: 'Intervals & Reach', difficulty: 'Intermediate', order: 1,
        description: 'Greedy interval scheduling, merging, and reachability problems.',
        problems: ['Merge Intervals', 'Non-overlapping Intervals', 'Meeting Rooms', 'Meeting Rooms II', 'Minimum Number of Arrows to Burst Balloons', 'Insert Interval'],
      },
      {
        title: 'Sorting + Local Choice', difficulty: 'Intermediate', order: 2,
        description: 'Sort items by some criterion and make greedy local choices.',
        problems: ['Gas Station', 'Partition Labels', 'Jump Game', 'Jump Game II', 'Assign Cookies', 'Queue Reconstruction by Height', 'Hand of Straights'],
      },
      {
        title: 'Greedy + Heap', difficulty: 'Advanced', order: 3,
        description: 'Combine greedy choice strategy with heap for dynamic selections.',
        problems: ['Task Scheduler', 'IPO', 'Minimum Cost to Hire K Workers', 'Maximum Performance of a Team', 'Course Schedule III'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 13. DYNAMIC PROGRAMMING (6 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Dynamic Programming', description: 'Break problems into overlapping subproblems with optimal substructure.', icon: 'BrainCircuit', order: 13,
    patterns: [
      {
        title: '1D DP', difficulty: 'Beginner', order: 1,
        description: 'Linear DP where state depends on one or two previous states.',
        problems: ['Climbing Stairs', 'House Robber', 'House Robber II', 'Coin Change', 'Word Break', 'Longest Increasing Subsequence', 'Decode Ways', 'Jump Game', 'Jump Game II', 'Delete and Earn', 'Maximum Product Subarray'],
      },
      {
        title: 'Grid DP', difficulty: 'Beginner', order: 2,
        description: 'Navigate a grid with path counting or cost minimization.',
        problems: ['Unique Paths', 'Unique Paths II', 'Minimum Path Sum', 'Maximal Square', 'Triangle', 'Dungeon Game'],
      },
      {
        title: 'DP on Strings', difficulty: 'Intermediate', order: 3,
        description: 'String alignment, subsequence, and palindrome DP problems.',
        problems: ['Longest Common Subsequence', 'Edit Distance', 'Longest Palindromic Subsequence', 'Palindromic Substrings', 'Longest Palindromic Substring', 'Shortest Common Supersequence'],
      },
      {
        title: 'Knapsack / Subset Sum', difficulty: 'Intermediate', order: 4,
        description: 'Select items with constraints to optimize value or achieve a target sum.',
        problems: ['Partition Equal Subset Sum', 'Coin Change II', 'Target Sum', 'Ones and Zeroes', 'Combination Sum IV'],
      },
      {
        title: 'DP on Trees', difficulty: 'Advanced', order: 5,
        description: 'Tree DP where state is computed from child subtrees.',
        problems: ['Binary Tree Maximum Path Sum', 'Diameter of Binary Tree', 'House Robber III', 'Maximum Path Sum in a Binary Tree'],
      },
      {
        title: 'DP on Stocks', difficulty: 'Intermediate', order: 6,
        description: 'Unified stock trading DP framework with state machines.',
        problems: ['Best Time to Buy and Sell Stock', 'Best Time to Buy and Sell Stock II', 'Best Time to Buy and Sell Stock III', 'Best Time to Buy and Sell Stock IV', 'Best Time to Buy and Sell Stock with Cooldown', 'Best Time to Buy and Sell Stock with Transaction Fee'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 14. TRIE (3 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Trie', description: 'Prefix tree for efficient string storage and retrieval.', icon: 'GitFork', order: 14,
    patterns: [
      {
        title: 'Basic Trie', difficulty: 'Intermediate', order: 1,
        description: 'Implement insert, search, and startsWith operations on a prefix tree.',
        problems: ['Implement Trie (Prefix Tree)', 'Longest Common Prefix', 'Replace Words', 'Design Add and Search Words Data Structure'],
      },
      {
        title: 'Word Break / Search', difficulty: 'Advanced', order: 2,
        description: 'Use trie for efficient word break and multi-pattern search problems.',
        problems: ['Word Break', 'Word Search II', 'Palindrome Pairs', 'Concatenated Words'],
      },
      {
        title: 'Bitwise Trie / XOR', difficulty: 'Advanced', order: 3,
        description: 'Binary trie for maximum XOR and bitwise query problems.',
        problems: ['Maximum XOR of Two Numbers in an Array', 'Maximum XOR With an Element From Array', 'Count Pairs With XOR in a Range'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 15. BIT MANIPULATION (3 patterns)
  // ──────────────────────────────────────────────────────────
  {
    title: 'Bit Manipulation', description: 'Solve problems using bitwise operations on binary representations.', icon: 'Binary', order: 15,
    patterns: [
      {
        title: 'XOR Tricks', difficulty: 'Beginner', order: 1,
        description: 'Leverage XOR properties for single-number detection and bit toggling.',
        problems: ['Single Number', 'Single Number II', 'Single Number III', 'Missing Number'],
      },
      {
        title: 'Bitmasking', difficulty: 'Intermediate', order: 2,
        description: 'Use bitmasks to represent subsets or track state efficiently.',
        problems: ['Subsets', 'Number of 1 Bits', 'Counting Bits', 'Reverse Bits', 'Power of Two', 'Power of Four', 'Sum of Two Integers'],
      },
      {
        title: 'Advanced XOR', difficulty: 'Advanced', order: 3,
        description: 'Complex XOR-based problems involving ranges and nested expressions.',
        problems: ['XOR Queries of a Subarray', 'Decode XORed Array', 'XOR Operation in an Array', 'Maximum XOR of Two Numbers in an Array'],
      },
    ],
  },
];

async function main() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(URI);
  const db = mongoose.connection.db;
  console.log('✅ Connected\n');

  // Clean existing pattern data for re-runnability
  await db.collection('patterncategories').deleteMany({});
  await db.collection('patterns').deleteMany({});
  await db.collection('patternproblems').deleteMany({});
  console.log('🧹 Cleaned existing pattern data');

  let totalPatterns = 0;
  let totalMappings = 0;
  let matchedProbs = 0;
  let createdProbs = 0;

  for (const catDef of categories) {
    const cat = await PatternCategory.create({
      title: catDef.title,
      description: catDef.description,
      icon: catDef.icon,
      order: catDef.order,
      active: true,
    });
    console.log(`\n📁 Category (${catDef.order}/15): ${catDef.title}`);

    for (const patDef of catDef.patterns) {
      const pat = await Pattern.create({
        categoryId: cat._id,
        title: patDef.title,
        description: patDef.description,
        difficulty: patDef.difficulty,
        order: patDef.order,
        active: true,
      });
      totalPatterns++;

      const mappings = [];
      for (let i = 0; i < patDef.problems.length; i++) {
        const rawTitle = patDef.problems[i];
        const mp = await findOrCreateMasterProblem(rawTitle, patDef.difficulty);
        if (mp) {
          mappings.push({ patternId: pat._id, masterProblemId: mp.problemId, order: i + 1 });
          matchedProbs++;
        }
      }

      if (mappings.length > 0) {
        // Use ordered: false to skip duplicates on re-run
        await PatternProblem.insertMany(mappings, { ordered: false });
        totalMappings += mappings.length;
      }
      console.log(`  ├─ ${patDef.title} (${patDef.difficulty}) — ${mappings.length}/${patDef.problems.length} problems mapped`);
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`  📊 Pattern Architecture Summary`);
  console.log(`═══════════════════════════════════════`);
  console.log(`  Categories   : ${categories.length}`);
  console.log(`  Patterns     : ${totalPatterns}`);
  console.log(`  Mapped probs : ${matchedProbs}`);
  console.log(`  Mappings     : ${totalMappings}`);
  console.log(`═══════════════════════════════════════\n`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

main().catch(e => { console.error(e); process.exit(1); });
