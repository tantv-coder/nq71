import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import TaskFormModal from './TaskFormModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { UNIT_GROUP_LABELS } from '../../types';
import {
  Plus,
  Search,
  Calendar,
  Users,
  Pencil,
  Trash2,
  Eye,
  ListTodo,
} from 'lucide-react';

export default function TaskListPage() {
  const { tasks, deleteTask, addAuditLog, reports, profiles } = useAppStore();
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);

  const activeTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'active')
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tasks, search]);

  const handleDelete = () => {
    if (!deletingTask || !profile) return;
    const task = tasks.find((t) => t.id === deletingTask);
    deleteTask(deletingTask);
    addAuditLog({
      id: `log-${Date.now()}`,
      user_id: profile.id,
      action: 'DELETE_TASK',
      entity_type: 'task',
      entity_id: deletingTask,
      details: { title: task?.title },
      created_at: new Date().toISOString(),
    });
    setDeletingTask(null);
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

  const getSubmittedCount = (taskId: string) => {
    return reports.filter((r) => r.task_id === taskId && r.status === 'submitted').length;
  };

  const getTotalReporters = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return 0;
    return profiles.filter(
      (p) => p.role === 'ROLE_REPORTER' && p.unit_group_id && task.target_groups.includes(p.unit_group_id)
    ).length;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>📋 Quản lý Nhiệm vụ</h1>
          <p>Tạo và quản lý các nhiệm vụ giao cho đơn vị trực thuộc</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowForm(true); }} id="create-task-btn">
          <Plus size={18} />
          Tạo nhiệm vụ
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            className="search-input"
            placeholder="Tìm kiếm nhiệm vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="task-search"
          />
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {activeTasks.map((task, idx) => {
          const overdue = isOverdue(task.deadline);
          const submitted = getSubmittedCount(task.id);
          const total = getTotalReporters(task.id);

          return (
            <div
              key={task.id}
              className={`task-item ${overdue ? 'overdue' : ''} animate-fade-in-up`}
              style={{ animationDelay: `${idx * 60}ms`, cursor: 'default' }}
            >
              <div className="task-item-header">
                <div className="task-item-title" style={{ cursor: 'pointer' }} onClick={() => navigate(`/tasks/${task.id}`)}>
                  {task.title}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                  {overdue ? (
                    <span className="badge badge-danger">⚠ Quá hạn</span>
                  ) : (
                    <span className="badge badge-success">✓ Còn hạn</span>
                  )}
                  <span className="badge badge-info">{submitted}/{total} đã nộp</span>
                </div>
              </div>

              <div className="task-item-meta">
                <span className="task-meta-item">
                  <Calendar size={14} />
                  Hạn: {formatDate(task.deadline)}
                </span>
                <span className="task-meta-item">
                  <Users size={14} />
                  {task.target_groups.map((g) => UNIT_GROUP_LABELS[g as keyof typeof UNIT_GROUP_LABELS]).join(', ')}
                </span>
              </div>

              <div className="task-groups" style={{ marginTop: 'var(--space-3)' }}>
                {task.target_groups.map((g) => (
                  <span key={g} className="badge badge-neutral">
                    {UNIT_GROUP_LABELS[g as keyof typeof UNIT_GROUP_LABELS]}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/tasks/${task.id}`)}>
                  <Eye size={14} /> Chi tiết
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingTask(task.id); setShowForm(true); }}>
                  <Pencil size={14} /> Sửa
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-accent-danger)' }} onClick={() => setDeletingTask(task.id)}>
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            </div>
          );
        })}

        {activeTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><ListTodo size={28} /></div>
            <h3>Chưa có nhiệm vụ nào</h3>
            <p>Bấm "Tạo nhiệm vụ" để bắt đầu giao việc cho các đơn vị.</p>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingTask(null); }}
        editTaskId={editingTask}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        title="Xóa nhiệm vụ?"
        message="Nhiệm vụ sẽ bị ẩn khỏi tất cả các đơn vị. Hành động này có thể được khôi phục từ nhật ký hệ thống."
        confirmText="Xóa nhiệm vụ"
      />
    </div>
  );
}
