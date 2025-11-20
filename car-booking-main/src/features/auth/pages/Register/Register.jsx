import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../../../apis/auth';
import './Register.css';

function Register() {
  const [step, setStep] = useState(1); // 1: Register form, 2: OTP verification
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.registerUser(formData);

      if (response && response.success) {
        setStep(2);
        setError(''); // Clear any previous errors
      } else {
        setError(response?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.verifyOtpAndRegisterUser({
        ...formData,
        otpCode,
      });

      if (response.success && response.data) {
        // Lưu token và user info
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userType', 'user');

        // Reload để cập nhật header
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Xác thực OTP thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    
    setError('');
    setLoading(true);
    try {
      const response = await authApi.resendOtpUser(formData.email);
      if (response && response.success) {
        setError(''); // Clear errors
        setOtpTimer(60);
        const interval = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response?.message || 'Không thể gửi lại OTP');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể gửi lại OTP';
      setError(errorMessage);
      console.error('Resend OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start timer when step changes to 2
  useEffect(() => {
    if (step === 2 && otpTimer === 0) {
      setOtpTimer(60);
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  if (step === 2) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="auth-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">✉️</span>
            </div>
            <h1 className="auth-title">Xác thực Email</h1>
            <p className="auth-subtitle">Mã OTP đã được gửi đến</p>
            <p className="auth-email">{formData.email}</p>
            {otpTimer > 0 && (
              <div className="otp-timer">
                ⏰ Mã OTP có hiệu lực trong <strong>{otpTimer}</strong> giây
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label htmlFor="otpCode" className="form-label">
                <span className="label-icon">🔐</span>
                Mã OTP (6 chữ số)
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="otpCode"
                  name="otpCode"
                  value={otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpCode(value);
                    setError('');
                  }}
                  required
                  maxLength={6}
                  placeholder="000000"
                  pattern="[0-9]{6}"
                  className="form-input otp-input"
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Xác thực và đăng ký</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading || otpTimer > 0}
              className="resend-btn"
            >
              {otpTimer > 0 ? `Gửi lại sau ${otpTimer}s` : 'Gửi lại mã OTP'}
            </button>

            <div className="auth-footer">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpCode('');
                  setOtpTimer(0);
                }}
                className="back-link"
              >
                ← Quay lại
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🚌</span>
          </div>
          <h1 className="auth-title">Tạo tài khoản mới</h1>
          <p className="auth-subtitle">Đăng ký để bắt đầu hành trình của bạn</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                <span className="label-icon">👤</span>
                Họ
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Nguyễn"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                <span className="label-icon">👤</span>
                Tên
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Văn A"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <span className="label-icon">📧</span>
              Email
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              <span className="label-icon">📱</span>
              Số điện thoại <span className="optional">(tùy chọn)</span>
            </label>
            <div className="input-wrapper">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0123456789"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="label-icon">🔒</span>
              Mật khẩu
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <small className="form-hint">Mật khẩu phải có ít nhất 6 ký tự</small>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Đang gửi OTP...</span>
              </>
            ) : (
              <>
                <span>Đăng ký</span>
                <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="footer-text">
            Đã có tài khoản?{' '}
            <Link to="/login" className="footer-link">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

