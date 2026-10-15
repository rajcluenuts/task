import {
  CheckSquare,
  LayoutDashboard,
  Settings,
  CircleHelp,
  ChevronRight,
  ListTodo,
} from "lucide-react";

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "all-tasks",
    label: "All tasks",
    icon: ListTodo,
  },
  {
    id: "my-tasks",
    label: "Tasks",
    icon: ListTodo,
    mobileOnly: true,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
  {
    id: "help",
    label: "Help & Support",
    icon: CircleHelp,
  },
];

export default function Sidebar({
  totalTasks = 0,
  myTaskCount = 0,
  activePage = "dashboard",
  onNavigate = () => {},
}) {
  function handleNavigation(event, page) {
    event.preventDefault();
    onNavigate(page);
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <a
        className="sidebar-brand"
        href="#dashboard"
        onClick={(event) => handleNavigation(event, "dashboard")}
        aria-label="TaskFlow home"
      >
        <span className="sidebar-logo">
          <CheckSquare size={21} strokeWidth={2.4} />
        </span>

        <span className="sidebar-brand-name">TaskFlow</span>
      </a>

      {/* Main navigation */}
      <div className="sidebar-main">
        <p className="sidebar-section-label">WORKSPACE</p>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`sidebar-nav-item ${
                  item.mobileOnly ? "mobile-my-tasks-nav " : ""
                }${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) =>
                  handleNavigation(event, item.id)
                }
              >
                <Icon size={18} strokeWidth={1.8} />

                <span>{item.label}</span>

                {item.id === "all-tasks" && (
                  <span className="sidebar-task-count">{totalTasks}</span>
                )}

                {item.id === "my-tasks" && (
                  <span className="sidebar-task-count">{myTaskCount}</span>
                )}

                {isActive && (
                  <ChevronRight
                    className="sidebar-nav-indicator"
                    size={15}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Task navigation */}
        <div className="sidebar-workspace">
          <div className="workspace-heading">
            <span className="sidebar-section-label">MY WORK</span>

            <span className="workspace-count">{myTaskCount}</span>
          </div>

          <a
            className={`sidebar-nav-item ${
              activePage === "my-tasks" ? "active" : ""
            }`}
            href="#my-tasks"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("my-tasks");
            }}
            aria-current={activePage === "my-tasks" ? "page" : undefined}
          >
            <ListTodo size={18} strokeWidth={1.8} />

            <span>Tasks</span>

            <span className="sidebar-task-count">{myTaskCount}</span>
          </a>
        </div>
      </div>

      {/* Sidebar footer */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-help-card"
          onClick={() => onNavigate("help")}
        >
          <span className="help-icon">
            <CircleHelp size={17} />
          </span>

          <span className="help-content">
            <strong>Need help?</strong>
            <span>We're here for you.</span>
          </span>

          <ChevronRight size={15} className="help-arrow" />
        </button>

        <div className="sidebar-profile">
          <div className="profile-avatar">R</div>

          <div className="profile-details">
            <strong>Rajvir</strong>
            <span>Workspace owner</span>
          </div>

          <span
            className="profile-status"
            aria-label="Online"
            title="Online"
          />
        </div>
      </div>
    </aside>
  );
}