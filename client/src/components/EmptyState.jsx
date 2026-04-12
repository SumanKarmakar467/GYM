import { Link } from "react-router-dom";

const EmptyState = ({ icon, title, subtitle, ctaLabel, ctaLink }) => {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-borderSubtle bg-bgSecondary p-8 text-center">
      <p className="text-4xl">{icon}</p>
      <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-textSecondary">{subtitle}</p>
      {ctaLabel && ctaLink ? (
        <Link to={ctaLink} className="btn-primary mt-6 inline-flex">
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
};

export default EmptyState;
