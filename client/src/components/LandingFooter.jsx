import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart, ArrowUp, Send, CheckCircle2 } from 'lucide-react';

export const LandingFooter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="landing-footer">
      <div className="landing-footer-container">
        {/* Brand Info */}
        <div className="footer-brand-col">
          <Link to="/" className="landing-brand-logo mb-3">
            <div className="brand-icon-box">
              <GraduationCap size={22} />
            </div>
            <span className="brand-wordmark">
              Class<span className="brand-highlight">IQ</span>
            </span>
          </Link>
          <p className="footer-tagline">
            AI-powered smart classroom & LMS platform for colleges and academic institutions. Unified attendance, learning, and student analytics.
          </p>
          <div className="footer-security-badge">
            <ShieldCheck size={16} /> Enterprise Grade Security & Data Privacy
          </div>

          {/* Newsletter Subscription */}
          <div className="footer-newsletter-wrapper" style={{ marginTop: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
              Stay Updated with ClassIQ
            </span>
            {subscribed ? (
              <div className="newsletter-success-toast">
                <CheckCircle2 size={16} color="var(--status-success)" /> Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="footer-newsletter-form">
                <input
                  type="email"
                  placeholder="institution@edu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Column 1: Product */}
        <div className="footer-links-col">
          <h4>Product</h4>
          <ul>
            <li><a href="#features">Platform Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#security">Security & Compliance</a></li>
            <li><a href="#ai-tools">AI Learning Tools</a></li>
          </ul>
        </div>

        {/* Links Column 2: Workspaces */}
        <div className="footer-links-col">
          <h4>Workspaces</h4>
          <ul>
            <li><a href="#for-teachers">For Teachers</a></li>
            <li><a href="#for-students">For Students</a></li>
            <li><Link to="/register?role=teacher">Teacher Registration</Link></li>
            <li><Link to="/register?role=student">Student Registration</Link></li>
          </ul>
        </div>

        {/* Links Column 3: Account & Legal */}
        <div className="footer-links-col">
          <h4>Account & Legal</h4>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Create Account</Link></li>
            <li><span className="footer-placeholder-link">Privacy Policy</span></li>
            <li><span className="footer-placeholder-link">Terms of Service</span></li>
          </ul>
        </div>
      </div>

      <div className="landing-footer-bottom">
        <p>© {new Date().getFullYear()} ClassIQ Inc. All rights reserved.</p>
        <p className="footer-built-with">
          Designed for modern academic excellence <Heart size={14} className="heart-icon" />
        </p>
        <button
          onClick={scrollToTop}
          className="back-to-top-btn"
          aria-label="Back to top"
        >
          <ArrowUp size={16} /> Top
        </button>
      </div>
    </footer>
  );
};

export default LandingFooter;
