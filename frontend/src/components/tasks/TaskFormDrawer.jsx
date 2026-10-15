import { useState } from "react";
import { X, CalendarDays } from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  dueDate: "",
  status: "Pending",
  assignedTo: "",
};

export default function TaskFormDrawer({ onClose, onCreate }) {
const [form, setForm] = useState(emptyForm);
const [error, setError] = useState("");

function handleChange(event) {
const { name, value } = event.target;

setForm((current) => ({
  ...current,
  [name]: value,
}));

setError("");

}

function handleSubmit(event) {
event.preventDefault();

if (!form.title.trim()) {
  setError("Please enter a task title.");
  return;
}

onCreate({
  ...form,
  title: form.title.trim(),
  description: form.description.trim(),
});

}

return (
<div className="drawer-overlay" onMouseDown={onClose}>
<aside
className="task-drawer"
role="dialog"
aria-modal="true"
aria-labelledby="drawer-title"
onMouseDown={(event) => event.stopPropagation()}
>
<header className="drawer-header">
<div>
<p className="drawer-eyebrow">TASK MANAGEMENT</p>
<h2 id="drawer-title">Create new task</h2>
<p>Define the details of your next task.</p>
</div>

      <button
        type="button"
        className="icon-button"
        onClick={onClose}
        aria-label="Close task form"
      >
        <X size={20} />
      </button>
    </header>

    <form className="drawer-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="task-title">
          Task title <span>*</span>
        </label>
        <input
          id="task-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Design dashboard UI"
          autoFocus
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="What needs to be done?"
          rows={4}
        />
      </div>

      <div className="form-field">
        <label htmlFor="task-due-date">Due date</label>
        <div className="date-input">
          <CalendarDays size={17} />
          <input
            id="task-due-date"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="task-assignee">Assign to</label>
        <select
          id="task-assignee"
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
        >
          <option value="">Unassigned</option>
          <option value="Rajvir">Me (Rajvir)</option>
        </select>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <footer className="drawer-footer">
        <button
          type="button"
          className="secondary-button"
          onClick={onClose}
        >
          Cancel
        </button>
        <button type="submit" className="primary-button">
          Create task
        </button>
      </footer>
    </form>
  </aside>
</div>

);
}