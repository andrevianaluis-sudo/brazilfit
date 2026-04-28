import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar } from 'lucide-react';

const ANALYTICS_DATA = {
  revenue: {
    thisMonth: 4250,
    lastMonth: 3800,
    yearToDate: 48000,
    projectedAnnual: 51000,
  },
  retention: {
    percentage: 87,
    avgSessionsPerMonth: 8,
    clientLifetimeValue: 1250,
  },
  attendance: {
    rate: 92,
    peakHour: '18:00',
    busiestDay: 'Thursday',
  },
  classes: [
    { name: 'Morning Strength', attendance: 14, revenue: 420 },
    { name: 'Pilates Flow', attendance: 12, revenue: 360 },
    { name: 'Dance Cardio', attendance: 16, revenue: 480 },
    { name: 'Evening Strength', attendance: 18, revenue: 540 },
  ],
  growth: {
    newClientsThisMonth: 4,
    totalClients: 24,
    proSubscribers: 8,
    monthlySubscriptionRevenue: 960,
  },
};

function MetricCard({ label, value, icon: Icon, trend, color = 'text-brazil-green' }) {
  return (
    <div className="bg-dark-grey-100 rounded-[12px] p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
          <p className={`text-3xl font-black ${color}`}>{value}</p>
        </div>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-xs">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={trend > 0 ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(trend)}% vs last period
          </span>
        </div>
      )}
    </div>
  );
}

export default function PTAnalytics() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="px-4 py-4 pb-24 animate-fade-in space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { label: 'THIS WEEK', value: 'week' },
          { label: 'THIS MONTH', value: 'month' },
          { label: 'THIS YEAR', value: 'year' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setTimeRange(option.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all ${
              timeRange === option.value
                ? 'bg-brazil-green text-white'
                : 'bg-dark-grey-100 text-gray-400 hover:bg-dark-grey-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* REVENUE Section */}
      <div>
        <h2 className="text-white text-sm font-bold uppercase tracking-widest mb-4">Revenue</h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="This Month"
            value={`£${ANALYTICS_DATA.revenue.thisMonth}`}
            icon={DollarSign}
            trend={11.8}
            color="text-green-500"
          />
          <MetricCard
            label="Last Month"
            value={`£${ANALYTICS_DATA.revenue.lastMonth}`}
            icon={DollarSign}
            color="text-gray-400"
          />
          <MetricCard
            label="Year to Date"
            value={`£${ANALYTICS_DATA.revenue.yearToDate}`}
            icon={DollarSign}
            color="text-brazil-green"
          />
          <MetricCard
            label="Projected Annual"
            value={`£${ANALYTICS_DATA.revenue.projectedAnnual}`}
            icon={DollarSign}
            color="text-orange-400"
          />
        </div>
      </div>

      {/* CLIENT RETENTION Section */}
      <div>
        <h2 className="text-white text-sm font-bold uppercase tracking-widest mb-4">Client Retention</h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Retention Rate"
            value={`${ANALYTICS_DATA.retention.percentage}%`}
            icon={Users}
            trend={5}
            color="text-brazil-green"
          />
          <MetricCard
            label="Avg Sessions/Month"
            value={ANALYTICS_DATA.retention.avgSessionsPerMonth}
            icon={Calendar}
            color="text-blue-400"
          />
          <MetricCard
            label="Client Lifetime Value"
            value={`£${ANALYTICS_DATA.retention.clientLifetimeValue}`}
            icon={DollarSign}
            color="text-green-500"
          />
        </div>
      </div>

      {/* ATTENDANCE Section */}
      <div>
        <h2 className="text-white text-sm font-bold uppercase tracking-widest mb-4">Attendance</h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Attendance Rate"
            value={`${ANALYTICS_DATA.attendance.rate}%`}
            icon={Users}
            trend={2}
            color="text-green-500"
          />
          <MetricCard
            label="Peak Hour"
            value={ANALYTICS_DATA.attendance.peakHour}
            icon={Calendar}
            color="text-orange-400"
          />
          <MetricCard
            label="Busiest Day"
            value={ANALYTICS_DATA.attendance.busiestDay}
            icon={Calendar}
            color="text-blue-400"
          />
        </div>
      </div>

      {/* CLASS PERFORMANCE Section */}
      <div>
        <h2 className="text-white text-sm font-bold uppercase tracking-widest mb-4">Class Performance</h2>
        <div className="space-y-3">
          {ANALYTICS_DATA.classes.map((cls, i) => (
            <div key={i} className="bg-dark-grey-100 rounded-[12px] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-bold text-sm">{cls.name}</p>
                <p className="text-brazil-green font-bold">£{cls.revenue}</p>
              </div>
              <div className="w-full bg-dark-grey-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brazil-green"
                  style={{ width: `${(cls.attendance / 20) * 100}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">{cls.attendance} avg attendance</p>
            </div>
          ))}
        </div>
      </div>

      {/* GROWTH Section */}
      <div>
        <h2 className="text-white text-sm font-bold uppercase tracking-widest mb-4">Growth</h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="New Clients"
            value={ANALYTICS_DATA.growth.newClientsThisMonth}
            icon={Users}
            trend={100}
            color="text-green-500"
          />
          <MetricCard
            label="Total Clients"
            value={ANALYTICS_DATA.growth.totalClients}
            icon={Users}
            color="text-brazil-green"
          />
          <MetricCard
            label="Pro Subscribers"
            value={ANALYTICS_DATA.growth.proSubscribers}
            icon={DollarSign}
            color="text-orange-400"
          />
          <MetricCard
            label="Monthly Subscriptions"
            value={`£${ANALYTICS_DATA.growth.monthlySubscriptionRevenue}`}
            icon={DollarSign}
            trend={25}
            color="text-green-500"
          />
        </div>
      </div>
    </div>
  );
}
