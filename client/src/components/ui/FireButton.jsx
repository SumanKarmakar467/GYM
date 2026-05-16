const FireButton = ({ children, onClick, className = "", type = "button", disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative bg-fire px-8 py-3 font-body text-sm font-bold uppercase tracking-widest text-white
      transition-all duration-200 hover:-translate-y-0.5 hover:bg-ember
      hover:shadow-[0_8px_24px_rgba(255,69,0,0.4)] active:scale-95
      disabled:cursor-not-allowed disabled:opacity-60
      ${className}
    `}
    style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
  >
    {children}
  </button>
);

export default FireButton;
