import {
  ListTodo,
  CircleDashed,
  Clock3,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { TaskSummaryType } from "../../types/task";

const icons: Record<TaskSummaryType, LucideIcon> = {
  total: ListTodo,
  pending: CircleDashed,
  inProgress: Clock3,
  completed: CheckCircle2,
};

interface SummaryCardProps {
  label: string;
  value: number;
  type: TaskSummaryType;
}

export default function SummaryCard({ label, value, type }: SummaryCardProps) {
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
