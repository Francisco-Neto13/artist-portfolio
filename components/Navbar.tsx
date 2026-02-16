import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full border-b border-blue-900/20 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <Link href="/" className="group flex items-center text-xl font-black tracking-tighter text-blue-500">
          <span>A</span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[200px] transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100">
            TMISUKI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="relative text-sm font-medium text-blue-100/70 hover:text-blue-400 transition-colors group py-1">
            Gallery
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          
          <Link href="/about" className="relative text-sm font-medium text-blue-100/70 hover:text-blue-400 transition-colors group py-1">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <button className="px-5 py-2 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer">
            Admin
          </button>
        </div>
      </div>
    </nav>
  );
}