import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { UNIT_GROUP_LABELS } from '../../types';
import type { UnitGroup, Profile } from '../../types';
import {
  Building2,
  School,
  Landmark,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Shield,
  ArrowRight
} from 'lucide-react';

const GROUP_ICONS: Record<UnitGroup, typeof Building2> = {
  phong_so: Building2,
  phuong_xa: Landmark,
  truong_thpt: School,
};

interface UnitStat {
  reporter: Profile;
  totalTasks: number;
  submitted: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

interface GroupStat {
  group: UnitGroup;
  label: string;
  totalUnits: number;
  totalReportsExpected: number;
  totalSubmitted: number;
  totalPending: number;
  totalOverdue: number;
  completionRate: number;
  unitsSubmittedCount: number;
  unitsCompletedCount: number;
  unitsWithOverdueCount: number;
  units: UnitStat[];
}

export default function PublicStatisticsPage() {
  const navigate = useNavigate();
  const { tasks, reports, profiles, isLoaded, loadFromSupabase } = useAppStore();
  const [activeGroup, setActiveGroup] = useState<UnitGroup>('phong_so');

  useEffect(() => {
    if (!isLoaded) {
      loadFromSupabase();
    }
  }, [isLoaded, loadFromSupabase]);

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status === 'active'),
    [tasks]
  );

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return 'var(--color-accent-success)';
    if (rate >= 50) return 'var(--color-accent-warning)';
    return 'var(--color-accent-danger)';
  };

  const groupStats = useMemo<GroupStat[]>(() => {
    const now = new Date();
    const groups: UnitGroup[] = ['phong_so', 'phuong_xa', 'truong_thpt'];

    return groups.map((group) => {
      const reporters = profiles.filter(
        (p) => p.role === 'ROLE_REPORTER' && p.unit_group_id === group
      );

      const relevantTasks = activeTasks.filter((t) =>
        t.target_groups.includes(group)
      );

      let totalExpected = 0;
      let totalSubmitted = 0;
      let totalOverdue = 0;

      const unitStats: UnitStat[] = reporters.map((reporter) => {
        let submitted = 0;
        let pending = 0;
        let overdue = 0;

        relevantTasks.forEach((task) => {
          totalExpected++;
          const report = reports.find(
            (r) =>
              r.task_id === task.id &&
              r.reporter_id === reporter.id &&
              r.status === 'submitted'
          );
          if (report) {
            submitted++;
            totalSubmitted++;
          } else if (new Date(task.deadline) < now) {
            overdue++;
            totalOverdue++;
          } else {
            pending++;
          }
        });

        return {
          reporter,
          totalTasks: relevantTasks.length,
          submitted,
          pending,
          overdue,
          completionRate:
            relevantTasks.length > 0
              ? Math.round((submitted / relevantTasks.length) * 100)
              : 0,
        };
      });

      const unitsSubmittedCount = unitStats.filter(u => u.submitted > 0).length;
      const unitsCompletedCount = unitStats.filter(u => u.completionRate === 100 && u.totalTasks > 0).length;
      const unitsWithOverdueCount = unitStats.filter(u => u.overdue > 0).length;

      return {
        group,
        label: UNIT_GROUP_LABELS[group],
        totalUnits: reporters.length,
        totalReportsExpected: totalExpected,
        totalSubmitted,
        totalPending: totalExpected - totalSubmitted - totalOverdue,
        totalOverdue,
        completionRate:
          totalExpected > 0
            ? Math.round((totalSubmitted / totalExpected) * 100)
            : 0,
        unitsSubmittedCount,
        unitsCompletedCount,
        unitsWithOverdueCount,
        units: unitStats,
      };
    });
  }, [activeTasks, reports, profiles]);

  const overallStats = useMemo(() => {
    const totalReports = groupStats.reduce((s, g) => s + g.totalReportsExpected, 0);
    const submittedReports = groupStats.reduce((s, g) => s + g.totalSubmitted, 0);
    
    const totalUnits = groupStats.reduce((s, g) => s + g.totalUnits, 0);
    const unitsSubmitted = groupStats.reduce((s, g) => s + g.unitsSubmittedCount, 0);
    const unitsCompleted = groupStats.reduce((s, g) => s + g.unitsCompletedCount, 0);
    const unitsWithOverdue = groupStats.reduce((s, g) => s + g.unitsWithOverdueCount, 0);

    return {
      totalGroups: 3,
      totalUnits,
      unitsSubmitted,
      unitsCompleted,
      unitsWithOverdue,
      totalReports,
      submittedReports,
      completionRate: totalReports > 0 ? Math.round((submittedReports / totalReports) * 100) : 0,
    };
  }, [groupStats]);

  if (!isLoaded) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p className="text-secondary">Đang tải dữ liệu gốc...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', paddingBottom: 'var(--space-12)' }}>
      {/* Public Header */}
      <header style={{ 
        background: 'var(--color-bg-elevated)', 
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--space-4) 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              boxShadow: 'var(--shadow-glow-primary)'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Báo cáo NQ71</h2>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Sở GD&ĐT TP.HCM</div>
            </div>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/login')}
          >
            Đăng nhập hệ thống <ArrowRight size={14} style={{ marginLeft: 4 }} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
            Tiến độ thực hiện Nghị quyết 71
          </h1>
          <p className="text-secondary" style={{ maxWidth: 600, margin: '0 auto', fontSize: 'var(--font-size-base)', lineHeight: 1.6 }}>
            Bảng theo dõi trực tuyến tình hình báo cáo, nộp kết quả thực hiện nhiệm vụ của các Phòng giáo dục, đặc khu, phường/xã và các trường trung học phổ thông.
          </p>
        </div>

        {/* Overall Summary Stats */}
        <div className="stats-grid" style={{ marginBottom: 'var(--space-8)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="stat-card stat-total animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="stat-icon"><Users size={22} /></div>
            <div className="stat-value">{overallStats.totalUnits}</div>
            <div className="stat-label">Tổng đơn vị tham gia</div>
          </div>
          <div className="stat-card stat-completed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="stat-icon"><CheckCircle2 size={22} /></div>
            <div className="stat-value">{overallStats.unitsSubmitted}</div>
            <div className="stat-label">Đơn vị đã nộp báo cáo</div>
          </div>
          <div className="stat-card stat-pending animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="stat-icon"><Clock size={22} /></div>
            <div className="stat-value">{overallStats.unitsCompleted}</div>
            <div className="stat-label">Đơn vị hoàn tất 100%</div>
          </div>
          <div className="stat-card stat-overdue animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="stat-icon"><AlertTriangle size={22} /></div>
            <div className="stat-value">{overallStats.unitsWithOverdue}</div>
            <div className="stat-label">Đơn vị có báo cáo trễ</div>
          </div>
        </div>

        {/* Group Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          {groupStats.map((gs, idx) => {
            const Icon = GROUP_ICONS[gs.group];
            const isActive = gs.group === activeGroup;
            return (
              <div
                key={gs.group}
                className="card card-clickable animate-fade-in-up"
                style={{
                  animationDelay: `${idx * 100}ms`,
                  cursor: 'pointer',
                  borderColor: isActive ? 'var(--color-accent-primary)' : undefined,
                  boxShadow: isActive ? 'var(--shadow-glow-primary)' : undefined,
                }}
                onClick={() => setActiveGroup(gs.group)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--gradient-primary)' : 'var(--color-bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                    transition: 'all var(--transition-base)',
                  }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold" style={{ fontSize: 'var(--font-size-lg)' }}>{gs.label}</div>
                    <div className="text-sm text-secondary">{gs.totalUnits} đơn vị Cấp 2</div>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="text-sm text-secondary">Mức độ hoàn thành chung</span>
                    <span className="text-sm font-semibold" style={{ color: getStatusColor(gs.completionRate) }}>
                      {gs.completionRate}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${gs.completionRate}%`, background: getStatusColor(gs.completionRate) }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-accent-success)' }}>✓ <b>{gs.unitsSubmittedCount}</b> đã nộp</span>
                  <span style={{ color: 'var(--color-accent-warning)' }}>★ <b>{gs.unitsCompletedCount}</b> xong 100%</span>
                  <span style={{ color: 'var(--color-accent-danger)' }}>⚠ <b>{gs.unitsWithOverdueCount}</b> trễ</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Table for Public (Aggregate only) */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="card-header">
            <h3 className="card-title">
              📈 Biểu đồ tổng hợp các phân cấp quản lý
            </h3>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khối quản lý</th>
                  <th style={{ textAlign: 'center' }}>Số đơn vị</th>
                  <th style={{ textAlign: 'center' }}>Đã thực hiện</th>
                  <th style={{ textAlign: 'center' }}>Hoàn tất 100%</th>
                  <th>Tỷ lệ hoàn thành nhiệm vụ</th>
                </tr>
              </thead>
              <tbody>
                {groupStats.map((gs) => (
                  <tr key={gs.group}>
                    <td className="font-semibold">{gs.label}</td>
                    <td style={{ textAlign: 'center' }}>{gs.totalUnits}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">{gs.unitsSubmittedCount}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-primary">{gs.unitsCompletedCount}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 140 }}>
                        <div className="progress-bar" style={{ flex: 1, height: 8 }}>
                          <div
                            className="progress-fill"
                            style={{ width: `${gs.completionRate}%`, background: getStatusColor(gs.completionRate) }}
                          />
                        </div>
                        <span
                          className="font-bold"
                          style={{ color: getStatusColor(gs.completionRate), minWidth: 40, textAlign: 'right' }}
                        >
                          {gs.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
