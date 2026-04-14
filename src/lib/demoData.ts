// ============================================
// DEMO DATA - Mock data khi không có Supabase
// ============================================
import type { Profile, Task, Report, AuditLog } from '../types';

export const DEMO_ADMIN: Profile = {
  id: 'admin-001',
  email: 'trantan598497@gmail.com',
  full_name: 'Trần Văn Tân (Admin)',
  role: 'ROLE_ADMIN',
  unit_group_id: null,
  unit_name: 'Sở GD&ĐT TP.HCM',
  avatar_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const DEMO_REPORTERS: Profile[] = [
  {
    id: 'reporter-001',
    email: 'phongkhtc@sgddt.edu.vn',
    full_name: 'Phòng KH-TC',
    role: 'ROLE_REPORTER',
    unit_group_id: 'phong_so',
    unit_name: 'Phòng Kế hoạch - Tài chính',
    avatar_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'reporter-002',
    email: 'phonggdtx@sgddt.edu.vn',
    full_name: 'Phòng GDTX',
    role: 'ROLE_REPORTER',
    unit_group_id: 'phong_so',
    unit_name: 'Phòng Giáo dục Thường xuyên',
    avatar_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'reporter-003',
    email: 'gddt.quan1@hcm.edu.vn',
    full_name: 'Phòng GD&ĐT Quận 1',
    role: 'ROLE_REPORTER',
    unit_group_id: 'phuong_xa',
    unit_name: 'Phòng GD&ĐT Quận 1',
    avatar_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'reporter-004',
    email: 'gddt.quan3@hcm.edu.vn',
    full_name: 'Phòng GD&ĐT Quận 3',
    role: 'ROLE_REPORTER',
    unit_group_id: 'phuong_xa',
    unit_name: 'Phòng GD&ĐT Quận 3',
    avatar_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'reporter-005',
    email: 'thpt.lequydon@sgddt.edu.vn',
    full_name: 'THPT Lê Quý Đôn',
    role: 'ROLE_REPORTER',
    unit_group_id: 'truong_thpt',
    unit_name: 'Trường THPT Lê Quý Đôn',
    avatar_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'reporter-006',
    email: 'thpt.nguyentrai@sgddt.edu.vn',
    full_name: 'THPT Nguyễn Trãi',
    role: 'ROLE_REPORTER',
    unit_group_id: 'truong_thpt',
    unit_name: 'Trường THPT Nguyễn Trãi',
    avatar_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const now = new Date();
const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

export const DEMO_TASKS: Task[] = [
  {
    id: 'task-001',
    title: 'Báo cáo tiến độ triển khai chương trình GDPT 2018',
    description: null,
    description_html: '<p>Yêu cầu các đơn vị báo cáo chi tiết về tiến độ triển khai chương trình Giáo dục phổ thông 2018, bao gồm:</p><ul><li>Tình hình chuẩn bị đội ngũ giáo viên</li><li>Cơ sở vật chất, trang thiết bị</li><li>Kết quả học tập của học sinh</li><li>Khó khăn, vướng mắc và đề xuất</li></ul>',
    deadline: fiveDaysLater.toISOString(),
    target_groups: ['phong_so', 'phuong_xa', 'truong_thpt'],
    status: 'active',
    created_by: 'admin-001',
    created_at: '2026-03-25T08:00:00Z',
    updated_at: '2026-03-25T08:00:00Z',
  },
  {
    id: 'task-002',
    title: 'Thống kê số liệu tuyển sinh năm học 2026-2027',
    description: null,
    description_html: '<p>Các đơn vị thống kê và báo cáo về kế hoạch tuyển sinh năm học 2026-2027:</p><ol><li>Chỉ tiêu tuyển sinh dự kiến</li><li>Số liệu học sinh đăng ký</li><li>Dự báo số lượng học sinh tăng/giảm</li></ol>',
    deadline: twoDaysLater.toISOString(),
    target_groups: ['phuong_xa', 'truong_thpt'],
    status: 'active',
    created_by: 'admin-001',
    created_at: '2026-03-20T10:00:00Z',
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 'task-003',
    title: 'Báo cáo công tác an toàn trường học học kỳ II',
    description: null,
    description_html: '<p>Báo cáo tổng hợp về công tác đảm bảo an toàn trường học trong học kỳ II, năm học 2025-2026.</p>',
    deadline: twoDaysAgo.toISOString(),
    target_groups: ['phong_so', 'truong_thpt'],
    status: 'active',
    created_by: 'admin-001',
    created_at: '2026-03-10T08:00:00Z',
    updated_at: '2026-03-10T08:00:00Z',
  },
];

export const DEMO_REPORTS: Report[] = [
  {
    id: 'report-001',
    task_id: 'task-001',
    reporter_id: 'reporter-001',
    content: null,
    content_html: '<p>Phòng KH-TC đã hoàn thành việc bố trí kinh phí cho chương trình GDPT 2018. Chi tiết báo cáo kèm theo.</p>',
    status: 'submitted',
    submitted_at: '2026-03-28T14:30:00Z',
    created_at: '2026-03-27T10:00:00Z',
    updated_at: '2026-03-28T14:30:00Z',
  },
  {
    id: 'report-002',
    task_id: 'task-001',
    reporter_id: 'reporter-003',
    content: null,
    content_html: '<p>Quận 1 báo cáo: 100% trường đã triển khai chương trình GDPT 2018 đúng tiến độ.</p>',
    status: 'submitted',
    submitted_at: '2026-03-29T09:15:00Z',
    created_at: '2026-03-28T08:00:00Z',
    updated_at: '2026-03-29T09:15:00Z',
  },
  {
    id: 'report-003',
    task_id: 'task-002',
    reporter_id: 'reporter-005',
    content: null,
    content_html: '<p>Đang tổng hợp số liệu tuyển sinh, dự kiến hoàn thành trước hạn.</p>',
    status: 'draft',
    submitted_at: null,
    created_at: '2026-03-30T10:00:00Z',
    updated_at: '2026-03-30T10:00:00Z',
  },
  {
    id: 'report-004',
    task_id: 'task-003',
    reporter_id: 'reporter-005',
    content: null,
    content_html: '<p>THPT Lê Quý Đôn: Công tác an toàn trường học được đảm bảo tốt trong HK2.</p>',
    status: 'submitted',
    submitted_at: '2026-03-29T16:00:00Z',
    created_at: '2026-03-29T14:00:00Z',
    updated_at: '2026-03-29T16:00:00Z',
  },
];

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    user_id: 'admin-001',
    action: 'CREATE_TASK',
    entity_type: 'task',
    entity_id: 'task-001',
    details: { title: 'Báo cáo tiến độ triển khai chương trình GDPT 2018' },
    created_at: '2026-03-25T08:00:00Z',
  },
  {
    id: 'log-002',
    user_id: 'admin-001',
    action: 'CREATE_TASK',
    entity_type: 'task',
    entity_id: 'task-002',
    details: { title: 'Thống kê số liệu tuyển sinh năm học 2026-2027' },
    created_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 'log-003',
    user_id: 'reporter-001',
    action: 'SUBMIT_REPORT',
    entity_type: 'report',
    entity_id: 'report-001',
    details: { task_title: 'Báo cáo tiến độ triển khai chương trình GDPT 2018' },
    created_at: '2026-03-28T14:30:00Z',
  },
];

// All demo profiles combined
export const ALL_DEMO_PROFILES: Profile[] = [DEMO_ADMIN, ...DEMO_REPORTERS];
