import {
  SiLeetcode,
  SiGeeksforgeeks,
  SiHackerrank,
  SiCodechef,
  SiCodeforces,
} from 'react-icons/si';
import {
  ExternalLink,
  BookOpen,
  Code2,
  Network,
  FileText,
  Globe,
  Youtube,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { useState, useCallback } from 'react';

// ─── Platform definitions ──────────────────────────────────────────────

const KNOWN_PLATFORM_DOMAINS = [
  'leetcode.com',
  'geeksforgeeks.org',
  'hackerrank.com',
  'codechef.com',
  'codeforces.com',
  'atcoder.jp',
  'neetcode.io',
  'codingninjas.com',
  'interviewbit.com',
  'spoj.com',
  'cses.fi',
  'youtube.com',
  'youtu.be',
];

export interface PlatformDefinition {
  key: string;
  label: string;
  shortLabel: string;
  Icon: any;
  color: string;
  hoverBg: string;
  glowColor: string;
}

export interface PlatformLink extends PlatformDefinition {
  url: string;
}

const PLATFORM_DEFINITIONS: PlatformDefinition[] = [
  { key: 'leetcode',       label: 'LeetCode',        shortLabel: 'LC',  Icon: SiLeetcode,       color: '#FFA116', hoverBg: 'hover:bg-[#FFA116]/10 hover:border-[#FFA116]/30', glowColor: '#FFA116' },
  { key: 'geeksforgeeks', label: 'GeeksforGeeks',    shortLabel: 'GFG', Icon: SiGeeksforgeeks,  color: '#2F8D46', hoverBg: 'hover:bg-[#2F8D46]/10 hover:border-[#2F8D46]/30', glowColor: '#2F8D46' },
  { key: 'hackerrank',    label: 'HackerRank',       shortLabel: 'HR',  Icon: SiHackerrank,     color: '#00EA64', hoverBg: 'hover:bg-[#00EA64]/10 hover:border-[#00EA64]/30', glowColor: '#00EA64' },
  { key: 'codechef',      label: 'CodeChef',          shortLabel: 'CC',  Icon: SiCodechef,       color: '#5B4638', hoverBg: 'hover:bg-[#5B4638]/10 hover:border-[#5B4638]/30', glowColor: '#5B4638' },
  { key: 'codeforces',    label: 'Codeforces',        shortLabel: 'CF',  Icon: SiCodeforces,     color: '#1F8ACB', hoverBg: 'hover:bg-[#1F8ACB]/10 hover:border-[#1F8ACB]/30', glowColor: '#1F8ACB' },
  { key: 'atcoder',       label: 'AtCoder',          shortLabel: 'AC',  Icon: Terminal,         color: '#222222', hoverBg: 'hover:bg-white/10 hover:border-white/30', glowColor: '#ffffff' },
  { key: 'neetcode',      label: 'NeetCode',          shortLabel: 'NC',  Icon: Code2,            color: '#FF8A00', hoverBg: 'hover:bg-[#FF8A00]/10 hover:border-[#FF8A00]/30', glowColor: '#FF8A00' },
  { key: 'codingninjas',  label: 'Coding Ninjas',     shortLabel: 'CN',  Icon: Code2,            color: '#FF6B35', hoverBg: 'hover:bg-[#FF6B35]/10 hover:border-[#FF6B35]/30', glowColor: '#FF6B35' },
  { key: 'interviewbit',  label: 'InterviewBit',      shortLabel: 'IB',  Icon: Network,          color: '#304FFE', hoverBg: 'hover:bg-[#304FFE]/10 hover:border-[#304FFE]/30', glowColor: '#304FFE' },
  { key: 'spoj',          label: 'SPOJ',              shortLabel: 'SPOJ', Icon: Globe,            color: '#337AB7', hoverBg: 'hover:bg-[#337AB7]/10 hover:border-[#337AB7]/30', glowColor: '#337AB7' },
  { key: 'cses',          label: 'CSES',              shortLabel: 'CSES', Icon: FileText,         color: '#4A90D9', hoverBg: 'hover:bg-[#4A90D9]/10 hover:border-[#4A90D9]/30', glowColor: '#4A90D9' },
];

const VIDEO_DEFINITION: PlatformDefinition = {
  key: 'youtube',
  label: 'Watch Solution',
  shortLabel: 'YT',
  Icon: Youtube,
  color: '#FF0000',
  hoverBg: 'hover:bg-red-500/10 hover:border-red-500/30',
  glowColor: '#FF0000',
};

const EDITORIAL_DEFINITION: PlatformDefinition = {
  key: 'editorial',
  label: 'Editorial / Article',
  shortLabel: 'Ed',
  Icon: BookOpen,
  color: '#3B82F6',
  hoverBg: 'hover:bg-blue-500/10 hover:border-blue-500/30',
  glowColor: '#3B82F6',
};

const EXTERNAL_DEFINITION: PlatformDefinition = {
  key: 'open-problem',
  label: 'Open Problem',
  shortLabel: 'Open',
  Icon: ExternalLink,
  color: '#888888',
  hoverBg: 'hover:bg-white/10 hover:border-white/30',
  glowColor: '#888888',
};

// ─── Tooltip component ─────────────────────────────────────────────────

function IconTooltip({
  label,
  shortcut,
  children,
}: {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group/tooltip relative">
      {children}
      <div
        className="
          pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
          opacity-0 group-hover/tooltip:opacity-100
          translate-y-1 group-hover/tooltip:translate-y-0
          transition-all duration-200 ease-out
          whitespace-nowrap z-50
        "
      >
        <div className="flex items-center gap-1.5 bg-[#1a1a2e] border border-white/10 rounded-lg px-2.5 py-1.5 shadow-xl shadow-black/40">
          <span className="text-[11px] font-medium text-white">{label}</span>
          {shortcut && (
            <span className="text-[9px] text-gray-500 bg-white/5 px-1 rounded">{shortcut}</span>
          )}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a2e] border-r border-b border-white/10 rotate-45" />
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────

function isKnownPlatformDomain(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return KNOWN_PLATFORM_DOMAINS.some(d => host === d || host.endsWith('.' + d));
  } catch {
    return false;
  }
}

// Priority order for picking the "primary" external link
const EXTERNAL_LINK_PRIORITY = [
  'leetcode', 'geeksforgeeks', 'codeforces', 'hackerrank',
  'codechef', 'neetcode', 'interviewbit', 'atcoder',
  'codingninjas', 'spoj', 'cses',
];

function pickBestExternalLink(links: Record<string, string> | undefined): string | null {
  if (!links) return null;
  for (const key of EXTERNAL_LINK_PRIORITY) {
    if (links[key]) return links[key];
  }
  return null;
}

// ─── Props ─────────────────────────────────────────────────────────────

interface PlatformLinksProps {
  links?: Record<string, string>;
  videos?: Array<{ title?: string; platform?: string; url: string }>;
  editorials?: Array<{ platform?: string; url: string; title?: string }>;
  platform?: string;
  link?: string;
  youtubeUrl?: string;
  articleUrl?: string;
  size?: 'sm' | 'md';
  showLabels?: boolean;
  className?: string;
  problemTitle?: string;
  showCopyLink?: boolean;
  showExternalLink?: boolean;
}

// ─── Main component ────────────────────────────────────────────────────

export default function PlatformLinks({
  links,
  videos,
  editorials,
  platform,
  link,
  youtubeUrl,
  articleUrl,
  size = 'sm',
  showLabels = false,
  className = '',
  problemTitle,
  showCopyLink = false,
  showExternalLink = false,
}: PlatformLinksProps) {
  const [copied, setCopied] = useState(false);
  const collectedLinks: PlatformLink[] = [];
  const seen = new Set<string>();

  if (typeof console !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[PlatformLinks] Debug:', { problemTitle, links, videos, editorials, platform, link });
  }

  const addIfExists = (def: PlatformDefinition, url: string) => {
    if (!url) return;
    const key = def.key + ':' + url;
    if (seen.has(key)) return;
    seen.add(key);
    collectedLinks.push({ ...def, url });
  };

  // 1. Structured links → platform-specific icons (LeetCode, GFG, etc.)
  //    EACH platform gets its OWN icon and its OWN URL from `links[platformKey]`
  if (links && typeof links === 'object') {
    for (const def of PLATFORM_DEFINITIONS) {
      const val = links[def.key];
      if (val) addIfExists(def, val);
    }
  }

  // 2. Legacy flat fields (backward compat)
  if (link) {
    const platformLower = (platform || '').toLowerCase();
    const matchedDef = PLATFORM_DEFINITIONS.find(
      d => d.key === platformLower || d.label.toLowerCase() === platformLower
    );
    if (matchedDef) {
      addIfExists(matchedDef, link);
    } else {
      addIfExists(EXTERNAL_DEFINITION, link);
    }
  }

  // 3. YouTube videos — dedicated "Watch Solution" button
  let youtubeCount = 0;
  if (videos && Array.isArray(videos)) {
    for (const v of videos) {
      if (v.url) {
        addIfExists({ ...VIDEO_DEFINITION, key: `yt-${v.title || v.url}-${youtubeCount++}` }, v.url);
      }
    }
  }
  if (youtubeUrl) {
    addIfExists(VIDEO_DEFINITION, youtubeUrl);
  }

  // 4. YouTube fallback — auto-search if no direct video URL and problemTitle exists
  const hasYoutubeEntry = collectedLinks.some(pl => pl.key.startsWith('yt-') || pl.key === 'youtube');
  if (!hasYoutubeEntry && problemTitle) {
    const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(problemTitle + ' DSA Solution')}`;
    addIfExists(
      { ...VIDEO_DEFINITION, key: 'yt-fallback', shortLabel: 'Search' },
      fallbackUrl
    );
  }

  // 5. Editorials — filtered: EXCLUDE any URL that belongs to a known coding platform
  //    This prevents the "Editorial opens LeetCode" bug.
  const platformLinkUrls = new Set(Object.values(links || {}).filter(Boolean));
  if (editorials && Array.isArray(editorials)) {
    for (const e of editorials) {
      if (!e.url) continue;
      if (platformLinkUrls.has(e.url)) continue;
      if (isKnownPlatformDomain(e.url)) continue;
      addIfExists(
        { ...EDITORIAL_DEFINITION, key: `ed-${e.url}` },
        e.url
      );
    }
  }
  if (articleUrl && !isKnownPlatformDomain(articleUrl) && !platformLinkUrls.has(articleUrl)) {
    addIfExists(EDITORIAL_DEFINITION, articleUrl);
  }

  // 6. "Open Problem" external link — highest-priority available platform
  if (showExternalLink) {
    const bestUrl = pickBestExternalLink(links) || link || null;
    if (bestUrl) {
      addIfExists(EXTERNAL_DEFINITION, bestUrl);
    }
  }

  if (collectedLinks.length === 0 && !showCopyLink) return null;

  const iconSize = size === 'sm' ? 14 : 18;
  const btnClass = size === 'sm'
    ? 'w-7 h-7 rounded-md'
    : 'w-9 h-9 rounded-lg';
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5';

  const handleCopyLink = useCallback(() => {
    const firstLink = collectedLinks[0]?.url || window.location.href;
    navigator.clipboard.writeText(firstLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [collectedLinks]);

  return (
    <div className={`flex items-center ${gap} flex-wrap ${className}`}>
      {collectedLinks.map((pl, i) => (
        <IconTooltip
          key={`${pl.key}-${i}`}
          label={pl.label}
          shortcut={pl.shortLabel}
        >
          <a
            href={pl.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${pl.label}`}
            className={`
              ${btnClass}
              bg-white/5 border border-white/10
              ${pl.hoverBg}
              flex items-center justify-center
              text-gray-400 hover:text-white
              transition-all duration-200 ease-out
              hover:scale-110 active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0f0f23] focus-visible:ring-[var(--ring-color)]
              group relative
            `}
            onClick={(e) => e.stopPropagation()}
            style={{
              '--glow-color': pl.glowColor,
              '--ring-color': `${pl.color}80`,
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px -2px ${pl.glowColor}50`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <pl.Icon size={iconSize} style={{ color: pl.color }} />
            {showLabels && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {pl.label}
              </span>
            )}
          </a>
        </IconTooltip>
      ))}

      {showCopyLink && (
        <IconTooltip
          label={copied ? 'Copied!' : 'Copy Problem Link'}
          shortcut="Link"
        >
          <button
            onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
            aria-label="Copy problem link"
            className={`
              ${btnClass}
              bg-white/5 border border-white/10
              hover:bg-white/10 hover:border-white/30
              flex items-center justify-center
              text-gray-400 hover:text-white
              transition-all duration-200 ease-out
              hover:scale-110 active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0f0f23]
            `}
          >
            {copied ? <Check size={iconSize} className="text-green-400" /> : <Copy size={iconSize} />}
          </button>
        </IconTooltip>
      )}
    </div>
  );
}

export const platformBadgeColors: Record<string, string> = {
  leetcode: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  geeksforgeeks: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  hackerrank: 'text-green-400 bg-green-500/10 border-green-500/20',
  codechef: 'text-amber-600 bg-amber-600/10 border-amber-600/20',
  codeforces: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  atcoder: 'text-gray-300 bg-white/5 border-white/10',
  neetcode: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  codingninjas: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  interviewbit: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  spoj: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  cses: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
};
