import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LogIn, Shield } from 'lucide-react';
import { IS_DEMO_MODE } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const loginDemo = useAuthStore((s) => s.loginDemo);
  const loginSupabase = useAuthStore((s) => s.loginSupabase);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let targetEmail = email;
    
    // Yêu cầu đặc biệt: check "admin" + "Sgd@2026#2027!"
    if (email.trim() === 'admin') {
      if (password === 'Sgd@2026#2027!') {
        targetEmail = 'trantan598497@gmail.com';
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
        setIsLoading(false);
        return;
      }
    }

    let success = false;
    if (IS_DEMO_MODE) {
      success = loginDemo(targetEmail, password || 'demo');
    } else {
      success = await loginSupabase(targetEmail);
    }

    if (success) {
      navigate('/');
    } else {
      setError('Tài khoản không tồn tại trong hệ thống. Vui lòng kiểm tra lại.');
    }
    setIsLoading(false);
  };

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword('demo');
    const success = loginDemo(email, 'demo');
    if (success) navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Shield size={28} />
          </div>
          <h1>NQ71 Tracker</h1>
          <p>Hệ thống Theo dõi Báo cáo Nghị quyết 71</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email đăng nhập</label>
            <input
              id="login-email"
              type="text"
              className="form-input"
              placeholder="Nhập tên đăng nhập hoặc email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner" style={{ width: 20, height: 20 }} />
            ) : (
              <>
                <LogIn size={18} />
                Đăng nhập
              </>
            )}
          </button>
          
          {!IS_DEMO_MODE && (
            <>
              <div style={{ margin: 'var(--space-4) 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
                hoặc
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-lg w-full"
                onClick={() => loginWithGoogle()}
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Tiếp tục với Google
              </button>
            </>
          )}
        </form>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
          <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-3)' }}>
            Dành cho công chúng hoặc cán bộ giám sát:
          </p>
          <button 
            type="button" 
            className="btn btn-secondary w-full" 
            onClick={() => navigate('/public/statistics')}
          >
            📊 Xem Tiến độ Thống kê (Không cần đăng nhập)
          </button>
        </div>

        {IS_DEMO_MODE && (
          <div className="login-demo-info" style={{ marginTop: 'var(--space-6)' }}>
            <strong>🔑 Tài khoản Demo</strong>
            <div style={{ marginBottom: 8 }}>
              <div style={{ cursor: 'pointer', marginBottom: 4 }} onClick={() => quickLogin('trantan598497@gmail.com')}>
                👑 Admin: <code>trantan598497@gmail.com</code>
              </div>
              <div style={{ cursor: 'pointer', marginBottom: 4 }} onClick={() => quickLogin('phongkhtc@sgddt.edu.vn')}>
                📋 Phòng Sở: <code>phongkhtc@sgddt.edu.vn</code>
              </div>
              <div style={{ cursor: 'pointer', marginBottom: 4 }} onClick={() => quickLogin('gddt.quan1@hcm.edu.vn')}>
                🏛️ Phòng VH-XH: <code>gddt.quan1@hcm.edu.vn</code>
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => quickLogin('thpt.lequydon@sgddt.edu.vn')}>
                🏫 Trường THPT: <code>thpt.lequydon@sgddt.edu.vn</code>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              Click vào tài khoản để đăng nhập nhanh. Mật khẩu tuỳ ý.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
