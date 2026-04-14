import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import RichTextEditor from '../../components/editor/RichTextEditor';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  ArrowLeft,
  Calendar,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function ReportFormPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, reports, addReport, updateReport, addAuditLog } = useAppStore();
  const { profile } = useAuthStore();

  const task = useMemo(() => tasks.find((t) => t.id === taskId), [tasks, taskId]);
  const existingReport = useMemo(
    () => reports.find((r) => r.task_id === taskId && r.reporter_id === profile?.id),
    [reports, taskId, profile]
  );

  const [contentHtml, setContentHtml] = useState(existingReport?.content_html || '');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!task || !profile) {
    return (
      <div className="empty-state">
        <h3>Không tìm thấy nhiệm vụ</h3>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>
    );
  }

  const isOverdue = new Date(task.deadline) < new Date();
  const isSubmitted = existingReport?.status === 'submitted';

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const handleSaveDraft = () => {
    setIsSaving(true);
    if (existingReport) {
      updateReport(existingReport.id, {
        content_html: contentHtml,
        status: 'draft',
      });
    } else {
      addReport({
        id: `report-${Date.now()}`,
        task_id: task.id,
        reporter_id: profile.id,
        content: null,
        content_html: contentHtml,
        status: 'draft',
        submitted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleSubmit = () => {
    const now = new Date().toISOString();
    if (existingReport) {
      updateReport(existingReport.id, {
        content_html: contentHtml,
        status: 'submitted',
        submitted_at: now,
      });
    } else {
      addReport({
        id: `report-${Date.now()}`,
        task_id: task.id,
        reporter_id: profile.id,
        content: null,
        content_html: contentHtml,
        status: 'submitted',
        submitted_at: now,
        created_at: now,
        updated_at: now,
      });
    }

    addAuditLog({
      id: `log-${Date.now()}`,
      user_id: profile.id,
      action: 'SUBMIT_REPORT',
      entity_type: 'report',
      entity_id: existingReport?.id || `report-${Date.now()}`,
      details: { task_title: task.title, unit_name: profile.unit_name },
      created_at: now,
    });

    navigate('/');
  };

  return (
    <div>
      {/* Back button */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 'var(--space-4)' }}>
        <ArrowLeft size={16} /> Quay lại
      </button>

      {/* Task Info */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              {task.title}
            </h2>
            <div className="task-item-meta">
              <span className="task-meta-item">
                <Calendar size={14} />
                Hạn: {formatDate(task.deadline)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {isSubmitted ? (
              <span className="badge badge-success"><CheckCircle2 size={12} /> Đã nộp</span>
            ) : isOverdue ? (
              <span className="badge badge-danger"><AlertTriangle size={12} /> Quá hạn</span>
            ) : (
              <span className="badge badge-warning">Chưa nộp</span>
            )}
          </div>
        </div>

        {task.description_html && (
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
            <div className="text-sm font-medium text-secondary" style={{ marginBottom: 'var(--space-2)' }}>
              Nội dung yêu cầu:
            </div>
            <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: task.description_html }} />
          </div>
        )}
      </div>

      {/* Report Editor */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {isSubmitted ? '📄 Nội dung báo cáo đã nộp' : '✏️ Soạn thảo báo cáo'}
          </h3>
          {isSubmitted && existingReport?.submitted_at && (
            <span className="text-sm text-secondary">
              Nộp lúc: {formatDate(existingReport.submitted_at)}
            </span>
          )}
        </div>

        {isSubmitted ? (
          <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        ) : (
          <>
            <RichTextEditor
              content={contentHtml}
              onChange={setContentHtml}
              placeholder="Nhập nội dung báo cáo của đơn vị..."
            />

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={handleSaveDraft} disabled={isSaving}>
                <Save size={16} />
                {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
              </button>
              <button
                className="btn btn-success"
                onClick={() => setShowConfirmSubmit(true)}
                disabled={!contentHtml.trim() || contentHtml === '<p></p>'}
                id="submit-report-btn"
              >
                <Send size={16} />
                Nộp báo cáo
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirm Submit */}
      <ConfirmDialog
        isOpen={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        onConfirm={handleSubmit}
        title="Nộp báo cáo?"
        message="Sau khi nộp, nội dung báo cáo sẽ được gửi đến cấp trên. Bạn có chắc chắn muốn nộp?"
        confirmText="Nộp báo cáo"
        variant="warning"
      />
    </div>
  );
}
