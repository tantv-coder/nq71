// ============================================
// HỆ THỐNG THEO DÕI BÁO CÁO NQ71 - Types
// ============================================

export type UserRole = 'ROLE_ADMIN' | 'ROLE_REPORTER';
export type UnitGroup = 'phong_so' | 'phuong_xa' | 'truong_thpt';
export type TaskStatus = 'active' | 'deleted';
export type ReportStatus = 'draft' | 'submitted';
export type AuditAction =
  | 'CREATE_TASK'
  | 'UPDATE_TASK'
  | 'DELETE_TASK'
  | 'SUBMIT_REPORT'
  | 'UPDATE_REPORT'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  unit_group_id: UnitGroup | null;
  unit_name: string | null;
  password?: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: Record<string, unknown> | null;
  description_html: string | null;
  deadline: string;
  target_groups: UnitGroup[];
  status: TaskStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  // joined
  creator?: Profile;
  report_stats?: {
    total: number;
    submitted: number;
    pending: number;
    overdue: number;
  };
}

export interface Report {
  id: string;
  task_id: string;
  reporter_id: string;
  content: Record<string, unknown> | null;
  content_html: string | null;
  status: ReportStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  reporter?: Profile;
  task?: Task;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  // joined
  user?: Profile;
}

export const UNIT_GROUP_LABELS: Record<UnitGroup, string> = {
  phong_so: 'Phòng thuộc Sở',
  phuong_xa: 'Phòng Văn hóa - Xã hội phường, xã, đặc khu',
  truong_thpt: 'Trường THPT',
};

export const UNIT_GROUP_OPTIONS: { value: UnitGroup; label: string }[] = [
  { value: 'phong_so', label: 'Phòng thuộc Sở' },
  { value: 'phuong_xa', label: 'Phòng Văn hóa - Xã hội phường, xã, đặc khu' },
  { value: 'truong_thpt', label: 'Trường THPT' },
];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Bản nháp',
  submitted: 'Đã nộp',
};
