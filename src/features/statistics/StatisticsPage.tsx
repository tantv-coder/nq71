import { useMemo, useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  FileText,
  Users,
} from 'lucide-react';

const GROUP_ICONS: Record<UnitGroup, typeof Building2> = {
  phong_so: Building2,
  phuong_xa: Landmark,
  truong_thpt: School,
};

const GROUP_EMOJIS: Record<UnitGroup, string> = {
  phong_so: '🏢',
  phuong_xa: '🏛️',
  truong_thpt: '🏫',
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
  units: UnitStat[];
}

export default function StatisticsPage() {
  const { tasks, reports, profiles } = useAppStore();
  const [activeGroup, setActiveGroup] = useState<UnitGroup>('phong_so');
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status === 'active'),
    [tasks]
  );

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

      // Sort by completion rate descending
      unitStats.sort((a, b) => b.completionRate - a.completionRate);

      const totalPending = totalExpected - totalSubmitted - totalOverdue;

      return {
        group,
        label: UNIT_GROUP_LABELS[group],
        totalUnits: reporters.length,
        totalReportsExpected: totalExpected,
        totalSubmitted,
        totalPending: totalPending > 0 ? totalPending : 0,
        totalOverdue,
        completionRate:
          totalExpected > 0
            ? Math.round((totalSubmitted / totalExpected) * 100)
            : 0,
        units: unitStats,
      };
    });
  }, [activeTasks, reports, profiles]);

  const overallStats = useMemo(() => {
    const total = groupStats.reduce((s, g) => s + g.totalReportsExpected, 0);
    const submitted = groupStats.reduce((s, g) => s + g.totalSubmitted, 0);
    const overdue = groupStats.reduce((s, g) => s + g.totalOverdue, 0);
    const pending = groupStats.reduce((s, g) => s + g.totalPending, 0);
    return {
      totalGroups: 3,
      totalUnits: groupStats.reduce((s, g) => s + g.totalUnits, 0),
      totalTasks: activeTasks.length,
      total,
      submitted,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((submitted / total) * 100) : 0,
    };
  }, [groupStats, activeTasks]);

  const activeGroupStat = groupStats.find((g) => g.group === activeGroup)!;

  const toggleUnit = (id: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTasksForReporter = (reporter: Profile) => {
    const now = new Date();
    return activeTasks
      .filter(
        (t) =>
          reporter.unit_group_id &&
          t.target_groups.includes(reporter.unit_group_id)
      )
      .map((task) => {
        const report = reports.find(
          (r) =>
            r.task_id === task.id &&
            r.reporter_id === reporter.id
        );
        const isSubmitted = report?.status === 'submitted';
        const isOverdue = !isSubmitted && new Date(task.deadline) < now;
        return { task, report, isSubmitted, isOverdue };
      });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return 'var(--color-accent-success)';
    if (rate >= 50) return 'var(--color-accent-warning)';
    return 'var(--color-accent-danger)';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>📊 Thống kê chi tiết</h1>
          <p>
            Thống kê tình hình nộp báo cáo theo từng nhóm đơn vị
          </p>
        </div>
      </div>

      {/* Overall Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div
          className="stat-card stat-total animate-fade-in-up"
          style={{ animationDelay: '0ms' }}
        >
          <div className="stat-icon">
            <Users size={22} />
          </div>
          <div className="stat-value">{overallStats.totalUnits}</div>
          <div className="stat-label">Tổng đơn vị</div>
        </div>
        <div
          className="stat-card stat-completed animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="stat-icon">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-value">{overallStats.submitted}</div>
          <div className="stat-label">Báo cáo đã nộp</div>
        </div>
        <div
          className="stat-card stat-pending animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <div className="stat-icon">
            <Clock size={22} />
          </div>
          <div className="stat-value">{overallStats.pending}</div>
          <div className="stat-label">Chờ nộp</div>
        </div>
        <div
          className="stat-card stat-overdue animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="stat-icon">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-value">{overallStats.overdue}</div>
          <div className="stat-label">Quá hạn</div>
        </div>
      </div>

      {/* Group Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
        }}
      >
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
                borderColor: isActive
                  ? 'var(--color-accent-primary)'
                  : undefined,
                boxShadow: isActive
                  ? 'var(--shadow-glow-primary)'
                  : undefined,
              }}
              onClick={() => setActiveGroup(gs.group)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--radius-md)',
                    background: isActive
                      ? 'var(--gradient-primary)'
                      : 'var(--color-bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive
                      ? 'white'
                      : 'var(--color-text-secondary)',
                    transition: 'all var(--transition-base)',
                  }}
                >
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="font-semibold" style={{ fontSize: 'var(--font-size-base)' }}>
                    {gs.label}
                  </div>
                  <div className="text-xs text-secondary">
                    {gs.totalUnits} đơn vị
                  </div>
                </div>
              </div>

              {/* Mini progress */}
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span className="text-xs text-secondary">Tỷ lệ hoàn thành</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: getStatusColor(gs.completionRate) }}
                  >
                    {gs.completionRate}%
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${gs.completionRate}%`,
                      background: getStatusColor(gs.completionRate),
                    }}
                  />
                </div>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                <span style={{ color: 'var(--color-accent-success)' }}>
                  ✓ {gs.totalSubmitted} nộp
                </span>
                <span style={{ color: 'var(--color-accent-warning)' }}>
                  ◷ {gs.totalPending} chờ
                </span>
                <span style={{ color: 'var(--color-accent-danger)' }}>
                  ⚠ {gs.totalOverdue} quá hạn
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed View for Active Group */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title">
            {GROUP_EMOJIS[activeGroup]} Chi tiết:{' '}
            {UNIT_GROUP_LABELS[activeGroup]}
          </h3>
          <span className="badge badge-primary">
            {activeGroupStat.totalUnits} đơn vị
          </span>
        </div>

        {/* Group Summary Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              className="font-bold"
              style={{ fontSize: 'var(--font-size-xl)' }}
            >
              {activeGroupStat.totalReportsExpected}
            </div>
            <div className="text-xs text-secondary">Tổng BC cần nộp</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              className="font-bold"
              style={{
                fontSize: 'var(--font-size-xl)',
                color: 'var(--color-accent-success)',
              }}
            >
              {activeGroupStat.totalSubmitted}
            </div>
            <div className="text-xs text-secondary">Đã nộp</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              className="font-bold"
              style={{
                fontSize: 'var(--font-size-xl)',
                color: 'var(--color-accent-warning)',
              }}
            >
              {activeGroupStat.totalPending}
            </div>
            <div className="text-xs text-secondary">Chờ nộp</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              className="font-bold"
              style={{
                fontSize: 'var(--font-size-xl)',
                color: 'var(--color-accent-danger)',
              }}
            >
              {activeGroupStat.totalOverdue}
            </div>
            <div className="text-xs text-secondary">Quá hạn</div>
          </div>
        </div>

        {/* Per-Unit Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Đơn vị</th>
                <th style={{ textAlign: 'center' }}>Nhiệm vụ</th>
                <th style={{ textAlign: 'center' }}>Đã nộp</th>
                <th style={{ textAlign: 'center' }}>Chờ nộp</th>
                <th style={{ textAlign: 'center' }}>Quá hạn</th>
                <th>Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {activeGroupStat.units.map((unit) => {
                const isExpanded = expandedUnits.has(unit.reporter.id);
                const taskDetails = isExpanded
                  ? getTasksForReporter(unit.reporter)
                  : [];
                return (
                  <>
                    <tr
                      key={unit.reporter.id}
                      onClick={() => toggleUnit(unit.reporter.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        {isExpanded ? (
                          <ChevronDown
                            size={16}
                            style={{
                              color: 'var(--color-text-tertiary)',
                            }}
                          />
                        ) : (
                          <ChevronRight
                            size={16}
                            style={{
                              color: 'var(--color-text-tertiary)',
                            }}
                          />
                        )}
                      </td>
                      <td>
                        <div className="font-medium">
                          {unit.reporter.unit_name ||
                            unit.reporter.full_name}
                        </div>
                        <div
                          className="text-xs text-secondary"
                          style={{ marginTop: 2 }}
                        >
                          {unit.reporter.email}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-neutral">
                          {unit.totalTasks}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-success">
                          {unit.submitted}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-warning">
                          {unit.pending}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {unit.overdue > 0 ? (
                          <span className="badge badge-danger">
                            {unit.overdue}
                          </span>
                        ) : (
                          <span className="badge badge-neutral">0</span>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            minWidth: 120,
                          }}
                        >
                          <div
                            className="progress-bar"
                            style={{ flex: 1, height: 6 }}
                          >
                            <div
                              className="progress-fill"
                              style={{
                                width: `${unit.completionRate}%`,
                                background: getStatusColor(
                                  unit.completionRate
                                ),
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-semibold"
                            style={{
                              color: getStatusColor(unit.completionRate),
                              minWidth: 36,
                              textAlign: 'right',
                            }}
                          >
                            {unit.completionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded: per-task detail */}
                    {isExpanded &&
                      taskDetails.map(
                        ({ task, report, isSubmitted, isOverdue }) => (
                          <tr
                            key={`${unit.reporter.id}-${task.id}`}
                            style={{
                              background: 'var(--color-bg-tertiary)',
                            }}
                          >
                            <td></td>
                            <td
                              colSpan={4}
                              style={{
                                paddingLeft: 'var(--space-6)',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--space-2)',
                                }}
                              >
                                <FileText
                                  size={14}
                                  style={{
                                    color:
                                      'var(--color-text-tertiary)',
                                    flexShrink: 0,
                                  }}
                                />
                                <span className="text-sm">
                                  {task.title}
                                </span>
                              </div>
                              <div
                                className="text-xs text-secondary"
                                style={{
                                  marginTop: 2,
                                  paddingLeft: 22,
                                }}
                              >
                                Hạn: {formatDate(task.deadline)}
                                {isSubmitted && report?.submitted_at && (
                                  <span>
                                    {' '}
                                    • Nộp:{' '}
                                    {formatDate(report.submitted_at)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              colSpan={2}
                              style={{ textAlign: 'center' }}
                            >
                              {isSubmitted ? (
                                <span
                                  className="badge badge-success"
                                  style={{ gap: 4 }}
                                >
                                  <CheckCircle2 size={12} /> Đã nộp
                                </span>
                              ) : isOverdue ? (
                                <span
                                  className="badge badge-danger"
                                  style={{ gap: 4 }}
                                >
                                  <AlertTriangle size={12} /> Quá hạn
                                </span>
                              ) : (
                                <span
                                  className="badge badge-warning"
                                  style={{ gap: 4 }}
                                >
                                  <Clock size={12} /> Chờ nộp
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                  </>
                );
              })}

              {activeGroupStat.units.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div
                      className="empty-state"
                      style={{ padding: 'var(--space-8)' }}
                    >
                      <h3>Chưa có đơn vị nào</h3>
                      <p>
                        Không tìm thấy đơn vị thuộc nhóm này.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
