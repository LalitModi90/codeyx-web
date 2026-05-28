import React from 'react';
import { 
  SiLeetcode, 
  SiCodeforces, 
  SiCodechef, 
  SiHackerrank, 
  SiGeeksforgeeks, 
  SiYoutube, 
  SiGithub 
} from 'react-icons/si';
import { Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
  showTooltip?: boolean;
}

const platformMap: Record<string, { icon: React.ElementType, name: string, color: string }> = {
  leetcode: { icon: SiLeetcode, name: 'LeetCode', color: '#FFA116' },
  codeforces: { icon: SiCodeforces, name: 'Codeforces', color: '#1F8ACB' },
  codechef: { icon: SiCodechef, name: 'CodeChef', color: '#5B4638' },
  hackerrank: { icon: SiHackerrank, name: 'HackerRank', color: '#2EC866' },
  geeksforgeeks: { icon: SiGeeksforgeeks, name: 'GeeksForGeeks', color: '#2F8D46' },
  youtube: { icon: SiYoutube, name: 'YouTube', color: '#FF0000' },
  github: { icon: SiGithub, name: 'GitHub', color: '#ffffff' },
  codeyx: { icon: Code2, name: 'Codeyx', color: '#FF8A00' },
};

export default function PlatformIcon({ platform, size = 20, className = '', showTooltip = true }: PlatformIconProps) {
  const normalizedPlatform = platform.toLowerCase().trim();
  const data = platformMap[normalizedPlatform] || { icon: Code2, name: platform, color: '#A1A1AA' };
  
  const IconComponent = data.icon;

  return (
    <div className="relative group/platform flex items-center justify-center">
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`flex items-center justify-center ${className}`}
        style={{ color: data.color }}
      >
        <IconComponent size={size} />
      </motion.div>
      
      {showTooltip && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 invisible group-hover/platform:opacity-100 group-hover/platform:visible transition-all duration-200 z-[99] pointer-events-none">
          <div className="bg-[#1A1A1F] text-xs font-bold text-white px-2.5 py-1 rounded-md border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] whitespace-nowrap">
            {data.name}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1A1F] border-b border-r border-white/10 rotate-45"></div>
        </div>
      )}
    </div>
  );
}
