import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./NavigationBar.css";

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    loadUserData();

    // Listen for storage changes (when user updates profile)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check when window gets focus (for same-tab updates)
    const handleFocus = () => {
      loadUserData();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  const menuItems = [
    { label: "TRANG CHỦ", path: "/" },
    { label: "GIỚI THIỆU", path: "/introduce" },
    { label: "THÔNG TIN NHÀ XE", path: "/garage" },
    { label: "BẾN XE", path: "/bus-station" },
    { label: "BÀI VIẾT", path: "/post" },
    { label: "TUYẾN ĐƯỜNG", path: "/routes" },
    { label: "KIỂM TRA VÉ", path: "/check-ticket" },
    { label: "ĐẶT VÉ", path: "/book-ticket" },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && !event.target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserDropdownOpen]);

  return (
    <>
      <div className="navigation-bar">
        <div className="nav-container">

          <div className="logo-section">
            <span className="logo-icon">
              <img src="/logo.png" alt="logo" />
            </span>
          </div>

          <nav className="nav-menu">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-right-section">
            {isLoggedIn ? (
              <div className="user-dropdown-container">
                <button 
                  className="user-greeting-btn" 
                  onClick={toggleUserDropdown}
                >
                  Xin chào, {user?.firstName} {user?.lastName}
                </button>
                {isUserDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/profile');
                        setIsUserDropdownOpen(false);
                      }}
                    >
                      Chỉnh sửa thông tin cá nhân
                    </button>
                    <button 
                      className="dropdown-item logout-item"
                      onClick={() => {
                        handleLogout();
                        setIsUserDropdownOpen(false);
                      }}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <NavLink to="/login" className="auth-btn login-btn">
                  Đăng nhập
                </NavLink>
                <NavLink to="/register" className="auth-btn register-btn">
                  Đăng ký
                </NavLink>
              </div>
            )}
          </div>

          <button className="hamburger-menu" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>
      </div>

      <div className={`side-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="side-menu-header">
          <div className="logo-section">
            <span className="logo-icon">🚌</span>
            <div className="logo-text">
              <span className="logo-vivu">VIVU</span>
              <span className="logo-today">TODAY</span>
            </div>
          </div>

          <button className="close-menu" onClick={toggleMenu}>✕</button>
        </div>

        <nav className="side-menu-nav">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `side-nav-item ${isActive ? "active" : ""}`
              }
              onClick={toggleMenu}
            >
              {item.label}
            </NavLink>
          ))}
          
          {isLoggedIn ? (
            <>
              <div className="side-user-info">
                Xin chào, {user?.firstName} {user?.lastName}
              </div>
              <button 
                className="side-auth-btn profile-btn" 
                onClick={() => {
                  navigate('/profile');
                  toggleMenu();
                }}
              >
                Chỉnh sửa thông tin cá nhân
              </button>
              <button className="side-auth-btn logout-btn" onClick={() => { handleLogout(); toggleMenu(); }}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="side-auth-btn login-btn" onClick={toggleMenu}>
                Đăng nhập
              </NavLink>
              <NavLink to="/register" className="side-auth-btn register-btn" onClick={toggleMenu}>
                Đăng ký
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {isMenuOpen && (
        <div className="menu-overlay" onClick={toggleMenu}></div>
      )}
    </>
  );
};

export default NavigationBar;
