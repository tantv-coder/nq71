import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Users,
} from 'lucide-react';
import { UNIT_GROUP_LABELS } from '../../types';
import type { UnitGroup } from '../../types';

export default function DashboardPage() {
  const { tasks, reports, profiles } = useAppStore();
  const navigate = useNavigate();

  const activeTasks = useMemo(() => tasks.filter((t) => t.status === 'active'), [tasks]);

  const stats = useMemo(() => {
    const now = new Date();
    let totalReportsExpected = 0;
    let totalSubmitted = 0;
    let totalOverdue = 0;

    activeTasks.forEach((task) => {
      const targetReporters = profiles.filter(
        (p) => p.role === 'ROLE_REPORTER' && p.unit_group_id && task.target_groups.includes(p.unit_group_id)
      );
      totalReportsExpected += targetReporters.length;

      targetReporters.forEach((reporter) => {
        const report = reports.find(
          (r) => r.task_id === task.id && r.reporter_id === reporter.id && r.status === 'submitted'
        );
        if (report) {
          totalSubmitted++;
        } else if (new Date(task.deadline) < now) {
          totalOverdue++;
        }
      });
    });

    return {
      totalTasks: activeTasks.length,
      totalSubmitted,
      totalPending: totalReportsExpected - totalSubmitted,
      totalOverdue,
    };
  }, [activeTasks, reports, profiles]);

  const recentTasks = useMemo(() => {
    return activeTasks
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [activeTasks]);

  const getTaskProgress = (taskId: string, targetGroups: UnitGroup[]) => {
    const targetReporters = profiles.filter(
      (p) => p.role === 'ROLE_REPORTER' && p.unit_group_id && targetGroups.includes(p.unit_group_id)
    );
    const submitted = reports.filter(
      (r) => r.task_id === taskId && r.status === 'submitted'
    ).length;
    const total = targetReporters.length;
    return { submitted, total, percent: total > 0 ? Math.round((submitted / total) * 100) : 0 };
  };

  const isOverdue = (deadline: string) => new Date(deadline) < new Date();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>📊 Dashboard</h1>
          <p>Tổng quan tình hình báo cáo Nghị quyết 71</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-total animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <div className="stat-icon"><ListTodo size={22} /></div>
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-label">Tổng nhiệm vụ</div>
        </div>
        <div className="stat-card stat-completed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="stat-icon"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{stats.totalSubmitted}</div>
          <div className="stat-label">Đã nộp báo cáo</div>
        </div>
        <div className="stat-card stat-pending animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="stat-icon"><Clock size={22} /></div>
          <div className="stat-value">{stats.totalPending}</div>
          <div className="stat-label">Chờ báo cáo</div>
        </div>
        <div className="stat-card stat-overdue animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="stat-icon"><AlertTriangle size={22} /></div>
          <div className="stat-value">{stats.totalOverdue}</div>
          <div className="stat-label">Quá hạn</div>
        </div>
      </div>

      {/* Recent Tasks with Progress */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title">Tiến độ báo cáo theo nhiệm vụ</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>
            Xem tất cả <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {recentTasks.map((task, idx) => {
            const progress = getTaskProgress(task.id, task.target_groups);
            const overdue = isOverdue(task.deadline);

            return (
              <div
                key={task.id}
                className={`task-item ${overdue ? 'overdue' : ''}`}
                style={{ animationDelay: `${idx * 80}ms` }}
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <div className="task-item-header">
                  <div className="task-item-title">{task.title}</div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {overdue && (
                      <span className="badge badge-danger">⚠ Quá hạn</span>
                    )}
                    <span className="badge badge-info">
                      {progress.submitted}/{progress.total} đã nộp
                    </span>
                  </div>
                </div>

                <div className="task-item-meta">
                  <span className="task-meta-item">
                    <Calendar size={14} />
                    {formatDate(task.deadline)}
                  </span>
                  <span className="task-meta-item">
                    <Users size={14} />
                    {task.target_groups.map((g) => UNIT_GROUP_LABELS[g]).join(', ')}
                  </span>
                </div>

                <div style={{ marginTop: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="text-sm text-secondary">Tiến độ</span>
                    <span className="text-sm font-semibold">{progress.percent}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>
              </div>
            );
          })}

          {recentTasks.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><ListTodo size={28} /></div>
              <h3>Chưa có nhiệm vụ nào</h3>
              <p>Hãy tạo nhiệm vụ đầu tiên để bắt đầu theo dõi báo cáo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
