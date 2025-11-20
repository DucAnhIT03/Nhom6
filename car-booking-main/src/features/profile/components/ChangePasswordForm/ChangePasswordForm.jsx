import { useState } from 'react';
import { authApi } from '../../../../apis/auth';
import './ChangePasswordForm.css';

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage({ type: '', text: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return false;
    }

    if (formData.oldPassword === formData.newPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải khác mật khẩu cũ' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Đổi mật khẩu thành công' });
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <h3 className="change-password-title">Đổi mật khẩu</h3>
      <form onSubmit={handleSubmit} className="change-password-form">
        <div className="form-group">
          <label htmlFor="oldPassword">Mật khẩu cũ</label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.oldPassword ? 'text' : 'password'}
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu cũ"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('oldPassword')}
            >
              {showPasswords.oldPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Mật khẩu mới</label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.newPassword ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('newPassword')}
            >
              {showPasswords.newPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
          <div className="password-input-wrapper">
            <input
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('confirmPassword')}
            >
              {showPasswords.confirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;

