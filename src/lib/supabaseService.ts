import { supabase } from './supabase';
import type { Profile, Task, Report, AuditLog } from '../types';

// ============================================
// PROFILES
// ============================================
export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

export async function createProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function deleteProfile(id: string) {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// TASKS
// ============================================
export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      creator:profiles(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Task[];
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'creator' | 'report_stats'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

// ============================================
// REPORTS
// ============================================
export async function getReports() {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles(*),
      task:tasks(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Report[];
}

export async function createReport(report: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'reporter' | 'task'>) {
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single();
  if (error) throw error;
  return data as Report;
}

export async function updateReport(id: string, updates: Partial<Report>) {
  const { data, error } = await supabase
    .from('reports')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Report;
}

// ============================================
// AUDIT LOGS
// ============================================
export async function getAuditLogs() {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user:profiles(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as AuditLog[];
}

export async function createAuditLog(log: Omit<AuditLog, 'id' | 'created_at' | 'user'>) {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert(log)
    .select()
    .single();
  if (error) throw error;
  return data as AuditLog;
}

// ============================================
// AUTH (Email Lookup)
// ============================================
export async function loginByEmail(email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data as Profile;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function updateUserPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
