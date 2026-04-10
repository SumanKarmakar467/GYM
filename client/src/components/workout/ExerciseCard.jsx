const ExerciseCard = ({ exercise, checked, onToggle, showNote = true }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-success bg-emerald-500/12 shadow-[0_0_0_1px_rgba(34,197,94,0.22)]"
          : "border-borderSubtle bg-bgSecondary hover:-translate-y-0.5 hover:border-brandPrimary hover:shadow-[0_12px_24px_rgba(0,0,0,0.24)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg text-white">{exercise.exerciseName || exercise.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-textSecondary">
            {exercise.sets !== undefined ? <span className="badge">{exercise.sets} sets</span> : null}
            {exercise.reps ? <span className="badge">{exercise.reps} reps</span> : null}
            {exercise.rest ? <span className="badge">Rest {exercise.rest}</span> : null}
          </div>
          {showNote && exercise.notes ? <p className="mt-2 text-sm italic text-textSecondary">{exercise.notes}</p> : null}
        </div>
        <span
          className={`grid h-7 w-7 place-items-center rounded-full border ${
            checked ? "border-success bg-success" : "border-borderSubtle"
          }`}
        >
          <svg viewBox="0 0 20 20" className={`h-4 w-4 text-white ${checked ? "opacity-100" : "opacity-0"}`}>
            <path
              d="m4 10 4 4 8-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              style={{ strokeDasharray: 100, animation: checked ? "strokeDraw 0.35s ease" : "none" }}
            />
          </svg>
        </span>
      </div>
    </button>
  );
};

export default ExerciseCard;
