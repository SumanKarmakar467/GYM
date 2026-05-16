const GymCard = ({ children, className = "", hover = true }) => (
  <div
    className={`
      group relative overflow-hidden border border-white/[0.06] bg-plate transition-all duration-300
      ${hover ? "hover:-translate-y-1 hover:border-fire/30 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]" : ""}
      ${className}
    `}
    style={{
      clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))"
    }}
  >
    <div className="absolute left-0 top-0 h-0 w-[3px] bg-fire transition-all duration-500 group-hover:h-full" />
    {children}
  </div>
);

export default GymCard;
