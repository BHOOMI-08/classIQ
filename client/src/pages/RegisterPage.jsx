import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, GraduationCap, CheckCircle2, ArrowRight, ArrowLeft, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'teacher' ? 'teacher' : 'student';

  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const paramRole = searchParams.get('role');
    if (paramRole === 'teacher' || paramRole === 'student') {
      setRole(paramRole);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    rollNumber: '',
    employeeId: '',
    department: '',
    semester: 'Semester 1',
    section: 'Section A',
    designation: 'Assistant Professor',
    institution: 'ClassIQ Institute',
    subjects: 'Data Structures, Algorithms',
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, registerStudent, registerTeacher } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated user away from register page
  useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student/dashboard', { replace: true });
      else if (user.role === 'teacher') navigate('/teacher/dashboard', { replace: true });
      else if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePasswordPolicy = (password) => {
    if (password.length < 10) return 'Password must be at least 10 characters long.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.';
    return null;
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required account details.');
        return;
      }
      const passError = validatePasswordPolicy(formData.password);
      if (passError) {
        setError(passError);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'student') {
        await registerStudent({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          studentId: formData.studentId,
          rollNumber: formData.rollNumber,
          department: formData.department,
          semester: formData.semester,
          section: formData.section,
          institution: formData.institution,
        });
      } else {
        await registerTeacher({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          employeeId: formData.employeeId,
          department: formData.department,
          designation: formData.designation,
          institution: formData.institution,
          subjects: formData.subjects ? formData.subjects.split(',').map((s) => s.trim()) : [],
        });
      }

      setStep(3);
      setSuccessMsg('Registration successful! Check your email to verify your account.');
    } catch (err) {
      const msg = err.data?.errors && Array.isArray(err.data.errors) && err.data.errors.length > 0
        ? err.data.errors.map(e => (typeof e === 'object' ? e.message : e)).join('. ')
        : (err.message || err.data?.message || 'Registration failed. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Top Header Bar */}
      <div className="auth-header-bar">
        <Link to="/" className="landing-brand-logo">
          <div className="brand-icon-box">
            <GraduationCap size={22} />
          </div>
          <span className="brand-wordmark">
            Class<span className="brand-highlight">IQ</span>
          </span>
        </Link>
        <Link to="/" className="btn btn-secondary btn-sm flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="auth-card-wrapper">
        <div className="card auth-card wide">
          <div className="auth-card-header">
            <h2>Create ClassIQ Account</h2>
            <p>Join your institution's smart classroom network</p>
          </div>

          {/* Role Toggle Tabs */}
          {step !== 3 && (
            <div className="role-toggle-bar">
              <button
                type="button"
                className={`role-tab-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => { setRole('student'); setStep(1); }}
              >
                <GraduationCap size={18} /> Student Account
              </button>
              <button
                type="button"
                className={`role-tab-btn ${role === 'teacher' ? 'active' : ''}`}
                onClick={() => { setRole('teacher'); setStep(1); }}
              >
                <BookOpen size={18} /> Teacher Account
              </button>
            </div>
          )}

          {/* Progress Step Indicator */}
          {step !== 3 && (
            <div className="progress-steps-bar">
              <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
                <span className="step-num-badge">1</span>
                <span>Account Credentials</span>
              </div>
              <div className="step-connector"></div>
              <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
                <span className="step-num-badge">2</span>
                <span>{role === 'student' ? 'Academic Details' : 'Professional Details'}</span>
              </div>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 && (
            <form onSubmit={handleNext}>
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-icon-wrapper">
                  <User size={18} className="input-field-icon" />
                  <input
                    type="text"
                    name="name"
                    className="input-control with-icon"
                    placeholder="e.g. Bhoomi Arora"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Institutional Email</label>
                <div className="input-icon-wrapper">
                  <Mail size={18} className="input-field-icon" />
                  <input
                    type="email"
                    name="email"
                    className="input-control with-icon"
                    placeholder="email@institution.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-control with-icon pr-10"
                    name="password"
                    placeholder="At least 10 chars (A-Z, a-z, 0-9, special)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-field-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input-control with-icon pr-10"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                Continue to {role === 'student' ? 'Academic Details' : 'Professional Details'} <ArrowRight size={18} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Institution Name</label>
                <input
                  type="text"
                  name="institution"
                  className="input-control"
                  value={formData.institution}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  className="input-control"
                  placeholder="Computer Science & Engineering"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>

              {role === 'student' ? (
                <>
                  <div className="grid-2-col">
                    <div className="input-group">
                      <label>Student ID</label>
                      <input
                        type="text"
                        name="studentId"
                        className="input-control"
                        placeholder="STU-2026-001"
                        value={formData.studentId}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Roll Number</label>
                      <input
                        type="text"
                        name="rollNumber"
                        className="input-control"
                        placeholder="CS-401"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid-2-col">
                    <div className="input-group">
                      <label>Semester</label>
                      <input
                        type="text"
                        name="semester"
                        className="input-control"
                        placeholder="Semester 6"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Section</label>
                      <input
                        type="text"
                        name="section"
                        className="input-control"
                        placeholder="Section A"
                        value={formData.section}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid-2-col">
                    <div className="input-group">
                      <label>Employee ID</label>
                      <input
                        type="text"
                        name="employeeId"
                        className="input-control"
                        placeholder="EMP-1092"
                        value={formData.employeeId}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Designation</label>
                      <input
                        type="text"
                        name="designation"
                        className="input-control"
                        placeholder="Associate Professor"
                        value={formData.designation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Subjects Taught</label>
                    <input
                      type="text"
                      name="subjects"
                      className="input-control"
                      placeholder="DBMS, Algorithm Design"
                      value={formData.subjects}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div className="btn-group-row mt-4">
                <button
                  type="button"
                  className="btn btn-secondary flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-2"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <CheckCircle2 size={54} color="#3F8F63" className="mx-auto mb-3" />
              <h3>Verify Your Email</h3>
              <p className="text-muted mb-4">{successMsg}</p>
              <Link to="/login" className="btn btn-primary">
                Proceed to Sign In
              </Link>
            </div>
          )}

          <div className="auth-footer-link">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
