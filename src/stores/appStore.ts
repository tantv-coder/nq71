import { create } from 'zustand';
import type { Task, Report, AuditLog, Profile, UnitGroup } from '../types';
import {
  DEMO_TASKS,
  DEMO_REPORTS,
  DEMO_AUDIT_LOGS,
  ALL_DEMO_PROFILES,
} from '../lib/demoData';
import { IS_DEMO_MODE } from '../lib/supabase';
import * as supabaseService from '../lib/supabaseService';

interface AppState {
  tasks: Task[];
  reports: Report[];
  auditLogs: AuditLog[];
  profiles: Profile[];
  isLoaded: boolean;

  // Load all data
  loadFromSupabase: () => Promise<void>;

  // Task actions
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  getTasksForGroup: (group: UnitGroup) => Task[];

  // Report actions
  addReport: (report: Report) => Promise<void>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<void>;
  getReportByTaskAndReporter: (taskId: string, reporterId: string) => Report | undefined;
  getReportsByTask: (taskId: string) => Report[];
  getReportsByReporter: (reporterId: string) => Report[];

  // Audit log actions
  addAuditLog: (log: AuditLog) => Promise<void>;

  // Profile actions
  getProfileById: (id: string) => Profile | undefined;
  getProfilesByGroup: (group: UnitGroup) => Profile[];
  addProfile: (profile: Profile) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: [...DEMO_TASKS],
  reports: [...DEMO_REPORTS],
  auditLogs: [...DEMO_AUDIT_LOGS],
  profiles: [...ALL_DEMO_PROFILES],
  isLoaded: false,

  loadFromSupabase: async () => {
    if (IS_DEMO_MODE) {
      set({ isLoaded: true });
      return;
    }
    
    try {
      const [profiles, tasks, reports, auditLogs] = await Promise.all([
        supabaseService.getProfiles(),
        supabaseService.getTasks(),
        supabaseService.getReports(),
        supabaseService.getAuditLogs(),
      ]);

      set({
        profiles,
        tasks,
        reports,
        auditLogs,
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load data from Supabase:', error);
      // Fallback to demo mode if load fails, maybe notify user
      set({ isLoaded: true }); 
    }
  },

  // Tasks
  addTask: async (task) => {
    if (IS_DEMO_MODE) {
      set((s) => ({ tasks: [task, ...s.tasks] }));
      return;
    }
    try {
      const { id, created_at, updated_at, creator, report_stats, ...rest } = task;
      const newTask = await supabaseService.createTask(rest);
      set((s) => ({ tasks: [{ ...newTask, creator: s.profiles.find(p => p.id === newTask.created_by) }, ...s.tasks] }));
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },
  
  updateTask: async (id, updates) => {
    if (IS_DEMO_MODE) {
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t)),
      }));
      return;
    }
    try {
      const updatedTask = await supabaseService.updateTask(id, updates);
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)),
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (id) => {
    if (IS_DEMO_MODE) {
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: 'deleted' as const } : t)),
      }));
      return;
    }
    try {
      await supabaseService.updateTask(id, { status: 'deleted' });
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: 'deleted' as const } : t)),
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  
  getTaskById: (id) => get().tasks.find((t) => t.id === id),
  getTasksForGroup: (group) =>
    get().tasks.filter((t) => t.status === 'active' && t.target_groups.includes(group)),

  // Reports
  addReport: async (report) => {
    if (IS_DEMO_MODE) {
      set((s) => ({ reports: [report, ...s.reports] }));
      return;
    }
    try {
      const { id, created_at, updated_at, reporter, task, ...rest } = report;
      const newReport = await supabaseService.createReport(rest);
      set((s) => ({
        reports: [
          { ...newReport, reporter: s.profiles.find(p => p.id === newReport.reporter_id) }, 
          ...s.reports
        ]
      }));
    } catch (error) {
      console.error('Error adding report:', error);
      throw error;
    }
  },

  updateReport: async (id, updates) => {
    if (IS_DEMO_MODE) {
      set((s) => ({
        reports: s.reports.map((r) => (r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r)),
      }));
      return;
    }
    try {
      const updatedReport = await supabaseService.updateReport(id, updates);
      set((s) => ({
        reports: s.reports.map((r) => (r.id === id ? { ...r, ...updatedReport } : r)),
      }));
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },

  getReportByTaskAndReporter: (taskId, reporterId) =>
    get().reports.find((r) => r.task_id === taskId && r.reporter_id === reporterId),
  getReportsByTask: (taskId) => get().reports.filter((r) => r.task_id === taskId),
  getReportsByReporter: (reporterId) => get().reports.filter((r) => r.reporter_id === reporterId),

  // Audit Logs
  addAuditLog: async (log) => {
    if (IS_DEMO_MODE) {
      set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
      return;
    }
    try {
      const { id, created_at, user, ...rest } = log;
      const newLog = await supabaseService.createAuditLog(rest);
      set((s) => ({
        auditLogs: [
          { ...newLog, user: s.profiles.find(p => p.id === newLog.user_id) }, 
          ...s.auditLogs
        ]
      }));
    } catch (error) {
      console.error('Error adding audit log:', error);
      throw error;
    }
  },

  // Profiles
  getProfileById: (id) => get().profiles.find((p) => p.id === id),
  getProfilesByGroup: (group) => get().profiles.filter((p) => p.unit_group_id === group),
  
  addProfile: async (profile) => {
    if (IS_DEMO_MODE) {
      set((s) => ({ profiles: [...s.profiles, profile] }));
      return;
    }
    try {
      const { id, created_at, updated_at, ...rest } = profile;
      const newProfile = await supabaseService.createProfile(rest);
      set((s) => ({ profiles: [...s.profiles, newProfile] }));
    } catch (error) {
      console.error('Error adding profile:', error);
      throw error;
    }
  },

  updateProfile: async (id, updates) => {
    if (IS_DEMO_MODE) {
      set((s) => ({
        profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
      return;
    }
    try {
      const updatedProfile = await supabaseService.updateProfile(id, updates);
      set((s) => ({
        profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...updatedProfile } : p)),
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  deleteProfile: async (id) => {
    if (IS_DEMO_MODE) {
      set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) }));
      return;
    }
    try {
      await supabaseService.deleteProfile(id);
      set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) }));
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  },

  resetUserPassword: async (email) => {
    if (IS_DEMO_MODE) {
      console.log(`[DEMO] Sending reset password email to ${email}`);
      return;
    }
    try {
      await supabaseService.resetPassword(email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },
}));
