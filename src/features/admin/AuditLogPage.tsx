import { useMemo, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  ScrollText,
  Plus,
  Pencil,
  Trash2,
  Send,
  Search,
} from 'lucide-react';

const ACTION_LABELS: Record<string, { label: string; icon: string; type: string }> = {
  CREATE_TASK: { label: 'Tạo nhiệm vụ', icon: '➕', type: 'create' },
  UPDATE_TASK: { label: 'Sửa nhiệm vụ', icon: '✏️', type: 'update' },
  DELETE_TASK: { label: 'Xóa nhiệm vụ', icon: '🗑️', type: 'delete' },
  SUBMIT_REPORT: { label: 'Nộp báo cáo', icon: '📤', type: 'submit' },
  UPDATE_REPORT: { label: 'Cập nhật báo cáo', icon: '📝', type: 'update' },
  CREATE_USER: { label: 'Thêm người dùng', icon: '👤', type: 'create' },
  UPDATE_USER: { label: 'Sửa người dùng', icon: '✏️', type: 'update' },
  DELETE_USER: { label: 'Xóa người dùng', icon: '🗑️', type: 'delete' },
};

const ACTION_ICON_MAP: Record<string, React.ReactNode> = {
  create: <Plus size={16} />,
  update: <Pencil size={16} />,
  delete: <Trash2 size={16} />,
  submit: <Send size={16} />,
};

export default function AuditLogPage() {
  const { auditLogs, profiles } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs
      .filter((log) => filterAction === 'all' || log.action === filterAction)
      .filter((log) => {
        if (!search) return true;
        const user = profiles.find((p) => p.id === log.user_id);
        const userName = user?.full_name || '';
        const details = JSON.stringify(log.details || {}).toLowerCase();
        return userName.toLowerCase().includes(search.toLowerCase()) || details.includes(search.toLowerCase());
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [auditLogs, search, filterAction, profiles]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>📜 Nhật ký Hệ thống</h1>
          <p>Lịch sử thao tác trên hệ thống (Audit Log)</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} />
          <input className="search-input" placeholder="Tìm theo người dùng..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="form-input form-select"
          style={{ maxWidth: 220 }}
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="all">Tất cả thao tác</option>
          {Object.entries(ACTION_LABELS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Log List */}
      <div className="card">
        {filteredLogs.map((log, idx) => {
          const user = profiles.find((p) => p.id === log.user_id);
          const action = ACTION_LABELS[log.action] || { label: log.action, icon: '📌', type: 'update' };
          const details = log.details as Record<string, string> | null;

          return (
            <div key={log.id} className="audit-item animate-fade-in-up" style={{ animationDelay: `${idx * 40}ms` }}>
              <div className={`audit-icon-wrapper ${action.type}`}>
                {ACTION_ICON_MAP[action.type] || <ScrollText size={16} />}
              </div>
              <div className="audit-content">
                <div className="audit-action">
                  {action.icon} {user?.full_name || 'Người dùng'} — {action.label}
                </div>
                <div className="audit-details">
                  {details?.title && <span>"{details.title}"</span>}
                  {details?.task_title && <span>Nhiệm vụ: "{details.task_title}"</span>}
                  {details?.unit_name && <span> • Đơn vị: {details.unit_name}</span>}
                </div>
              </div>
              <div className="audit-time">{formatDate(log.created_at)}</div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div className="empty-state-icon"><ScrollText size={28} /></div>
            <h3>Chưa có nhật ký nào</h3>
            <p>Các thao tác trên hệ thống sẽ được ghi lại tại đây.</p>
          </div>
        )}
      </div>
    </div>
  );
}
