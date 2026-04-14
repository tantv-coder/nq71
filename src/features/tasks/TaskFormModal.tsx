import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from '../../components/ui/Modal';
import RichTextEditor from '../../components/editor/RichTextEditor';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { UNIT_GROUP_OPTIONS } from '../../types';
import type { UnitGroup } from '../../types';
import { Save } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTaskId: string | null;
}

export default function TaskFormModal({ isOpen, onClose, editTaskId }: TaskFormModalProps) {
  const { tasks, addTask, updateTask, addAuditLog } = useAppStore();
  const { profile } = useAuthStore();

  const [title, setTitle] = useState('');
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(new Date());
  const [targetGroups, setTargetGroups] = useState<UnitGroup[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const editingTask = editTaskId ? tasks.find((t) => t.id === editTaskId) : null;

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescriptionHtml(editingTask.description_html || '');
      setDeadline(new Date(editingTask.deadline));
      setTargetGroups([...editingTask.target_groups]);
    } else {
      setTitle('');
      setDescriptionHtml('');
      setDeadline(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setTargetGroups([]);
    }
    setErrors({});
  }, [editingTask, isOpen]);

  const toggleGroup = (group: UnitGroup) => {
    setTargetGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Tiêu đề không được để trống';
    if (!deadline) errs.deadline = 'Vui lòng chọn hạn chót';
    if (targetGroups.length === 0) errs.targetGroups = 'Vui lòng chọn ít nhất 1 nhóm đối tượng';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate() || !profile) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description_html: descriptionHtml,
        deadline: deadline!.toISOString(),
        target_groups: targetGroups,
      });
      addAuditLog({
        id: `log-${Date.now()}`,
        user_id: profile.id,
        action: 'UPDATE_TASK',
        entity_type: 'task',
        entity_id: editingTask.id,
        details: { title: title.trim() },
        created_at: new Date().toISOString(),
      });
    } else {
      const newTask = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: null,
        description_html: descriptionHtml,
        deadline: deadline!.toISOString(),
        target_groups: targetGroups,
        status: 'active' as const,
        created_by: profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addTask(newTask);
      addAuditLog({
        id: `log-${Date.now()}`,
        user_id: profile.id,
        action: 'CREATE_TASK',
        entity_type: 'task',
        entity_id: newTask.id,
        details: { title: title.trim() },
        created_at: new Date().toISOString(),
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? '✏️ Sửa nhiệm vụ' : '➕ Tạo nhiệm vụ mới'}
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave} id="save-task-btn">
            <Save size={16} />
            {editingTask ? 'Cập nhật' : 'Tạo nhiệm vụ'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label">
            Tiêu đề nhiệm vụ <span className="required">*</span>
          </label>
          <input
            className="form-input"
            placeholder="Nhập tiêu đề nhiệm vụ..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            id="task-title-input"
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Mô tả chi tiết</label>
          <RichTextEditor
            content={descriptionHtml}
            onChange={setDescriptionHtml}
            placeholder="Nhập mô tả chi tiết nhiệm vụ..."
          />
        </div>

        {/* Deadline */}
        <div className="form-group">
          <label className="form-label">
            Hạn chót <span className="required">*</span>
          </label>
          <DatePicker
            selected={deadline}
            onChange={(date: Date | null) => setDeadline(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy HH:mm"
            placeholderText="Chọn ngày giờ hạn chót..."
            minDate={new Date()}
            id="task-deadline-input"
          />
          {errors.deadline && <span className="form-error">{errors.deadline}</span>}
        </div>

        {/* Target Groups */}
        <div className="form-group">
          <label className="form-label">
            Đối tượng báo cáo <span className="required">*</span>
          </label>
          <div className="checkbox-group">
            {UNIT_GROUP_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`checkbox-item ${targetGroups.includes(option.value) ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={targetGroups.includes(option.value)}
                  onChange={() => toggleGroup(option.value)}
                />
                <span className="checkbox-label">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.targetGroups && <span className="form-error">{errors.targetGroups}</span>}
        </div>
      </div>
    </Modal>
  );
}
