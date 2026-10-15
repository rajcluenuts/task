import {
  ListTodo,
  CircleDashed,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const icons = {
  total: ListTodo,
  pending: CircleDashed,
  inProgress: Clock3,
  completed: CheckCircle2,
};

export default function SummaryCard({ label, value, type }) {
  const Icon = icons[type];

  return (
    <article className="summary-card">
      <div className={`summary-icon ${type}`}>
        {Icon && <Icon size={20} />}
      </div>

      <p className="summary-label">{label}</p>
      <strong className="summary-value">{value}</strong>
    </article>
  );
}
