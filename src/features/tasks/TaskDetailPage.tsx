import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { UNIT_GROUP_LABELS } from '../../types';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react';

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, reports, profiles } = useAppStore();

  const task = useMemo(() => tasks.find((t) => t.id === taskId), [tasks, taskId]);

  const reportData = useMemo(() => {
    if (!task) return [];

    const targetReporters = profiles.filter(
      (p) => p.role === 'ROLE_REPORTER' && p.unit_group_id && task.target_groups.includes(p.unit_group_id)
    );

    return targetReporters.map((reporter) => {
      const report = reports.find(
        (r) => r.task_id === task.id && r.reporter_id === reporter.id
      );
      const isOverdue = !report?.submitted_at && new Date(task.deadline) < new Date();
      return { reporter, report, isOverdue };
    });
  }, [task, reports, profiles]);

  const stats = useMemo(() => {
    const submitted = reportData.filter((d) => d.report?.status === 'submitted').length;
    const overdue = reportData.filter((d) => d.isOverdue).length;
    const pending = reportData.length - submitted;
    return { total: reportData.length, submitted, pending, overdue };
  }, [reportData]);

  if (!task) {
    return (
      <div className="empty-state">
        <h3>Không tìm thấy nhiệm vụ</h3>
        <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const isTaskOverdue = new Date(task.deadline) < new Date();
  const progressPercent = stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')} style={{ marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div className="page-header-info">
            <h1>{task.title}</h1>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
              {isTaskOverdue ? (
                <span className="badge badge-danger">⚠ Quá hạn</span>
              ) : (
                <span className="badge badge-success">✓ Còn hạn</span>
              )}
              {task.target_groups.map((g) => (
                <span key={g} className="badge badge-neutral">{UNIT_GROUP_LABELS[g]}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Info Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 'var(--space-6)' }}>
        <div className="stat-card stat-total" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Calendar size={18} style={{ color: 'var(--color-accent-info)' }} />
            <div>
              <div className="text-xs text-secondary">Hạn chót</div>
              <div className="font-semibold text-sm">{formatDate(task.deadline)}</div>
            </div>
          </div>
        </div>
        <div className="stat-card stat-completed" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--color-accent-success)' }} />
            <div>
              <div className="text-xs text-secondary">Đã nộp</div>
              <div className="font-semibold text-sm">{stats.submitted}/{stats.total}</div>
            </div>
          </div>
        </div>
        <div className="stat-card stat-pending" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Clock size={18} style={{ color: 'var(--color-accent-warning)' }} />
            <div>
              <div className="text-xs text-secondary">Chờ nộp</div>
              <div className="font-semibold text-sm">{stats.pending}</div>
            </div>
          </div>
        </div>
        <div className="stat-card stat-overdue" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <AlertTriangle size={18} style={{ color: 'var(--color-accent-danger)' }} />
            <div>
              <div className="text-xs text-secondary">Quá hạn</div>
              <div className="font-semibold text-sm">{stats.overdue}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <span className="font-medium">Tiến độ tổng</span>
          <span className="font-semibold" style={{ color: 'var(--color-accent-primary)' }}>{progressPercent}%</span>
        </div>
        <div className="progress-bar" style={{ height: 12 }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Task Description */}
      {task.description_html && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <h3 className="card-title">📄 Nội dung nhiệm vụ</h3>
          </div>
          <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: task.description_html }} />
        </div>
      )}

      {/* Status Board */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Trạng thái báo cáo của đơn vị</h3>
        </div>
        <div className="status-board">
          {reportData.map(({ reporter, report, isOverdue }) => (
            <div key={reporter.id} className={`status-row ${report?.status === 'submitted' && report?.submitted_at && (Date.now() - new Date(report.submitted_at).getTime() < 60000) ? 'just-submitted' : ''}`}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="status-unit-name">{reporter.unit_name || reporter.full_name}</div>
                <div className="status-unit-group">
                  {reporter.unit_group_id ? UNIT_GROUP_LABELS[reporter.unit_group_id] : ''}
                </div>
              </div>
              <div className="status-indicator">
                {report?.status === 'submitted' ? (
                  <>
                    <div className="status-dot submitted" />
                    <span style={{ color: 'var(--color-accent-success)' }}>
                      Đã nộp • {report.submitted_at ? formatDate(report.submitted_at) : ''}
                    </span>
                  </>
                ) : report?.status === 'draft' ? (
                  <>
                    <div className="status-dot pending" />
                    <span style={{ color: 'var(--color-accent-warning)' }}>Bản nháp</span>
                  </>
                ) : isOverdue ? (
                  <>
                    <div className="status-dot overdue" />
                    <span style={{ color: 'var(--color-accent-danger)' }}>Quá hạn</span>
                  </>
                ) : (
                  <>
                    <div className="status-dot pending" />
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Chưa nộp</span>
                  </>
                )}
              </div>
              {report?.status === 'submitted' && report.content_html && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    const win = window.open('', '_blank', 'width=600,height=400');
                    if (win) {
                      win.document.write(`
                        <html><head><title>Báo cáo - ${reporter.full_name}</title>
                        <style>body{font-family:Inter,sans-serif;padding:24px;background:#1a1a2e;color:#e8e8f0;line-height:1.7;}
                        h2{margin-bottom:16px;color:#2563eb;}a{color:#0ea5e9;}
                        </style></head><body>
                        <h2>📄 ${reporter.full_name}</h2>
                        ${report.content_html}
                        </body></html>
                      `);
                    }
                  }}
                >
                  <FileText size={14} /> Xem
                </button>
              )}
            </div>
          ))}

          {reportData.length === 0 && (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <h3>Không có đơn vị nào</h3>
              <p>Chưa có đơn vị nào thuộc nhóm đối tượng đã chọn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
