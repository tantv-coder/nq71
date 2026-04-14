import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { UNIT_GROUP_LABELS, UNIT_GROUP_OPTIONS } from '../../types';
import type { UnitGroup } from '../../types';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Save,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';

const GROUP_KEY_MAP: Record<string, UnitGroup> = {
  'phong_so': 'phong_so',
  'phuong_xa': 'phuong_xa',
  'truong_thpt': 'truong_thpt',
  'phòng thuộc sở': 'phong_so',
  'phòng sở': 'phong_so',
  'phong so': 'phong_so',
  'phòng văn hóa': 'phuong_xa',
  'phòng vh-xh': 'phuong_xa',
  'phường xã': 'phuong_xa',
  'phuong xa': 'phuong_xa',
  'trường thpt': 'truong_thpt',
  'truong thpt': 'truong_thpt',
  'thpt': 'truong_thpt',
};

function resolveGroup(raw: string): UnitGroup | null {
  const key = raw.trim().toLowerCase();
  if (GROUP_KEY_MAP[key]) return GROUP_KEY_MAP[key];
  // fuzzy match
  for (const [k, v] of Object.entries(GROUP_KEY_MAP)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

interface ImportRow {
  name: string;
  email: string;
  groupRaw: string;
  group: UnitGroup | null;
  unitName: string;
  errors: string[];
  isDuplicate: boolean;
}

export default function UserListPage() {
  const { profiles, addProfile, updateProfile, deleteProfile, resetUserPassword } = useAppStore();

  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importStep, setImportStep] = useState<'input' | 'preview' | 'result'>('input');
  const [importText, setImportText] = useState('');
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importResult, setImportResult] = useState({ success: 0, failed: 0 });

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGroup, setFormGroup] = useState<UnitGroup>('phong_so');
  const [formUnitName, setFormUnitName] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const reporters = useMemo(() => {
    return profiles
      .filter((p) => p.role === 'ROLE_REPORTER')
      .filter((p) => filterGroup === 'all' || p.unit_group_id === filterGroup)
      .filter((p) =>
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        (p.unit_name || '').toLowerCase().includes(search.toLowerCase())
      );
  }, [profiles, search, filterGroup]);

  const openCreateForm = () => {
    setEditingId(null);
    setFormName('');
    setFormEmail('');
    setFormGroup('phong_so');
    setFormUnitName('');
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (id: string) => {
    const prof = profiles.find((p) => p.id === id);
    if (!prof) return;
    setEditingId(id);
    setFormName(prof.full_name);
    setFormEmail(prof.email);
    setFormGroup((prof.unit_group_id as UnitGroup) || 'phong_so');
    setFormUnitName(prof.unit_name || '');
    setFormErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!formName.trim()) errs.name = 'Tên không được trống';
    if (!formEmail.trim()) errs.email = 'Email không được trống';
    if (!formUnitName.trim()) errs.unitName = 'Tên đơn vị không được trống';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (editingId) {
      updateProfile(editingId, {
        full_name: formName.trim(),
        email: formEmail.trim(),
        unit_group_id: formGroup,
        unit_name: formUnitName.trim(),
      });
    } else {
      addProfile({
        id: `reporter-${Date.now()}`,
        email: formEmail.trim(),
        full_name: formName.trim(),
        role: 'ROLE_REPORTER',
        unit_group_id: formGroup,
        unit_name: formUnitName.trim(),
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteProfile(deletingId);
      setDeletingId(null);
      toast.success('Đã xóa đơn vị');
    }
  };

  const handleResetPassword = async () => {
    if (resettingId) {
      const prof = profiles.find((p) => p.id === resettingId);
      if (prof) {
        try {
          await resetUserPassword(prof.email);
          toast.success(`Đã gửi email khôi phục mật khẩu đến ${prof.email}`);
        } catch (error) {
          toast.error('Có lỗi xảy ra khi khôi phục mật khẩu');
        }
      }
      setResettingId(null);
    }
  };

  // ---- Import Logic ----
  const openImport = () => {
    setImportStep('input');
    setImportText('');
    setImportRows([]);
    setImportResult({ success: 0, failed: 0 });
    setShowImport(true);
  };

  const existingEmails = useMemo(
    () => new Set(profiles.map((p) => p.email.toLowerCase())),
    [profiles]
  );

  const parseImport = useCallback(() => {
    const lines = importText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Skip header row if detected
    const firstLine = lines[0]?.toLowerCase() || '';
    const startIdx =
      firstLine.includes('họ tên') ||
      firstLine.includes('ho ten') ||
      firstLine.includes('email') ||
      firstLine.includes('name')
        ? 1
        : 0;

    const rows: ImportRow[] = [];
    const seenEmails = new Set<string>();

    for (let i = startIdx; i < lines.length; i++) {
      // Auto-detect delimiter: tab or comma
      const delimiter = lines[i].includes('\t') ? '\t' : ',';
      const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''));

      const name = cols[0] || '';
      const email = cols[1] || '';
      const groupRaw = cols[2] || '';
      const unitName = cols[3] || name; // fallback to name

      const errors: string[] = [];
      if (!name) errors.push('Thiếu họ tên');
      if (!email) errors.push('Thiếu email');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email không hợp lệ');

      const group = resolveGroup(groupRaw);
      if (!groupRaw) errors.push('Thiếu nhóm ĐV');
      else if (!group) errors.push(`Nhóm "${groupRaw}" không hợp lệ`);

      const isDuplicate =
        existingEmails.has(email.toLowerCase()) || seenEmails.has(email.toLowerCase());
      if (isDuplicate && email) errors.push('Email đã tồn tại');

      if (email) seenEmails.add(email.toLowerCase());

      rows.push({ name, email, groupRaw, group, unitName, errors, isDuplicate });
    }

    setImportRows(rows);
    setImportStep('preview');
  }, [importText, existingEmails]);

  const executeImport = useCallback(() => {
    let success = 0;
    let failed = 0;
    const now = new Date().toISOString();

    importRows.forEach((row) => {
      if (row.errors.length > 0) {
        failed++;
        return;
      }
      addProfile({
        id: `reporter-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        email: row.email.trim(),
        full_name: row.name.trim(),
        role: 'ROLE_REPORTER',
        unit_group_id: row.group!,
        unit_name: row.unitName.trim() || row.name.trim(),
        avatar_url: null,
        created_at: now,
        updated_at: now,
      });
      success++;
    });

    setImportResult({ success, failed });
    setImportStep('result');
  }, [importRows, addProfile]);

  const downloadTemplate = () => {
    const header = 'Họ tên,Email,Nhóm đơn vị,Tên đơn vị đầy đủ';
    const sample = [
      'Phòng KH-TC,phongkhtc@sgddt.edu.vn,phong_so,Phòng Kế hoạch - Tài chính',
      'UBND Phường 1,ubnd.p1@hcm.edu.vn,phuong_xa,UBND Phường 1 Quận 1',
      'THPT Lê Quý Đôn,thpt.lqd@sgddt.edu.vn,truong_thpt,Trường THPT Lê Quý Đôn',
    ];
    const csv = [header, ...sample].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mau_import_tai_khoan.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = importRows.filter((r) => r.errors.length === 0).length;
  const errorCount = importRows.filter((r) => r.errors.length > 0).length;

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    profiles.forEach((p) => {
      if (p.role === 'ROLE_REPORTER') {
        counts.all++;
        if (p.unit_group_id) {
          counts[p.unit_group_id] = (counts[p.unit_group_id] || 0) + 1;
        }
      }
    });
    return counts;
  }, [profiles]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>👥 Quản lý Người dùng</h1>
          <p>Quản lý danh mục đơn vị báo cáo Cấp 2</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary" onClick={openImport} id="import-users-btn">
            <Upload size={18} /> Import hàng loạt
          </button>
          <button className="btn btn-primary" onClick={openCreateForm} id="create-user-btn">
            <Plus size={18} /> Thêm đơn vị
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} />
          <input className="search-input" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="form-input form-select"
          style={{ maxWidth: 220 }}
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
        >
          <option value="all">Tất cả nhóm ({groupCounts.all || 0})</option>
          {UNIT_GROUP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} ({groupCounts[opt.value] || 0})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Đơn vị</th>
              <th>Email</th>
              <th>Nhóm</th>
              <th style={{ width: 100 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reporters.map((reporter) => (
              <tr key={reporter.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: 'var(--font-size-xs)' }}>
                      {reporter.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{reporter.full_name}</div>
                      <div className="text-xs text-secondary">{reporter.unit_name}</div>
                    </div>
                  </div>
                </td>
                <td className="text-sm">{reporter.email}</td>
                <td>
                  <span className="badge badge-neutral">
                    {reporter.unit_group_id ? UNIT_GROUP_LABELS[reporter.unit_group_id] : '—'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEditForm(reporter.id)} title="Sửa">
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--color-accent-warning)' }}
                      onClick={() => setResettingId(reporter.id)}
                      title="Khôi phục mật khẩu"
                    >
                      <KeyRound size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--color-accent-danger)' }}
                      onClick={() => setDeletingId(reporter.id)}
                      title="Xóa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reporters.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                    <div className="empty-state-icon"><Users size={28} /></div>
                    <h3>Không có đơn vị nào</h3>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? '✏️ Sửa đơn vị' : '➕ Thêm đơn vị mới'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={16} /> {editingId ? 'Cập nhật' : 'Thêm'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="form-group">
            <label className="form-label">Họ tên / Tên viết tắt <span className="required">*</span></label>
            <input className="form-input" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="VD: Phòng KH-TC" />
            {formErrors.name && <span className="form-error">{formErrors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email đăng nhập <span className="required">*</span></label>
            <input className="form-input" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="example@sgddt.edu.vn" />
            {formErrors.email && <span className="form-error">{formErrors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Nhóm đơn vị <span className="required">*</span></label>
            <select className="form-input form-select" value={formGroup} onChange={(e) => setFormGroup(e.target.value as UnitGroup)}>
              {UNIT_GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tên đơn vị đầy đủ <span className="required">*</span></label>
            <input className="form-input" value={formUnitName} onChange={(e) => setFormUnitName(e.target.value)} placeholder="VD: Phòng Kế hoạch - Tài chính" />
            {formErrors.unitName && <span className="form-error">{formErrors.unitName}</span>}
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Xóa đơn vị?"
        message="Đơn vị sẽ bị xóa khỏi hệ thống. Các báo cáo đã nộp vẫn được giữ lại."
        confirmText="Xóa"
      />

      {/* Confirm Reset Password */}
      <ConfirmDialog
        isOpen={!!resettingId}
        onClose={() => setResettingId(null)}
        onConfirm={handleResetPassword}
        title="Khôi phục mật khẩu?"
        message="Hệ thống sẽ gửi một email khôi phục mật khẩu đến địa chỉ email của đơn vị này."
        confirmText="Xác nhận"
        variant="warning"
      />

      {/* Import Modal */}
      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="📥 Import hàng loạt tài khoản"
        size="xl"
        footer={
          importStep === 'input' ? (
            <>
              <button className="btn btn-secondary" onClick={() => setShowImport(false)}>Hủy</button>
              <button
                className="btn btn-primary"
                onClick={parseImport}
                disabled={!importText.trim()}
              >
                <FileSpreadsheet size={16} /> Xem trước dữ liệu
              </button>
            </>
          ) : importStep === 'preview' ? (
            <>
              <button className="btn btn-secondary" onClick={() => setImportStep('input')}>← Quay lại</button>
              <button
                className="btn btn-primary"
                onClick={executeImport}
                disabled={validCount === 0}
              >
                <Upload size={16} /> Import {validCount} tài khoản
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowImport(false)}>Đóng</button>
          )
        }
      >
        {importStep === 'input' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Instructions */}
            <div style={{
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1.7,
            }}>
              <div className="font-semibold" style={{ marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <FileSpreadsheet size={16} style={{ color: 'var(--color-accent-primary)' }} />
                Hướng dẫn import
              </div>
              <div>Dán dữ liệu CSV hoặc dữ liệu từ Excel (phân cách bằng tab hoặc dấu phẩy) với 4 cột:</div>
              <div style={{ marginTop: 'var(--space-2)', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-accent-primary)' }}>
                Họ tên, Email, Nhóm đơn vị, Tên đơn vị
              </div>
              <div style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-tertiary)' }}>
                Nhóm đơn vị: <code style={{ background: 'var(--color-bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>phong_so</code>{' '}
                <code style={{ background: 'var(--color-bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>phuong_xa</code>{' '}
                <code style={{ background: 'var(--color-bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>truong_thpt</code>
              </div>
            </div>

            {/* Download template */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={downloadTemplate}
              style={{ alignSelf: 'flex-start' }}
            >
              <Download size={14} /> Tải file mẫu CSV
            </button>

            {/* Text area */}
            <div className="form-group">
              <label className="form-label">Dán dữ liệu tại đây <span className="required">*</span></label>
              <textarea
                className="form-input form-textarea"
                style={{ minHeight: 180, fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', lineHeight: 1.6 }}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`Họ tên,Email,Nhóm đơn vị,Tên đơn vị\nPhòng KH-TC,phongkhtc@sgddt.edu.vn,phong_so,Phòng Kế hoạch - Tài chính\nTHPT Nguyễn Du,thpt.nd@sgddt.edu.vn,truong_thpt,Trường THPT Nguyễn Du`}
              />
            </div>

            {/* Quick file upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className="text-sm text-secondary">Hoặc chọn file CSV:</span>
              <input
                type="file"
                accept=".csv,.txt"
                style={{ fontSize: 'var(--font-size-sm)' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setImportText((ev.target?.result as string) || '');
                  };
                  reader.readAsText(file, 'UTF-8');
                }}
              />
            </div>
          </div>
        )}

        {importStep === 'preview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Summary */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--color-accent-success-glow)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-accent-success)',
                fontWeight: 600,
              }}>
                <CheckCircle2 size={16} /> {validCount} hợp lệ
              </div>
              {errorCount > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--color-accent-danger-glow)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-accent-danger)',
                  fontWeight: 600,
                }}>
                  <AlertCircle size={16} /> {errorCount} lỗi (sẽ bị bỏ qua)
                </div>
              )}
              <div className="text-sm text-secondary" style={{ display: 'flex', alignItems: 'center' }}>
                Tổng: {importRows.length} dòng
              </div>
            </div>

            {/* Preview table */}
            <div className="data-table-wrapper" style={{ maxHeight: 360, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Nhóm</th>
                    <th>Tên đơn vị</th>
                    <th style={{ width: 60 }}>TT</th>
                  </tr>
                </thead>
                <tbody>
                  {importRows.map((row, idx) => (
                    <tr key={idx} style={row.errors.length > 0 ? { background: 'rgba(239, 68, 68, 0.04)' } : {}}>
                      <td className="text-xs text-secondary">{idx + 1}</td>
                      <td className="text-sm">{row.name || <span style={{ color: 'var(--color-accent-danger)' }}>—</span>}</td>
                      <td className="text-sm" style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>
                        {row.email || <span style={{ color: 'var(--color-accent-danger)' }}>—</span>}
                      </td>
                      <td>
                        {row.group ? (
                          <span className="badge badge-info" style={{ fontSize: 'var(--font-size-xs)' }}>
                            {UNIT_GROUP_LABELS[row.group]}
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: 'var(--font-size-xs)' }}>
                            {row.groupRaw || '?'}
                          </span>
                        )}
                      </td>
                      <td className="text-sm">{row.unitName}</td>
                      <td>
                        {row.errors.length === 0 ? (
                          <CheckCircle2 size={16} style={{ color: 'var(--color-accent-success)' }} />
                        ) : (
                          <div title={row.errors.join('\n')}>
                            <AlertCircle size={16} style={{ color: 'var(--color-accent-danger)', cursor: 'help' }} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Error details */}
            {errorCount > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--font-size-xs)',
                maxHeight: 120,
                overflowY: 'auto',
              }}>
                <div className="font-semibold" style={{ color: 'var(--color-accent-danger)', marginBottom: 'var(--space-2)' }}>
                  Chi tiết lỗi:
                </div>
                {importRows.filter(r => r.errors.length > 0).map((r, i) => (
                  <div key={i} style={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}>
                    Dòng {importRows.indexOf(r) + 1}: {r.errors.join(', ')}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {importStep === 'result' && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 'var(--radius-full)',
              background: 'var(--color-accent-success-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-6)',
            }}>
              <CheckCircle2 size={32} style={{ color: 'var(--color-accent-success)' }} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Import hoàn tất!
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-accent-success)' }}>
                  {importResult.success}
                </div>
                <div className="text-sm text-secondary">Thành công</div>
              </div>
              {importResult.failed > 0 && (
                <div>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-accent-danger)' }}>
                    {importResult.failed}
                  </div>
                  <div className="text-sm text-secondary">Bỏ qua</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
