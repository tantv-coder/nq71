import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import {
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';

export default function MyTasksPage() {
  const { tasks, reports } = useAppStore();
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted'>('pending');

  const myTasks = useMemo(() => {
    if (!profile?.unit_group_id) return [];
    return tasks.filter(
      (t) => t.status === 'active' && t.target_groups.includes(profile.unit_group_id!)
    );
  }, [tasks, profile]);

  const myReports = useMemo(() => {
    if (!profile) return [];
    return reports.filter((r) => r.reporter_id === profile.id);
  }, [reports, profile]);

  const pendingTasks = useMemo(() => {
    return myTasks.filter((task) => {
      const report = myReports.find((r) => r.task_id === task.id && r.status === 'submitted');
      return !report;
    });
  }, [myTasks, myReports]);

  const submittedTasks = useMemo(() => {
    return myTasks.filter((task) => {
      const report = myReports.find((r) => r.task_id === task.id && r.status === 'submitted');
      return !!report;
    });
  }, [myTasks, myReports]);

  const isOverdue = (deadline: string) => new Date(deadline) < new Date();

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff < 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
    return `Còn ${hours} giờ`;
  };

  const currentList = activeTab === 'pending' ? pendingTasks : submittedTasks;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>📋 Nhiệm vụ của tôi</h1>
          <p>{profile?.unit_name || 'Đơn vị'} — Danh sách nhiệm vụ cần báo cáo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={16} style={{ marginRight: 6 }} />
          Chưa nộp
          <span className="tab-count">{pendingTasks.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'submitted' ? 'active' : ''}`}
          onClick={() => setActiveTab('submitted')}
        >
          <CheckCircle2 size={16} style={{ marginRight: 6 }} />
          Đã nộp
          <span className="tab-count">{submittedTasks.length}</span>
        </button>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {currentList.map((task, idx) => {
          const overdue = isOverdue(task.deadline);
          const remaining = getTimeRemaining(task.deadline);
          const report = myReports.find((r) => r.task_id === task.id);
          const hasDraft = report?.status === 'draft';

          return (
            <div
              key={task.id}
              className={`task-item ${overdue && activeTab === 'pending' ? 'overdue' : ''} animate-fade-in-up`}
              style={{ animationDelay: `${idx * 60}ms`, cursor: 'pointer' }}
              onClick={() => navigate(`/report/${task.id}`)}
            >
              <div className="task-item-header">
                <div className="task-item-title">{task.title}</div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  {activeTab === 'pending' && overdue && (
                    <span className="badge badge-danger">
                      <AlertTriangle size={12} /> Quá hạn
                    </span>
                  )}
                  {activeTab === 'pending' && !overdue && remaining && (
                    <span className="badge badge-warning">{remaining}</span>
                  )}
                  {activeTab === 'pending' && hasDraft && (
                    <span className="badge badge-info">📝 Có bản nháp</span>
                  )}
                  {activeTab === 'submitted' && report?.submitted_at && (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Đã nộp {formatDate(report.submitted_at)}
                    </span>
                  )}
                  <ChevronRight size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                </div>
              </div>

              <div className="task-item-meta">
                <span className="task-meta-item">
                  <Calendar size={14} />
                  Hạn: {formatDate(task.deadline)}
                </span>
              </div>

              {task.description_html && (
                <div
                  className="text-sm text-secondary"
                  style={{ marginTop: 'var(--space-2)', lineHeight: 1.5, maxHeight: 48, overflow: 'hidden' }}
                  dangerouslySetInnerHTML={{
                    __html: task.description_html.replace(/<[^>]*>/g, ' ').slice(0, 120) + '...',
                  }}
                />
              )}
            </div>
          );
        })}

        {currentList.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={28} />
            </div>
            <h3>
              {activeTab === 'pending'
                ? 'Không có nhiệm vụ chưa nộp'
                : 'Chưa có báo cáo nào được nộp'}
            </h3>
            <p>
              {activeTab === 'pending'
                ? 'Tuyệt vời! Bạn đã hoàn thành tất cả nhiệm vụ.'
                : 'Các báo cáo đã nộp sẽ hiển thị ở đây.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
