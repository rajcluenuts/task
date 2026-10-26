import {
  LayoutDashboard,
  ListTodo,
  Settings,
  CircleHelp,
} from "lucide-react";

interface SidebarProps {
  totalTasks?: number;
}

export default function Sidebar({ totalTasks = 0 }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <a className="brand" href="#dashboard" aria-label="TaskFlow home">
        <span className="brand-icon">
          <ListTodo size={22} />
        </span>
        <span className="brand-name">TaskFlow</span>
      </a>

      {/* Navigation */}
      <div className="sidebar-navigation">
        <p className="nav-label">WORKSPACE</p>

        <nav className="navigation" aria-label="Main navigation">
          <a className="nav-item active" href="#dashboard" aria-current="page">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>

          <a className="nav-item" href="#tasks">
            <ListTodo size={18} />
            <span>All tasks</span>
            <span className="nav-count">{totalTasks}</span>
          </a>
        </nav>
      </div>

      {/* Bottom navigation */}
      <div className="sidebar-bottom">
        <a className="nav-item" href="#settings">
          <Settings size={18} />
          <span>Settings</span>
        </a>

        <a className="nav-item" href="#help">
          <CircleHelp size={18} />
          <span>Help & support</span>
        </a>

        <div className="profile-divider" />

        <div className="user-profile">
          <span className="avatar" aria-hidden="true">
            R
          </span>

          <div className="user-info">
            <strong>Rajvir</strong>
            <span className="user-role">Workspace owner</span>
          </div>
        </div>
      </div>
    </aside>
  );
}