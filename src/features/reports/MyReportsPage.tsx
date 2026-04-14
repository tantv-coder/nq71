import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { Calendar, CheckCircle2, FileText } from 'lucide-react';

export default function MyReportsPage() {
  const { reports, tasks } = useAppStore();
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const mySubmittedReports = useMemo(() => {
    if (!profile) return [];
    return reports
      .filter((r) => r.reporter_id === profile.id && r.status === 'submitted')
      .sort((a, b) => new Date(b.submitted_at || b.updated_at).getTime() - new Date(a.submitted_at || a.updated_at).getTime());
  }, [reports, profile]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>📄 Báo cáo đã nộp</h1>
          <p>Danh sách các báo cáo đã gửi cho cấp trên</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {mySubmittedReports.map((report, idx) => {
          const task = tasks.find((t) => t.id === report.task_id);
          if (!task) return null;

          return (
            <div
              key={report.id}
              className="task-item animate-fade-in-up"
              style={{ animationDelay: `${idx * 60}ms`, cursor: 'pointer' }}
              onClick={() => navigate(`/report/${task.id}`)}
            >
              <div className="task-item-header">
                <div className="task-item-title">{task.title}</div>
                <span className="badge badge-success">
                  <CheckCircle2 size={12} /> Đã nộp
                </span>
              </div>
              <div className="task-item-meta">
                <span className="task-meta-item">
                  <Calendar size={14} />
                  Nộp lúc: {report.submitted_at ? formatDate(report.submitted_at) : '—'}
                </span>
                <span className="task-meta-item">
                  <Calendar size={14} />
                  Hạn: {formatDate(task.deadline)}
                </span>
              </div>
              {report.content_html && (
                <div
                  className="text-sm text-secondary"
                  style={{ marginTop: 'var(--space-2)', lineHeight: 1.5, maxHeight: 48, overflow: 'hidden' }}
                >
                  {report.content_html.replace(/<[^>]*>/g, ' ').slice(0, 150)}...
                </div>
              )}
            </div>
          );
        })}

        {mySubmittedReports.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={28} /></div>
            <h3>Chưa có báo cáo nào</h3>
            <p>Các báo cáo đã nộp sẽ hiển thị tại đây.</p>
          </div>
        )}
      </div>
    </div>
  );
}
