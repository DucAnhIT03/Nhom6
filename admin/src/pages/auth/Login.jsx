import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FormInput from '../../components/FormInput';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login form error:', error);
      setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">🚌</span>
          </div>
          <h2 className="login-welcome">Chào mừng bạn đã đến với hệ thống đặt vé xe</h2>
          <h1 className="login-title">Đăng nhập Admin</h1>
          <p className="login-subtitle">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <FormInput label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Nhập email của bạn"
              required
              disabled={loading}
            />
          </FormInput>

          <FormInput label="Mật khẩu">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Nhập mật khẩu"
              required
              disabled={loading}
            />
          </FormInput>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

