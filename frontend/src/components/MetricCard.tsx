type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="panel compact-card">
      <p className="metric-label">{label}</p>
      <h3>{value}</h3>
      <p className="status-text">{detail}</p>
    </div>
  );
}
