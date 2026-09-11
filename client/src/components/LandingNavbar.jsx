import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Handle scroll elevation & backdrop effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ScrollSpy section detector using IntersectionObserver
  useEffect(() => {
    const sectionIds = ['features', 'how-it-works', 'for-teachers', 'for-students', 'security'];
    const observers = [];

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observers.push(observer);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'teacher') return '/teacher/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  const navItems = [
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'for-teachers', label: 'For Teachers' },
    { id: 'for-students', label: 'For Students' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <header className={`landing-navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="landing-navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="landing-brand-logo" aria-label="ClassIQ Home">
          <div className="brand-icon-box">
            <GraduationCap size={22} />
          </div>
          <span className="brand-wordmark">
            Class<span className="brand-highlight">IQ</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="landing-nav-links" aria-label="Main Navigation">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? 'active' : ''}
              onClick={(e) => scrollToSection(e, item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="landing-nav-actions">
          {user ? (
            <button
              onClick={() => navigate(getDashboardPath())}
              className="btn btn-primary"
            >
              <UserCheck size={18} /> Go to Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary nav-btn-login">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary nav-btn-cta">
                Get Started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="landing-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="landing-mobile-drawer" id="mobile-navigation-drawer" role="navigation">
          <nav className="mobile-nav-links">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? 'active' : ''}
                onClick={(e) => scrollToSection(e, item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mobile-nav-actions">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(getDashboardPath());
                }}
                className="btn btn-primary w-full"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-secondary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
