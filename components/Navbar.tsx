import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full border-b border-blue-900/30 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-black tracking-tighter text-blue-500 hover:text-blue-400 transition">
          ATMISUKI
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-blue-100/70 hover:text-blue-400 transition">
            Gallery
          </Link>
          <Link href="/about" className="text-sm font-medium text-blue-100/70 hover:text-blue-400 transition">
            About
          </Link>
          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all">
            Admin
          </button>
        </div>
      </div>
    </nav>
  );
}