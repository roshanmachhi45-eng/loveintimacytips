import { useState } from 'react';
import { X, Menu, Heart } from 'lucide-react';

const navLinks = ['Home', 'Wellness Blog', 'About Us', 'Privacy Policy', 'Disclaimer'];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 heart-pulse fill-rose-500" />
            <span className="font-display font-700 text-lg text-rose-600 tracking-tight">
              LoveIntimacyTips
            </span>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl hover:bg-rose-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-rose-500" />
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm drawer-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="font-display font-semibold text-rose-600">Menu</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-rose-50 hover:text-rose-600 transition-all"
              onClick={() => setOpen(false)}
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-rose-100">
          <p className="text-xs text-gray-400 text-center">
            © 2026 LoveIntimacyTips. All Rights Reserved.
          </p>
        </div>
      </aside>
    </>
  );
}
