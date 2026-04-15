export function calculateHealthScore(results) {
  if (!results) return 0;

  const mergeRate = results?.["PR Metrics"]?.merge_rate || 0;
  const avgMergeTime = results?.["PR Metrics"]?.avg_merge_time_days || 0;
  const backlogRatio = results?.["PR Backlog"]?.backlog_ratio || 0;
  const activeMaintainers = results?.["Active Maintainers"] || 0;
  const latestWeeklyCommits =
    results?.["Commit Trend"]?.commit_counts?.slice(-1)[0] || 0;

  const speedScore = Math.round(100 * Math.exp(-avgMergeTime / 10));
  const backlogScore = Math.round(100 / (1 + Math.log1p(backlogRatio)));
  const maintainerScore = Math.round(
    100 * (1 - Math.exp(-activeMaintainers / 5)),
  );
  const commitScore = Math.round(
    100 * (1 - Math.exp(-latestWeeklyCommits / 15)),
  );

  return Math.round(
    mergeRate * 0.25 +
      speedScore * 0.15 +
      backlogScore * 0.2 +
      maintainerScore * 0.2 +
      commitScore * 0.2,
  );
}

export function getHealthStatus(score) {
  if (score >= 80) return { label: "Healthy", class: "healthy" };
  if (score >= 50) return { label: "Needs Attention", class: "warning" };
  return { label: "At Risk", class: "danger" };
}
