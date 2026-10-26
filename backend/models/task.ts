
import { model, Schema } from "mongoose";

export type TaskStatus = "Pending" | "In Progress" | "Completed";
export type priorityStatus = "Low" | "Medium" | "High";

export interface TaskFields {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: priorityStatus;
  assignedTo: string;
}

const taskSchema = new Schema<TaskFields>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    dueDate: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    assignedTo: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export default model<TaskFields>("Task", taskSchema);
