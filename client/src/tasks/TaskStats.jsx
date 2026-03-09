import { useState, useEffect, useMemo } from "react";
import { fetchUserTasks } from "./taskAPIService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PropTypes from "prop-types";
import "./TaskStats.css";

const COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#34495e"];

const TaskStats = ({ refreshList }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchUserTasks().then((result) => {
      if (!result.error && result.tasks) {
        setTasks(result.tasks);
      }
    });
  }, [refreshList]);

  const dailyData = useMemo(() => {
    const dayMap = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      dayMap[key] = 0;
    }

    tasks.forEach((task) => {
      const d = new Date(task.completedAt);
      const key = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      if (key in dayMap) dayMap[key]++;
    });

    return Object.entries(dayMap).map(([day, count]) => ({ day, count }));
  }, [tasks]);

  const categoryData = useMemo(() => {
    const catMap = {};
    tasks.forEach((task) => {
      catMap[task.category] = (catMap[task.category] || 0) + 1;
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="stats-empty">
        <p>Complete some Pomodoro sessions to see your productivity stats.</p>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-number">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{categoryData.length}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {dailyData[dailyData.length - 1]?.count || 0}
          </div>
          <div className="stat-label">Today</div>
        </div>
      </div>

      <div className="stats-charts">
        <div className="chart-section">
          <h4 className="chart-title">Last 7 Days</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
                name="Tasks"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h4 className="chart-title">By Category</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

TaskStats.propTypes = {
  refreshList: PropTypes.string,
};

export default TaskStats;
