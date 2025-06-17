import React, { useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
} from "chart.js";
import { formatDateOnly, getRatingColor } from "../../utils/formatters";
import { useTheme } from "../../context/ThemeContext";
import "./ProblemSolvingData.css";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip);

const ProblemSolvingData = ({ data, handle }) => {
  const [timeRange, setTimeRange] = useState("30"); // Default to 30 days

  // Handle time range change
  const handleTimeRangeChange = async (newRange) => {
    setTimeRange(newRange);
  };

  // Get the current theme
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Prepare data for the rating distribution chart
  const prepareRatingDistributionData = () => {
    if (!data.solvedByRating) return { labels: [], datasets: [] };

    const ratings = Object.keys(data.solvedByRating).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
    const counts = ratings.map((rating) => data.solvedByRating[rating]);

    return {
      labels: ratings.map((rating) => `${rating}`),
      datasets: [
        {
          label: "Problems Solved",
          data: counts,
          backgroundColor: ratings.map((rating) =>
            getRatingColor(parseInt(rating), isDark)
          ),
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(0, 0, 0, 0.2)",
        },
      ],
    };
  };

  // Prepare data for the submission heatmap
  const prepareHeatmapData = () => {
    if (!data.heatmapData) return [];

    return Object.entries(data.heatmapData).map(([date, count]) => ({
      date,
      count,
    }));
  };

  // Calculate the date range for the heatmap
  const getHeatmapStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 120); // Show last 4 months in the heatmap
    return date;
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Problems Solved by Rating",
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Problems",
          color: isDark ? "#f0f0f0" : "#333333",
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
        title: {
          display: true,
          text: "Problem Rating",
          color: isDark ? "#f0f0f0" : "#333333",
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
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Problems",
        },
      },
      x: {
        title: {
          display: true,
          text: "Problem Rating",
        },
      },
    },
  };

  return (
    <div className="problem-solving-data">
      <div className="filter-container">
        <div className="filter-group">
          <label>Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="filter-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Problems Solved</div>
          <div className="stat-value">{data.totalSolved || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average Problems per Day</div>
          <div className="stat-value">
            {data.averageProblemsPerDay || "0.00"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average Problem Rating</div>
          <div
            className="stat-value"
            style={{ color: getRatingColor(data.averageRating, isDark) }}
          >
            {data.averageRating || 0}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Most Difficult Problem</div>
          <div className="stat-value">
            {data.mostDifficultProblem?.name ? (
              <a
                href={`https://codeforces.com/contest/${data.mostDifficultProblem.contestId}/problem/${data.mostDifficultProblem.problemIndex}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: getRatingColor(
                    data.mostDifficultProblem.rating,
                    isDark
                  ),
                }}
              >
                {data.mostDifficultProblem.name} (
                {data.mostDifficultProblem.rating})
              </a>
            ) : (
              "None"
            )}
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Rating Distribution</h3>
        <div className="chart-container">
          <Bar data={prepareRatingDistributionData()} options={chartOptions} />
        </div>
      </div>

      <div className="heatmap-section">
        <h3>Submission Activity</h3>
        <div className="heatmap-container">
          <CalendarHeatmap
            startDate={getHeatmapStartDate()}
            endDate={new Date()}
            values={prepareHeatmapData()}
            classForValue={(value) => {
              if (!value || !value.count) {
                return "color-empty";
              }
              if (value.count < 2)
                return isDark ? "dark-color-scale-1" : "color-scale-1";
              if (value.count < 4)
                return isDark ? "dark-color-scale-2" : "color-scale-2";
              if (value.count < 6)
                return isDark ? "dark-color-scale-3" : "color-scale-3";
              return isDark ? "dark-color-scale-4" : "color-scale-4";
            }}
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) return null;
              return {
                "data-tooltip-id": "heatmap-tooltip",
                "data-tooltip-content": `${formatDateOnly(value.date)}: ${
                  value.count || 0
                } submissions`,
              };
            }}
          />
          <Tooltip id="heatmap-tooltip" />
        </div>

        <div className="heatmap-legend">
          <span>Less</span>
          <ul className="heatmap-legend-scale">
            <li className="color-empty"></li>
            <li className="color-scale-1"></li>
            <li className="color-scale-2"></li>
            <li className="color-scale-3"></li>
            <li className="color-scale-4"></li>
          </ul>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolvingData;
