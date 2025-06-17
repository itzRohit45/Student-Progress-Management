import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { formatDateOnly, getRatingColor } from "../../utils/formatters";
import { useTheme } from "../../context/ThemeContext";
import "./ContestHistory.css";

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ContestHistory = ({ contests, handle }) => {
  const [timeRange, setTimeRange] = useState("365"); // Default to 365 days

  // Filter contests by selected time range
  const filterContestsByTimeRange = (contests, days) => {
    if (!days) return contests;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return contests.filter((contest) => new Date(contest.date) >= cutoffDate);
  };

  const filteredContests = filterContestsByTimeRange(
    contests,
    parseInt(timeRange)
  );

  // Get the current theme
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Prepare data for the rating chart
  const chartData = {
    labels: filteredContests.map((contest) => contest.contestName),
    datasets: [
      {
        label: "Rating",
        data: filteredContests.map((contest) => contest.newRating),
        fill: false,
        borderColor: isDark ? "#4dabf5" : "#2980b9",
        tension: 0.1,
        pointBackgroundColor: filteredContests.map((contest) =>
          getRatingColor(contest.newRating, isDark)
        ),
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDark ? "#f0f0f0" : "#333333",
          font: {
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: `${handle}'s Codeforces Rating History`,
        color: isDark ? "#f0f0f0" : "#333333",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: isDark
          ? "rgba(40, 40, 40, 0.9)"
          : "rgba(255, 255, 255, 0.9)",
        titleColor: isDark ? "#f0f0f0" : "#333",
        bodyColor: isDark ? "#c0c0c0" : "#666",
        borderColor: isDark ? "#444" : "#ccc",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const contest = filteredContests[context.dataIndex];
            const change =
              contest.ratingChange > 0
                ? `+${contest.ratingChange}`
                : contest.ratingChange;
            return [
              `Rating: ${contest.newRating} (${change})`,
              `Rank: ${contest.rank}`,
            ];
          },
          title: function (context) {
            return filteredContests[context[0].dataIndex].contestName;
          },
          afterLabel: function (context) {
            const contest = filteredContests[context.dataIndex];
            return `Date: ${formatDateOnly(contest.date)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Rating",
          color: isDark ? "#f0f0f0" : "#333333",
          font: {
            weight: "bold",
          },
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "#c0c0c0" : "#666666",
          font: {
            weight: "bold",
          },
        },
      },
      x: {
        display: false, // Hide x-axis labels for better mobile view
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="contest-history">
      <div className="filter-container">
        <div className="filter-group">
          <label>Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 365 days</option>
            <option value="">All time</option>
          </select>
        </div>
      </div>

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} height={300} />
      </div>

      <div className="contests-table-container">
        <h3>Contests</h3>

        {filteredContests.length === 0 ? (
          <p className="no-data-message">
            No contests found in the selected time range.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="contests-table">
              <thead>
                <tr>
                  <th>Contest Name</th>
                  <th>Rank</th>
                  <th>Rating Change</th>
                  <th>New Rating</th>
                  <th>Unsolved</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredContests.map((contest, index) => (
                  <tr key={index}>
                    <td>
                      <a
                        href={`https://codeforces.com/contest/${contest.contestId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contest-link"
                      >
                        {contest.contestName}
                      </a>
                    </td>
                    <td>{contest.rank}</td>
                    <td
                      className={
                        contest.ratingChange > 0
                          ? "positive-change"
                          : "negative-change"
                      }
                    >
                      {contest.ratingChange > 0
                        ? `+${contest.ratingChange}`
                        : contest.ratingChange}
                    </td>
                    <td style={{ color: getRatingColor(contest.newRating) }}>
                      {contest.newRating}
                    </td>
                    <td>{contest.unsolvedProblems}</td>
                    <td>{formatDateOnly(contest.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestHistory;
