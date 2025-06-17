// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format date without time
export const formatDateOnly = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Calculate time elapsed since a date
export const timeAgo = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

// Get color for rating
export const getRatingColor = (rating, isDark = false) => {
  if (!rating) return isDark ? "#bbbbbb" : "#999999";

  // Enhanced colors for dark mode to improve visibility
  if (isDark) {
    if (rating < 1200) return "#bfbfbf"; // Lighter Gray (Newbie)
    if (rating < 1400) return "#6cff6c"; // Bright Green (Pupil)
    if (rating < 1600) return "#4dfffa"; // Bright Teal (Specialist)
    if (rating < 1900) return "#5c5cff"; // Lighter Blue (Expert)
    if (rating < 2100) return "#ea8dea"; // Lighter Purple (Candidate Master)
    if (rating < 2400) return "#ffb347"; // Lighter Orange (Master)
    if (rating < 2600) return "#ffb347"; // Lighter Orange (International Master)
    if (rating < 3000) return "#ff6b6b"; // Lighter Red (Grandmaster)
    return "#ff6b6b"; // Lighter Red (International Grandmaster)
  } else {
    // Original colors for light mode
    if (rating < 1200) return "#808080"; // Gray (Newbie)
    if (rating < 1400) return "#008900"; // Green (Pupil)
    if (rating < 1600) return "#03A89E"; // Teal (Specialist)
    if (rating < 1900) return "#0000FF"; // Blue (Expert)
    if (rating < 2100) return "#AA00AA"; // Purple (Candidate Master)
    if (rating < 2400) return "#FF8C00"; // Orange (Master)
    if (rating < 2600) return "#FF8C00"; // Orange (International Master)
    if (rating < 3000) return "#FF0000"; // Red (Grandmaster)
    return "#FF0000"; // Red (International Grandmaster)
  }
};

// Get rating level text
export const getRatingLevel = (rating) => {
  if (!rating) return "Unrated";

  if (rating < 1200) return "Newbie";
  if (rating < 1400) return "Pupil";
  if (rating < 1600) return "Specialist";
  if (rating < 1900) return "Expert";
  if (rating < 2100) return "Candidate Master";
  if (rating < 2400) return "Master";
  if (rating < 2600) return "International Master";
  if (rating < 3000) return "Grandmaster";
  return "International Grandmaster";
};

// Convert cron expression to human-readable text
export const cronToHuman = (cronExpression) => {
  if (!cronExpression) return "N/A";

  const parts = cronExpression.split(" ");
  if (parts.length !== 5) return cronExpression;

  const [minute, hour, dayMonth, month, dayWeek] = parts;

  // Simple case: daily at specific time
  if (dayMonth === "*" && month === "*") {
    if (dayWeek === "*") {
      return `Every day at ${hour}:${minute.padStart(2, "0")}`;
    } else {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      if (dayWeek.includes(",")) {
        const dayNames = dayWeek.split(",").map((d) => days[parseInt(d) % 7]);
        return `Every ${dayNames.join(", ")} at ${hour}:${minute.padStart(
          2,
          "0"
        )}`;
      } else {
        const dayName = days[parseInt(dayWeek) % 7];
        return `Every ${dayName} at ${hour}:${minute.padStart(2, "0")}`;
      }
    }
  }

  return cronExpression;
};

// Download blob as a file
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
