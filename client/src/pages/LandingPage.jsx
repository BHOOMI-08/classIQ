import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LandingNavbar } from '../components/LandingNavbar';
import { LandingFooter } from '../components/LandingFooter';
import {
  Sparkles,
  ArrowRight,
  QrCode,
  Shield,
  BookOpen,
  CheckCircle2,
  Users,
  GraduationCap,
  Sparkle,
  Clock,
  Lock,
  FileText,
  HelpCircle,
  TrendingUp,
  Key,
  Laptop,
  Check,
  UserCheck,
  Zap,
  Activity,
  Layers,
  Search,
  CheckCircle,
  Play,
  RotateCw,
  Send,
  Info,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [activeRoleTab, setActiveRoleTab] = useState('teacher');
  const [previewTab, setPreviewTab] = useState('qr');

  // Hero Live QR Interactive State
  const [qrCountdown, setQrCountdown] = useState(10);
  const [qrToken, setQrToken] = useState('8f9a2c4e');
  const [presentCount, setPresentCount] = useState(42);
  const [totalStudents] = useState(48);
  const [scanStatus, setScanStatus] = useState(null); // 'scanning' | 'success' | null

  // Hero Analytics Interactive State
  const [analyticsMetric, setAnalyticsMetric] = useState('overview');

  // Hero AI Assistant Interactive State
  const [aiSelectedPrompt, setAiSelectedPrompt] = useState(0);
  const [aiCustomInput, setAiCustomInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'user',
      text: 'Explain the time complexity of QuickSort in worst case.',
    },
    {
      role: 'ai',
      text: 'QuickSort is O(n²) in the worst case (when pivot is poorly chosen), but averages O(n log n) with randomized pivots!',
    },
  ]);
  const [aiIsTyping, setAiIsTyping] = useState(false);

  // Live Verification Flow Simulation State
  const [activeFlowStep, setActiveFlowStep] = useState(null);
  const [isFlowSimulating, setIsFlowSimulating] = useState(false);

  // AI Cards Filter State
  const [aiCardFilter, setAiCardFilter] = useState('all');
  const [activeAiModal, setActiveAiModal] = useState(null);

  // Platform Grid Search & Filter State
  const [platformSearchQuery, setPlatformSearchQuery] = useState('');
  const [platformCategory, setPlatformCategory] = useState('all');

  // QR Rotating Countdown Effect
  useEffect(() => {
    let timer;
    if (previewTab === 'qr') {
      timer = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            // Generate new hex token preview on rotation
            const newHex = Math.random().toString(16).substring(2, 10);
            setQrToken(newHex);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [previewTab]);

  // Handle Scan Simulation
  const handleSimulateScan = () => {
    setScanStatus('scanning');
    setTimeout(() => {
      setScanStatus('success');
      if (presentCount < totalStudents) {
        setPresentCount((prev) => prev + 1);
      }
      setTimeout(() => {
        setScanStatus(null);
      }, 3000);
    }, 1200);
  };

  // Sample Prompts for Hero AI Preview
  const samplePrompts = [
    {
      q: 'Explain QuickSort worst case',
      a: 'QuickSort is O(n²) in worst case when array is already sorted or reverse sorted with deterministic pivot selection. Random pivot reduces this risk significantly!',
    },
    {
      q: 'Difference between Stack and Queue?',
      a: 'A Stack follows LIFO (Last-In First-Out) while a Queue follows FIFO (First-In First-Out). Stack uses push/pop; Queue uses enqueue/dequeue.',
    },
    {
      q: 'What is HMAC authentication?',
      a: 'HMAC (Hash-based Message Authentication Code) verifies data integrity and authenticity using a shared cryptographic key and a secret hashing algorithm.',
    },
  ];

  const handleSelectSamplePrompt = (index) => {
    setAiSelectedPrompt(index);
    setAiIsTyping(true);
    const selected = samplePrompts[index];
    setAiMessages([
      { role: 'user', text: selected.q },
      { role: 'ai', text: selected.a },
    ]);
    setTimeout(() => {
      setAiIsTyping(false);
    }, 400);
  };

  const handleCustomAiSubmit = (e) => {
    e.preventDefault();
    if (!aiCustomInput.trim()) return;

    const userText = aiCustomInput;
    setAiCustomInput('');
    setAiMessages([
      { role: 'user', text: userText },
      { role: 'ai', text: 'Analyzing syllabus and generating structured concept explanation...' },
    ]);
    setAiIsTyping(true);

    setTimeout(() => {
      setAiMessages([
        { role: 'user', text: userText },
        {
          role: 'ai',
          text: `ClassIQ AI response for "${userText}": Key concepts analyzed with reference to CS-301 lecture materials!`,
        },
      ]);
      setAiIsTyping(false);
    }, 900);
  };

  // Trigger Flow Simulation
  const handleRunFlowSimulation = () => {
    if (isFlowSimulating) return;
    setIsFlowSimulating(true);
    setActiveFlowStep(1);

    setTimeout(() => setActiveFlowStep(2), 1200);
    setTimeout(() => setActiveFlowStep(3), 2400);
    setTimeout(() => setActiveFlowStep(4), 3600);
    setTimeout(() => {
      setIsFlowSimulating(false);
      setTimeout(() => setActiveFlowStep(null), 2500);
    }, 4800);
  };

  // AI Tools List
  const aiToolsData = [
    {
      id: 'assignment',
      title: 'AI Assignment Generator',
      desc: 'Generate structured problem sets, essays, and coding challenges tailored to your syllabus.',
      status: 'available',
      badgeText: 'Available',
      preview: {
        title: 'Sample Assignment Output',
        content: 'Q1. Implement a Binary Search Tree insertion method in C++.\nQ2. Analyze worst-case time complexity for balanced vs unbalanced tree operations.',
      },
    },
    {
      id: 'quiz',
      title: 'AI Quiz & Assessment Engine',
      desc: 'Convert lecture notes into multiple-choice and short-answer quizzes with answer keys.',
      status: 'available',
      badgeText: 'Available',
      preview: {
        title: 'Sample Quiz Output',
        content: '1. Which algorithm guarantees O(n log n) sorting?\n  a) Bubble Sort\n  b) Merge Sort (Correct)\n  c) Insertion Sort',
      },
    },
    {
      id: 'doubt',
      title: 'AI Doubt Assistant',
      desc: '24/7 instant academic assistance answering student queries based on uploaded course material.',
      status: 'available',
      badgeText: 'Available',
      preview: {
        title: 'Sample Doubt Resolution',
        content: 'Student: What is a deadlock condition?\nAI: Deadlock requires 4 conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.',
      },
    },
    {
      id: 'planner',
      title: 'AI Study Planner',
      desc: 'Personalized study schedules based on upcoming exam dates and individual performance gaps.',
      status: 'dev',
      badgeText: 'In Development',
    },
    {
      id: 'summarization',
      title: 'Smart Notes Summarization',
      desc: 'Automatic concise summary generation and key concept extraction from lecture materials.',
      status: 'dev',
      badgeText: 'In Development',
    },
    {
      id: 'predictive',
      title: 'Predictive Performance Insights',
      desc: 'Early intervention alerts identifying students requiring additional academic support.',
      status: 'soon',
      badgeText: 'Coming Soon',
    },
  ];

  const filteredAiTools = aiToolsData.filter((item) => {
    if (aiCardFilter === 'all') return true;
    return item.status === aiCardFilter;
  });

  // Platform Capabilities Data
  const platformFeatures = [
    {
      icon: Lock,
      title: 'Secure Authentication',
      desc: 'JWT access tokens, HTTP-only refresh cookies, and SHA-256 token hashing.',
      category: 'security',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      desc: 'Strict backend authorization enforcing Student, Teacher, and Admin permissions.',
      category: 'security',
    },
    {
      icon: Laptop,
      title: 'Device Session Management',
      desc: 'Track active logins, device fingerprints, and revoke sessions remotely.',
      category: 'security',
    },
    {
      icon: QrCode,
      title: 'Smart Attendance',
      desc: 'Time-sensitive rotating QR payloads preventing proxy attendance.',
      category: 'academic',
    },
    {
      icon: BookOpen,
      title: 'Classroom Management',
      desc: 'Organize courses by department, semester, section, and institution.',
      category: 'academic',
    },
    {
      icon: FileText,
      title: 'Assignments & Notes',
      desc: 'Distribute course materials, lecture notes, and track submission deadlines.',
      category: 'academic',
    },
    {
      icon: HelpCircle,
      title: 'Quiz & Assessment Engine',
      desc: 'Run online quizzes with automated scoring and instant gradebook sync.',
      category: 'academic',
    },
    {
      icon: TrendingUp,
      title: 'Student Analytics',
      desc: 'Comprehensive attendance rates, performance trends, and risk alerts.',
      category: 'analytics',
    },
    {
      icon: Sparkles,
      title: 'AI Learning Tools',
      desc: 'AI-assisted question generation, doubt resolution, and study planning.',
      category: 'ai',
    },
    {
      icon: Activity,
      title: 'Security Audit Logs',
      desc: 'Immutable audit logging tracking security events and profile updates.',
      category: 'security',
    },
  ];

  const filteredPlatformFeatures = platformFeatures.filter((item) => {
    const matchesCategory = platformCategory === 'all' || item.category === platformCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(platformSearchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(platformSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="landing-page-root">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-eyebrow-badge">
              <Sparkles size={16} className="sparkle-icon" />
              <span>AI-Powered Smart Classroom Platform</span>
            </div>

            <h1 className="hero-headline">
              Smarter Classrooms.<br />
              <span className="hero-highlight">Secure Attendance.</span><br />
              AI-Powered Learning.
            </h1>

            <p className="hero-subtext">
              ClassIQ helps teachers manage classrooms, run secure real-time attendance, create learning content, track student performance, and deliver AI-assisted academic support from one unified platform.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-hero">
                Get Started <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn btn-secondary btn-hero">
                Explore Features
              </a>
            </div>

            <p className="hero-trust-line">
              <CheckCircle2 size={16} className="inline-icon" /> Built for students, teachers, and academic institutions.
            </p>
          </div>

          {/* Hero Product UI Composition */}
          <div className="hero-preview-wrapper">
            <div className="preview-card-container">
              {/* Preview Header Bar */}
              <div className="preview-header">
                <div className="preview-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="preview-tabs" role="tablist">
                  <button
                    className={`tab-btn ${previewTab === 'qr' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('qr')}
                    role="tab"
                    aria-selected={previewTab === 'qr'}
                  >
                    <QrCode size={14} /> Live Attendance
                  </button>
                  <button
                    className={`tab-btn ${previewTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('analytics')}
                    role="tab"
                    aria-selected={previewTab === 'analytics'}
                  >
                    <TrendingUp size={14} /> Analytics
                  </button>
                  <button
                    className={`tab-btn ${previewTab === 'ai' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('ai')}
                    role="tab"
                    aria-selected={previewTab === 'ai'}
                  >
                    <Sparkles size={14} /> AI Assistant
                  </button>
                </div>
              </div>

              {/* Dynamic Preview Content */}
              <div className="preview-body" role="tabpanel">
                {previewTab === 'qr' && (
                  <div className="qr-preview-content">
                    <div className="qr-header-badge">
                      <span className="live-pulse"></span> CS-301: Advanced Data Structures
                    </div>

                    <div className="qr-display-box">
                      <div className="qr-graphic">
                        <QrCode size={110} color="#26492F" />
                        <div className="qr-scan-line"></div>
                      </div>
                      <div className="qr-meta">
                        <div className="timer-pill">
                          <Clock size={14} /> Rotates in <b>0{qrCountdown}s</b>
                        </div>
                        <span className="security-tag">
                          <Lock size={12} /> HMAC Key: {qrToken}
                        </span>
                      </div>
                    </div>

                    <div className="attendance-live-stats">
                      <div className="stat-item">
                        <span className="num">{presentCount} / {totalStudents}</span>
                        <span className="lbl">Present</span>
                      </div>
                      <div className="stat-item">
                        <span className="num">{((presentCount / totalStudents) * 100).toFixed(1)}%</span>
                        <span className="lbl">Attendance Rate</span>
                      </div>
                    </div>

                    {/* Interactive Scan Simulation Trigger */}
                    <div className="qr-interactive-bar">
                      {scanStatus === 'scanning' ? (
                        <div className="scan-status-message scanning">
                          <RotateCw size={14} className="spin-icon" /> Verifying HMAC signature...
                        </div>
                      ) : scanStatus === 'success' ? (
                        <div className="scan-status-message success">
                          <CheckCircle size={14} /> Attendance Verified for Student!
                        </div>
                      ) : (
                        <button onClick={handleSimulateScan} className="btn-sim-scan">
                          <Zap size={14} /> Test Live Student Scan
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {previewTab === 'analytics' && (
                  <div className="analytics-preview-content">
                    <div className="analytics-header">
                      <h4>Student Performance Metrics</h4>
                      <div className="analytics-subtabs">
                        <button
                          className={`subtab-btn ${analyticsMetric === 'overview' ? 'active' : ''}`}
                          onClick={() => setAnalyticsMetric('overview')}
                        >
                          Overview
                        </button>
                        <button
                          className={`subtab-btn ${analyticsMetric === 'trend' ? 'active' : ''}`}
                          onClick={() => setAnalyticsMetric('trend')}
                        >
                          Attendance
                        </button>
                        <button
                          className={`subtab-btn ${analyticsMetric === 'grades' ? 'active' : ''}`}
                          onClick={() => setAnalyticsMetric('grades')}
                        >
                          Grades
                        </button>
                      </div>
                    </div>

                    <div className="chart-bar-list">
                      {analyticsMetric === 'overview' && (
                        <>
                          <div className="bar-row">
                            <span className="bar-label">Attendance Rate</span>
                            <div className="bar-track"><div className="bar-fill green" style={{ width: '92%' }}></div></div>
                            <span className="bar-val">92%</span>
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">Quiz Submissions</span>
                            <div className="bar-track"><div className="bar-fill blue" style={{ width: '85%' }}></div></div>
                            <span className="bar-val">85%</span>
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">Assignment Score</span>
                            <div className="bar-track"><div className="bar-fill purple" style={{ width: '88%' }}></div></div>
                            <span className="bar-val">88%</span>
                          </div>
                        </>
                      )}

                      {analyticsMetric === 'trend' && (
                        <>
                          <div className="bar-row">
                            <span className="bar-label">Week 1-4 Average</span>
                            <div className="bar-track"><div className="bar-fill green" style={{ width: '96%' }}></div></div>
                            <span className="bar-val">96%</span>
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">Midterm Period</span>
                            <div className="bar-track"><div className="bar-fill green" style={{ width: '90%' }}></div></div>
                            <span className="bar-val">90%</span>
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">Current Term</span>
                            <div className="bar-track"><div className="bar-fill green" style={{ width: '94%' }}></div></div>
                            <span className="bar-val">94%</span>
                          </div>
                        </>
                      )}

                      {analyticsMetric === 'grades' && (
                        <>
                          <div className="bar-row">
                            <span className="bar-label">Data Structures Quiz</span>
                            <div className="bar-track"><div className="bar-fill purple" style={{ width: '94%' }}></div></div>
                            <span className="bar-val">94/100</span>
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">Graph Theory Test</span>
                            <div className="bar-track"><div className="bar-fill purple" style={{ width: '86%' }}></div></div>
                            <span className="bar-val">86/100</span>
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">Algorithm Analysis</span>
                            <div className="bar-track"><div className="bar-fill purple" style={{ width: '91%' }}></div></div>
                            <span className="bar-val">91/100</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {previewTab === 'ai' && (
                  <div className="ai-preview-content">
                    <div className="ai-chat-header">
                      <Sparkles size={16} className="ai-purple-icon" />
                      <span>ClassIQ AI Doubt Assistant (Interactive Demo)</span>
                    </div>

                    <div className="sample-prompt-pills">
                      {samplePrompts.map((p, idx) => (
                        <button
                          key={idx}
                          className={`prompt-pill ${aiSelectedPrompt === idx ? 'active' : ''}`}
                          onClick={() => handleSelectSamplePrompt(idx)}
                        >
                          "{p.q.substring(0, 22)}..."
                        </button>
                      ))}
                    </div>

                    <div className="chat-messages-container">
                      {aiMessages.map((msg, index) => (
                        <div key={index} className={`chat-bubble ${msg.role}`}>
                          {msg.text}
                        </div>
                      ))}
                      {aiIsTyping && (
                        <div className="chat-bubble ai typing">
                          <span className="dot-typing"></span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleCustomAiSubmit} className="ai-custom-input-bar">
                      <input
                        type="text"
                        placeholder="Type a doubt question..."
                        value={aiCustomInput}
                        onChange={(e) => setAiCustomInput(e.target.value)}
                        className="ai-input-field"
                      />
                      <button type="submit" className="ai-send-btn">
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Value Section */}
      <section className="role-section" id="for-teachers">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Dual Workspace Architecture</span>
            <h2 className="section-title">Built specifically for Teachers & Students</h2>
            <p className="section-subtitle">
              ClassIQ provides tailored features for both roles to maintain academic rigor and workflow efficiency.
            </p>
          </div>

          <div className="role-cards-grid">
            {/* Teacher Workspace Card */}
            <div className="role-card teacher-card">
              <div className="role-card-header">
                <div className="role-icon-box teacher">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <span className="role-badge teacher">Teacher Workspace</span>
                  <h3>One workspace for modern teaching</h3>
                </div>
              </div>
              <ul className="role-feature-list">
                <li><CheckCircle2 size={18} className="check-icon" /> Create and manage multi-department classrooms</li>
                <li><CheckCircle2 size={18} className="check-icon" /> Generate secure rotating attendance QR codes</li>
                <li><CheckCircle2 size={18} className="check-icon" /> View live attendance updates in real time</li>
                <li><CheckCircle2 size={18} className="check-icon" /> Publish notes, assignments, and assessments</li>
                <li><CheckCircle2 size={18} className="check-icon" /> Track student engagement and performance metrics</li>
                <li><CheckCircle2 size={18} className="check-icon" /> Use AI to generate academic quizzes and course materials</li>
              </ul>
              <div className="role-card-footer">
                <Link to="/register?role=teacher" className="btn btn-primary w-full">
                  Create Teacher Account <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Student Workspace Card */}
            <div className="role-card student-card" id="for-students">
              <div className="role-card-header">
                <div className="role-icon-box student">
                  <UserCheck size={28} />
                </div>
                <div>
                  <span className="role-badge student">Student Workspace</span>
                  <h3>Everything students need to stay on track</h3>
                </div>
              </div>
              <ul className="role-feature-list">
                <li><CheckCircle2 size={18} className="check-icon" /> Join classrooms securely with class codes</li>
                <li><CheckCircle2 size={18} className="check-icon" /> Scan time-sensitive attendance QR codes</li>
                <li><CheckCircle2 size={18} className="check-icon" /> Access complete attendance history and reports</li>
                <li><CheckCircle2 size={18} className="check-icon" /> Download lecture notes and submit assignments</li>
                <li><CheckCircle2 size={18} className="check-icon" /> Attempt quizzes and review assessment feedback</li>
                <li><CheckCircle2 size={18} className="check-icon" /> Use AI study planning and instant doubt support</li>
              </ul>
              <div className="role-card-footer">
                <Link to="/register?role=student" className="btn btn-secondary w-full">
                  Create Student Account <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secure Attendance Section */}
      <section className="attendance-section">
        <div className="section-container">
          <div className="attendance-grid">
            <div className="attendance-text">
              <div className="section-tag">Tamper-Proof Attendance</div>
              <h2 className="section-title">Attendance that is difficult to fake</h2>
              <p className="section-description">
                Eliminate proxy attendance and paper sign-in sheets. ClassIQ combines short-lived payloads with cryptographic verification to ensure physical presence.
              </p>

              <div className="attendance-features-list">
                <div className="att-feat-item">
                  <Clock size={20} className="att-icon" />
                  <div>
                    <h4>Short-Lived QR Sessions</h4>
                    <p>Payloads expire automatically after seconds to prevent screenshot sharing.</p>
                  </div>
                </div>

                <div className="att-feat-item">
                  <Lock size={20} className="att-icon" />
                  <div>
                    <h4>HMAC-Signed Tokens</h4>
                    <p>Cryptographically signed session tokens guarantee token integrity.</p>
                  </div>
                </div>

                <div className="att-feat-item">
                  <Shield size={20} className="att-icon" />
                  <div>
                    <h4>Session & Device Checks</h4>
                    <p>Duplicate attendance prevention and device session validation.</p>
                  </div>
                </div>
              </div>

              {/* Interactive Simulation Trigger */}
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  onClick={handleRunFlowSimulation}
                  className="btn btn-secondary"
                  disabled={isFlowSimulating}
                >
                  <Play size={16} /> {isFlowSimulating ? 'Simulating Verification Step by Step...' : 'Run Interactive Flow Simulation'}
                </button>
              </div>
            </div>

            {/* Visual Workflow */}
            <div className="attendance-flow-card">
              <div className="flow-card-title">Live Verification Flow</div>
              <div className="flow-steps">
                <div className={`flow-step ${activeFlowStep === 1 ? 'sim-active' : ''}`}>
                  <div className="step-num">1</div>
                  <div className="step-info">
                    <h5>Teacher starts session</h5>
                    <p>Generates active attendance window</p>
                  </div>
                </div>
                <div className="flow-arrow">↓</div>
                <div className={`flow-step ${activeFlowStep === 2 ? 'sim-active' : ''}`}>
                  <div className="step-num">2</div>
                  <div className="step-info">
                    <h5>Secure QR generated</h5>
                    <p>Payload rotates dynamically every 10 seconds</p>
                  </div>
                </div>
                <div className="flow-arrow">↓</div>
                <div className={`flow-step ${activeFlowStep === 3 ? 'sim-active' : ''}`}>
                  <div className="step-num">3</div>
                  <div className="step-info">
                    <h5>Student scans QR</h5>
                    <p>Student submits token from mobile device</p>
                  </div>
                </div>
                <div className="flow-arrow">↓</div>
                <div className={`flow-step highlight ${activeFlowStep === 4 ? 'sim-active' : ''}`}>
                  <div className="step-num">4</div>
                  <div className="step-info">
                    <h5>Backend verifies signature</h5>
                    <p>Validates timestamp, session status, & audit log</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="ai-section" id="ai-tools">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag ai">AI Classroom Assistant</span>
            <h2 className="section-title">AI that supports the classroom workflow</h2>
            <p className="section-subtitle">
              Enhance teaching productivity and student comprehension with integrated artificial intelligence tools.
            </p>

            {/* AI Category Filter Tabs */}
            <div className="ai-filter-pills">
              <button
                className={`filter-btn ${aiCardFilter === 'all' ? 'active' : ''}`}
                onClick={() => setAiCardFilter('all')}
              >
                All Capabilities
              </button>
              <button
                className={`filter-btn ${aiCardFilter === 'available' ? 'active' : ''}`}
                onClick={() => setAiCardFilter('available')}
              >
                Available Now
              </button>
              <button
                className={`filter-btn ${aiCardFilter === 'dev' ? 'active' : ''}`}
                onClick={() => setAiCardFilter('dev')}
              >
                In Development
              </button>
            </div>
          </div>

          <div className="ai-grid">
            {filteredAiTools.map((tool) => (
              <div
                key={tool.id}
                className={`ai-card ${tool.status === 'available' ? 'clickable' : ''}`}
                onClick={() => tool.preview && setActiveAiModal(tool)}
              >
                <div className="ai-card-header">
                  <Sparkles size={22} className="ai-purple-icon" />
                  <span className={`status-badge ${tool.status}`}>{tool.badgeText}</span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>

                {tool.preview && (
                  <div className="ai-card-preview-hint">
                    <Info size={13} /> Click card for sample preview
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive AI Preview Modal */}
          {activeAiModal && (
            <div className="ai-modal-overlay" onClick={() => setActiveAiModal(null)}>
              <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="ai-modal-header">
                  <div className="flex-align-gap">
                    <Sparkles size={20} className="ai-purple-icon" />
                    <h3>{activeAiModal.title}</h3>
                  </div>
                  <button className="close-btn" onClick={() => setActiveAiModal(null)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="ai-modal-body">
                  <h4>{activeAiModal.preview.title}</h4>
                  <pre className="ai-sample-code">{activeAiModal.preview.content}</pre>
                </div>
                <div className="ai-modal-footer">
                  <span className="preview-label-tag">Visual Feature Demonstration</span>
                  <button className="btn btn-primary" onClick={() => setActiveAiModal(null)}>
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="features-grid-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Complete Capabilities</span>
            <h2 className="section-title">Everything you need for smart academic management</h2>

            {/* Category Search & Filter */}
            <div className="platform-filter-bar">
              <div className="platform-search-input">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search features (e.g. JWT, QR, Analytics)..."
                  value={platformSearchQuery}
                  onChange={(e) => setPlatformSearchQuery(e.target.value)}
                />
              </div>

              <div className="platform-category-pills">
                <button
                  className={`cat-pill ${platformCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setPlatformCategory('all')}
                >
                  All
                </button>
                <button
                  className={`cat-pill ${platformCategory === 'security' ? 'active' : ''}`}
                  onClick={() => setPlatformCategory('security')}
                >
                  Security
                </button>
                <button
                  className={`cat-pill ${platformCategory === 'academic' ? 'active' : ''}`}
                  onClick={() => setPlatformCategory('academic')}
                >
                  Academic
                </button>
                <button
                  className={`cat-pill ${platformCategory === 'analytics' ? 'active' : ''}`}
                  onClick={() => setPlatformCategory('analytics')}
                >
                  Analytics
                </button>
              </div>
            </div>
          </div>

          <div className="platform-grid">
            {filteredPlatformFeatures.map((feat, index) => {
              const IconComp = feat.icon;
              return (
                <div key={index} className="grid-card">
                  <IconComp size={24} className="grid-icon" />
                  <h4>{feat.title}</h4>
                  <p>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Simple Workflow</span>
            <h2 className="section-title">How ClassIQ Works</h2>

            <div className="role-toggle-pills">
              <button
                className={`pill-btn ${activeRoleTab === 'teacher' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('teacher')}
              >
                For Teachers
              </button>
              <button
                className={`pill-btn ${activeRoleTab === 'student' ? 'active' : ''}`}
                onClick={() => setActiveRoleTab('student')}
              >
                For Students
              </button>
            </div>
          </div>

          <div className="steps-container">
            {activeRoleTab === 'teacher' ? (
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">01</div>
                  <h4>Create a Classroom</h4>
                  <p>Set up your course, department, section, and generate a unique join code.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">02</div>
                  <h4>Start Attendance Session</h4>
                  <p>Launch live rotating QR attendance in class with customizable time limits.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">03</div>
                  <h4>Share Materials & Quizzes</h4>
                  <p>Publish lecture notes, assignments, and AI-generated assessments.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">04</div>
                  <h4>Track Progress & Analytics</h4>
                  <p>Monitor student attendance percentage, submission status, and engagement.</p>
                </div>
              </div>
            ) : (
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">01</div>
                  <h4>Join Classroom</h4>
                  <p>Enter the classroom join code provided by your teacher to enroll.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">02</div>
                  <h4>Scan Attendance QR</h4>
                  <p>Scan the active rotating QR code during class for instant verification.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">03</div>
                  <h4>Access Course Content</h4>
                  <p>Download study notes, submit assignments, and take quizzes.</p>
                </div>
                <div className="step-card">
                  <div className="step-number">04</div>
                  <h4>Review Performance</h4>
                  <p>Track your attendance history and receive AI doubt support anytime.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="security-section" id="security">
        <div className="section-container">
          <div className="security-card">
            <div className="security-header">
              <Shield size={36} className="security-shield-icon" />
              <div>
                <h2>Enterprise-Grade Security Architecture</h2>
                <p>Built with multi-layered defenses protecting user identity and academic records.</p>
              </div>
            </div>

            <div className="security-badges-grid">
              <div className="sec-item"><CheckCircle size={16} /> JWT Access Tokens (Short-Lived)</div>
              <div className="sec-item"><CheckCircle size={16} /> HTTP-Only Refresh Cookies</div>
              <div className="sec-item"><CheckCircle size={16} /> Refresh Token Theft Detection</div>
              <div className="sec-item"><CheckCircle size={16} /> Device Session Isolation & Revocation</div>
              <div className="sec-item"><CheckCircle size={16} /> Brute-Force Lockout Protection</div>
              <div className="sec-item"><CheckCircle size={16} /> Backend Role Authorization (RBAC)</div>
              <div className="sec-item"><CheckCircle size={16} /> Email Verification & Secure Password Reset</div>
              <div className="sec-item"><CheckCircle size={16} /> Audit Logging & Rate Limiting</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="final-cta-section">
        <div className="section-container">
          <div className="final-cta-box">
            <h2>Build a smarter classroom with ClassIQ</h2>
            <p>Join students, teachers, and institutions already using ClassIQ for secure attendance and AI-powered learning.</p>

            <div className="cta-button-group">
              <Link to="/register?role=student" className="btn btn-secondary">
                Create Student Account
              </Link>
              <Link to="/register?role=teacher" className="btn btn-primary">
                Create Teacher Account <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
