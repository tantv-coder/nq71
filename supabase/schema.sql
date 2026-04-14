-- ============================================
-- HỆ THỐNG THEO DÕI BÁO CÁO NQ71
-- Database Schema for Supabase
-- ============================================

-- 1. Bảng profiles (người dùng)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ROLE_REPORTER' CHECK (role IN ('ROLE_ADMIN', 'ROLE_REPORTER')),
  unit_group_id TEXT CHECK (unit_group_id IN ('phong_so', 'phuong_xa', 'truong_thpt')),
  unit_name TEXT,
  password TEXT DEFAULT 'Sgd@1234',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bảng tasks (nhiệm vụ)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description JSONB,
  description_html TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  target_groups TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bảng reports (báo cáo)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content JSONB,
  content_html TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(task_id, reporter_id)
);

-- 4. Bảng audit_logs (nhật ký)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_unit_group ON profiles(unit_group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_reports_task_id ON reports(task_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Disable RLS (hệ thống nội bộ)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow full access via anon key (internal system)
CREATE POLICY "Allow all for anon" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Admin
INSERT INTO profiles (email, full_name, role, unit_group_id, unit_name)
VALUES ('trantan598497@gmail.com', 'Trần Văn Tân (Admin)', 'ROLE_ADMIN', NULL, 'Sở GD&ĐT TP.HCM')
ON CONFLICT (email) DO NOTHING;

-- Phòng thuộc Sở
INSERT INTO profiles (email, full_name, role, unit_group_id, unit_name)
VALUES 
  ('phongkhtc@sgddt.edu.vn', 'Phòng KH-TC', 'ROLE_REPORTER', 'phong_so', 'Phòng Kế hoạch - Tài chính'),
  ('phonggdtx@sgddt.edu.vn', 'Phòng GDTX', 'ROLE_REPORTER', 'phong_so', 'Phòng Giáo dục Thường xuyên')
ON CONFLICT (email) DO NOTHING;

-- Phòng VH-XH phường xã
INSERT INTO profiles (email, full_name, role, unit_group_id, unit_name)
VALUES 
  ('gddt.quan1@hcm.edu.vn', 'Phòng GD&ĐT Quận 1', 'ROLE_REPORTER', 'phuong_xa', 'Phòng GD&ĐT Quận 1'),
  ('gddt.quan3@hcm.edu.vn', 'Phòng GD&ĐT Quận 3', 'ROLE_REPORTER', 'phuong_xa', 'Phòng GD&ĐT Quận 3')
ON CONFLICT (email) DO NOTHING;

-- Trường THPT
INSERT INTO profiles (email, full_name, role, unit_group_id, unit_name)
VALUES 
  ('thpt.lequydon@sgddt.edu.vn', 'THPT Lê Quý Đôn', 'ROLE_REPORTER', 'truong_thpt', 'Trường THPT Lê Quý Đôn'),
  ('thpt.nguyentrai@sgddt.edu.vn', 'THPT Nguyễn Trãi', 'ROLE_REPORTER', 'truong_thpt', 'Trường THPT Nguyễn Trãi')
ON CONFLICT (email) DO NOTHING;
