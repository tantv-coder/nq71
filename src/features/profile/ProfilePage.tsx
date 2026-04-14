import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { IS_DEMO_MODE } from '../../lib/supabase';
import { updateUserPassword } from '../../lib/supabaseService';
import { UNIT_GROUP_LABELS } from '../../types';
import toast from 'react-hot-toast';
import { User, Shield, KeyRound, Save } from 'lucide-react';

export default function ProfilePage() {
  const { profile, setProfile } = useAuthStore();
  const { updateProfile } = useAppStore();

  const [formName, setFormName] = useState('');
  const [formUnitName, setFormUnitName] = useState('');
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormName(profile.full_name || '');
      setFormUnitName(profile.unit_name || '');
    }
  }, [profile]);

  if (!profile) return null;

  const isAdmin = profile.role === 'ROLE_ADMIN';

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Họ tên không được để trống');
      return;
    }
    
    setIsSavingInfo(true);
    try {
      await updateProfile(profile.id, {
        full_name: formName.trim(),
        unit_name: formUnitName.trim()
      });
      // Update local auth store profile as well
      setProfile({ ...profile, full_name: formName.trim(), unit_name: formUnitName.trim() });
      toast.success('Đã cập nhật thông tin thành công');
    } catch (error) {
      toast.error('Cập nhật thông tin thất bại');
      console.error(error);
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }

    setIsSavingPassword(true);
    try {
      if (IS_DEMO_MODE) {
        // Mock
        await new Promise(r => setTimeout(r, 500));
        toast.success('[DEMO] Đã đổi mật khẩu thành công');
      } else {
        await updateUserPassword(newPassword);
        toast.success('Đã đổi mật khẩu thành công');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại quá trình đăng nhập.');
      console.error(error);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>👤 Hồ sơ Cá nhân</h1>
          <p>Cập nhật thông tin tài khoản và bảo mật</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-6)', alignItems: 'start' }} className="profile-grid">
        {/* Personal Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <User size={18} /> Thông tin chung
            </h3>
          </div>
          <form onSubmit={handleUpdateInfo} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Email đăng nhập (Không thể thay đổi)</label>
              <input type="text" className="form-input" value={profile.email} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Vai trò hệ thống</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) 0' }}>
                {isAdmin ? (
                  <span className="badge badge-primary"><Shield size={14} style={{ marginRight: 4 }} /> Quản trị viên</span>
                ) : (
                  <span className="badge badge-info"><User size={14} style={{ marginRight: 4 }} /> Người báo cáo</span>
                )}
              </div>
            </div>

            {!isAdmin && profile.unit_group_id && (
              <div className="form-group">
                <label className="form-label">Nhóm đơn vị</label>
                <div style={{ padding: 'var(--space-2) 0' }}>
                  <span className="badge badge-neutral">{UNIT_GROUP_LABELS[profile.unit_group_id]}</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Họ tên / Tên viết tắt <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Phòng KH-TC"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tên đơn vị đầy đủ</label>
              <input
                type="text"
                className="form-input"
                value={formUnitName}
                onChange={(e) => setFormUnitName(e.target.value)}
                placeholder="Ví dụ: Phòng Kế hoạch - Tài chính"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }} disabled={isSavingInfo}>
              <Save size={16} /> {isSavingInfo ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <KeyRound size={18} /> Đổi mật khẩu
            </h3>
          </div>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {!IS_DEMO_MODE && (
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Mật khẩu mới <span className="required">*</span></label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới <span className="required">*</span></label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }} disabled={isSavingPassword || !newPassword || !confirmPassword}>
              {isSavingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </button>
            <div className="text-secondary text-xs mt-2" style={{ marginTop: 'var(--space-2)' }}>
              Lưu ý: Bạn sẽ cần sử dụng mật khẩu mới trong lần đăng nhập tiếp theo.
            </div>
          </form>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
