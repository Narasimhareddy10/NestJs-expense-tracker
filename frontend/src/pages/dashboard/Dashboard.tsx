import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardStats, SpendingTrend } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import './Dashboard.css';

const CHART_COLORS = [
  '#8b5cf6', // purple
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
];

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<SpendingTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, trendsData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTrends(),
      ]);
      setStats(statsData);
      setTrends(trendsData.months);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return (
      <div className="dashboard-loading">Failed to load dashboard data</div>
    );
  }

  const { currentMonth, categoryBreakdown, topExpenses } = stats;

  const pieData = categoryBreakdown.map((cat, index) => ({
    name: cat.categoryName,
    value: parseFloat(cat.totalSpent),
    color: CHART_COLORS[index % CHART_COLORS.length],
    icon: cat.categoryIcon,
  }));

  const utilizationPercentage = parseFloat(
    currentMonth.budgetUtilization.toString(),
  );

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">₹</div>
            <div className="stat-trend down">
              <span>↘</span> {utilizationPercentage.toFixed(1)}%
            </div>
          </div>
          <div className="stat-value">
            {formatCurrency(currentMonth.totalSpent)}
          </div>
          <div className="stat-label">Total Spent</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">◎</div>
          </div>
          <div className="stat-value">
            {formatCurrency(currentMonth.totalBudget)}
          </div>
          <div className="stat-label">Total Budget</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">☰</div>
          </div>
          <div className="stat-value">{currentMonth.expenseCount}</div>
          <div className="stat-label">Expense Count</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">↗</div>
          </div>
          <div className="stat-value">
            {formatCurrency(currentMonth.averageExpense)}
          </div>
          <div className="stat-label">Avg. Expense</div>
        </div>
      </div>

      {/* Budget Utilization */}
      <div className="budget-utilization">
        <div className="budget-utilization-header">
          <div>
            <div className="budget-utilization-title">Budget Utilization</div>
            <div className="budget-utilization-subtitle">
              Spent: {formatCurrency(currentMonth.totalSpent)}
            </div>
          </div>
          <div className="budget-utilization-info">
            <span>{utilizationPercentage.toFixed(1)}%</span> Budget:{' '}
            {formatCurrency(currentMonth.totalBudget)}
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Spending Trends */}
        <div className="chart-card">
          <div className="chart-title">Spending Trends (6 months)</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value as number),
                    'Spent',
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="totalSpent"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="chart-card">
          <div className="chart-title">Category Breakdown</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value as number),
                    'Spent',
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="category-legend">
            {pieData.map((item, index) => (
              <div key={index} className="category-legend-item">
                <div
                  className="category-legend-dot"
                  style={{ backgroundColor: item.color }}
                />
                <span>
                  {item.icon} {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Expenses */}
      <div className="top-expenses">
        <div className="top-expenses-title">Top Expenses</div>
        <div className="top-expenses-list">
          {topExpenses.map((expense, index) => (
            <div key={expense.id} className="top-expense-item">
              <div className="top-expense-left">
                <div className="top-expense-rank">{index + 1}</div>
                <div className="top-expense-info">
                  <span className="top-expense-description">
                    {expense.description}
                  </span>
                  <div className="top-expense-meta">
                    <span className="top-expense-category-icon">
                      {getCategoryIcon(expense.category?.icon)}
                    </span>
                    <span>{expense.category?.name}</span>
                    <span>•</span>
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </div>
              </div>
              <div className="top-expense-amount">
                {formatCurrency(expense.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
