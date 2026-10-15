import { ArrowLeft, Construction } from "lucide-react";

export default function ComingSoon({ type, onBack }) {
  const title =
    type === "settings" ? "Settings" : "Help & Support";
  const description =
    type === "settings"
      ? "Workspace preferences and account controls will be available here soon."
      : "Helpful guides and support resources are on their way.";

  return (
    <section className="coming-soon-page">
      <button type="button" onClick={onBack} className="back-button">
        <ArrowLeft size={16} />
        Back to dashboard
      </button>

      <div className="coming-soon-content">
        <div className="coming-soon-icon">
          <Construction size={29} strokeWidth={1.7} />
        </div>

        <span className="coming-soon-badge">
          <span className="coming-soon-dot" />
          COMING SOON
        </span>

        <h1>{title}</h1>
        <p>{description}</p>

        <div className="coming-soon-card">
          <div className="coming-soon-card-icon">
            <Construction size={18} />
          </div>
          <div>
            <strong>We’re building this section</strong>
            <p>
              We’re working on useful features to make your TaskFlow
              experience even better.
            </p>
          </div>
        </div>

        <span className="coming-soon-footer">
          TASKFLOW <span>·</span> MORE FEATURES, COMING SOON
        </span>
      </div>
    </section>
  );
}