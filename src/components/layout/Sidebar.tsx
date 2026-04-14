import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  ListTodo,
  FileText,
  Users,
  ScrollText,
  LogOut,
  Shield,
  X,
  BarChart3,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { profile, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'ROLE_ADMIN';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
    return `sidebar-link ${isActive ? 'active' : ''}`;
  };

  const handleProfileClick = () => {
    navigate('/profile');
    onClose();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Shield size={18} />
          </div>
          <div className="sidebar-brand">
            <h2 style={{ color: 'white' }}>Báo cáo Nghị quyết 71-NQ/TW </h2>
            <p>Hệ thống Theo dõi Báo cáo thực hiện của Sở GD&ĐT TP.HCM</p>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{ display: 'none' }}
            id="sidebar-close-desktop"
          >
            <X size={18} />
          </button>
          <button
            className="btn btn-ghost btn-icon mobile-menu-btn"
            onClick={onClose}
            style={{ marginLeft: 'auto' }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {isAdmin ? (
            <>
              <div className="sidebar-section-title">Quản lý</div>
              <NavLink to="/" className={navLinkClass('/')} onClick={onClose} end>
                <LayoutDashboard size={20} />
                Dashboard
              </NavLink>
              <NavLink to="/tasks" className={navLinkClass('/tasks')} onClick={onClose}>
                <ListTodo size={20} />
                Nhiệm vụ
              </NavLink>
              <NavLink to="/statistics" className={navLinkClass('/statistics')} onClick={onClose}>
                <BarChart3 size={20} />
                Thống kê
              </NavLink>
              <NavLink to="/users" className={navLinkClass('/users')} onClick={onClose}>
                <Users size={20} />
                Người dùng
              </NavLink>

              <div className="sidebar-section-title">Hệ thống</div>
              <NavLink to="/audit-log" className={navLinkClass('/audit-log')} onClick={onClose}>
                <ScrollText size={20} />
                Nhật ký
              </NavLink>
            </>
          ) : (
            <>
              <div className="sidebar-section-title">Báo cáo</div>
              <NavLink to="/" className={navLinkClass('/')} onClick={onClose} end>
                <ListTodo size={20} />
                Nhiệm vụ của tôi
              </NavLink>
              <NavLink to="/my-reports" className={navLinkClass('/my-reports')} onClick={onClose}>
                <FileText size={20} />
                Báo cáo đã nộp
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleProfileClick} style={{ cursor: 'pointer' }} title="Xem hồ sơ">
            <div className="sidebar-avatar">
              {profile ? getInitials(profile.full_name) : '?'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{profile?.full_name || 'User'}</div>
              <div className="sidebar-user-role">
                {isAdmin ? '👑 Quản trị viên' : `📋 ${profile?.unit_name || 'Đơn vị'}`}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-icon"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Đăng xuất"
              id="logout-btn"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
