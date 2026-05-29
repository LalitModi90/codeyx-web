export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full blur-xl bg-[#FF8A00]/30 animate-pulse"></div>
        
        {/* Spinning border */}
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-white/10 border-t-[#FF8A00] dark:border-t-[#FF8A00] rounded-full animate-spin"></div>
        
        {/* Inner Symbol */}
        <div className="absolute inset-0 flex items-center justify-center text-[#FF8A00] font-black text-sm animate-pulse">
          &lt;/&gt;
        </div>
      </div>
      <h3 className="mt-6 text-sm font-bold text-gray-600 dark:text-gray-300 animate-pulse tracking-widest uppercase">
        Loading
      </h3>
    </div>
  );
}
