import { useState, useEffect } from 'react';
import { Leaf, Menu, X, FlaskConical, BarChart3, Phone } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Predict', href: '#predict', icon: FlaskConical },
    { label: 'Analytics', href: '#analytics', icon: BarChart3 },
    { label: 'History', href: '#history', icon: Phone },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto section-padding flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-agri-700 rounded-xl flex items-center justify-center shadow-lg shadow-agri-700/30 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className={`font-display text-xl font-bold leading-tight transition-colors ${scrolled ? 'text-agri-900' : 'text-white'}`}>
              AgriSmart
            </span>
            <span className={`text-[10px] font-semibold tracking-[0.2em] uppercase leading-none transition-colors ${scrolled ? 'text-agri-600' : 'text-agri-200'}`}>
              AI
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                scrolled
                  ? 'text-gray-600 hover:text-agri-700 hover:bg-agri-50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <a
            href="#predict"
            className="btn-primary text-sm inline-flex items-center gap-2"
          >
            <FlaskConical className="w-4 h-4" />
            Get Recommendation
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
          }`}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-agri-50 hover:text-agri-700 transition-colors"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </a>
            ))}
            <a
              href="#predict"
              onClick={() => setMobileOpen(false)}
              className="btn-primary text-sm text-center mt-2 block"
            >
              Get Recommendation
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
