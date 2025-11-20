import { useState, useEffect } from 'react';
import { authApi } from '../../../../apis/auth';
import './ProfileForm.css';

const ProfileForm = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authApi.updateUserProfile(formData);
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Cập nhật thông tin thành công' });
        if (onUpdate) {
          onUpdate(response.data);
        }
        // Cập nhật localStorage
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-form-container">
      <h3 className="profile-form-title">Chỉnh sửa thông tin cá nhân</h3>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="firstName">Tên</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder="Nhập tên của bạn"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Họ</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            placeholder="Nhập họ của bạn"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Số điện thoại</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại (10-11 số)"
            pattern="[0-9]{10,11}"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user?.email || ''}
            disabled
            className="disabled-input"
          />
          <small className="form-hint">Email không thể thay đổi</small>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;

