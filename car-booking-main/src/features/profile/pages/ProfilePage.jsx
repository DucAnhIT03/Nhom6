import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../apis/auth';
import ProfileForm from '../components/ProfileForm/ProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm/ChangePasswordForm';
import TopHeader from '../../../shared/components/header/TopHeader';
import NavigationBar from '../../../shared/components/header/NavigationBar';
import Footer from '../../../shared/components/footer/Footer';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.getUserProfile();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <>
        <TopHeader />
        <NavigationBar />
        <div className="profile-page">
          <div className="profile-container">
            <div className="loading">Đang tải...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <TopHeader />
        <NavigationBar />
        <div className="profile-page">
          <div className="profile-container">
            <div className="error-message">Không thể tải thông tin người dùng</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopHeader />
      <NavigationBar />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <h1>Thông tin cá nhân</h1>
            <p className="profile-subtitle">Quản lý thông tin tài khoản của bạn</p>
          </div>

          <div className="profile-content">
            <ProfileForm user={user} onUpdate={handleProfileUpdate} />
            <ChangePasswordForm />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;

