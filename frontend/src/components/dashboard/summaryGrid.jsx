import SummaryCard from "./SummaryCard.jsx";

export default function SummaryGrid({ tasks }) {
  const summary = [
    {
      label: "Total tasks",
      value: tasks.length,
      type: "total",
    },
    {
      label: "Pending",
      value: tasks.filter((task) => task.status === "Pending").length,
      type: "pending",
    },
    {
      label: "In progress",
      value: tasks.filter((task) => task.status === "In Progress").length,
      type: "inProgress",
    },
    {
      label: "Completed",
      value: tasks.filter((task) => task.status === "Completed").length,
      type: "completed",
    },
  ];

  return (
    <section className="summary-grid" aria-label="Task summary">
      {summary.map((item) => (
        <SummaryCard
          key={item.type}
          label={item.label}
          value={item.value}
          type={item.type}
        />
      ))}
    </section>
  );
}