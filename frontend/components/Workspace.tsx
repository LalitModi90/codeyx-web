"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen } from 'lucide-react';

const questions = [
  { id: 1, title: "Two Sum", difficulty: "Easy", topic: "Arrays", status: "Solved" },
  { id: 2, title: "LRU Cache", difficulty: "Medium", topic: "Design", status: "Attempted" },
  { id: 3, title: "Merge K Sorted Lists", difficulty: "Hard", topic: "Linked List", status: "Unsolved" },
];

export default function Workspace() {
  return (
    <section id="question-tracker" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <BookOpen className="text-primary" size={32} />
          Question Tracker Workspace
        </h2>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Main Table Area */}
        <div className="flex-[3] p-6 border-r border-[var(--border-color)] flex flex-col">
          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18}/>
              <input type="text" placeholder="Search problems..." className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <button className="px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-[var(--border-color)] transition-colors">
              <Filter size={16}/> Filter
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 bg-[var(--background)] rounded-xl border border-[var(--border-color)] overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-[var(--text-muted)] border-b border-[var(--border-color)] bg-[var(--card-bg)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--card-bg)] transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className={`w-4 h-4 rounded-sm border ${q.status === 'Solved' ? 'bg-green-500 border-green-600' : q.status === 'Attempted' ? 'bg-yellow-500 border-yellow-600' : 'border-[var(--border-color)]'}`}></div>
                    </td>
                    <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors">{q.id}. {q.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        q.difficulty === 'Easy' ? 'text-green-500 bg-green-500/10' : 
                        q.difficulty === 'Medium' ? 'text-yellow-500 bg-yellow-500/10' : 
                        'text-red-500 bg-red-500/10'
                      }`}>{q.difficulty}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex-[1] bg-[var(--background)] p-6">
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">Problem Details</h3>
            <p className="text-sm text-[var(--text-muted)]">Select a problem to view tags, notes, and personal insights.</p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl">
              <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">My Notes</h4>
              <textarea 
                className="w-full bg-transparent text-sm resize-none focus:outline-none" 
                rows={4} 
                placeholder="Write your intuition here..."
              ></textarea>
            </div>
            <button className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
