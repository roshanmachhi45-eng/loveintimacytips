interface AvatarOption {
  id: string;
  label: string;
  svg: React.ReactNode;
}

interface AvatarSelectorProps {
  gender: string;
  selected: string;
  onSelect: (id: string) => void;
}

const MaleSlimSVG = () => (
  <svg viewBox="0 0 60 100" className="w-12 h-20 mx-auto" fill="none">
    <circle cx="30" cy="14" r="9" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="23" y="25" width="14" height="28" rx="5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="13" y="26" width="8" height="20" rx="4" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="39" y="26" width="8" height="20" rx="4" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="24" y="52" width="6" height="28" rx="3" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="30" y="52" width="6" height="28" rx="3" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
  </svg>
);

const MaleFitSVG = () => (
  <svg viewBox="0 0 60 100" className="w-12 h-20 mx-auto" fill="none">
    <circle cx="30" cy="13" r="10" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <path d="M20 25 Q30 28 40 25 L42 55 Q30 58 18 55 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="11" y="26" width="9" height="21" rx="4.5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="40" y="26" width="9" height="21" rx="4.5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="22" y="54" width="7" height="27" rx="3.5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="31" y="54" width="7" height="27" rx="3.5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <line x1="30" y1="30" x2="30" y2="53" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

const MaleMuscularSVG = () => (
  <svg viewBox="0 0 60 100" className="w-12 h-20 mx-auto" fill="none">
    <circle cx="30" cy="12" r="11" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <path d="M17 24 Q30 20 43 24 L46 56 Q30 62 14 56 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="8" y="24" width="10" height="23" rx="5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="42" y="24" width="10" height="23" rx="5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="20" y="55" width="8" height="26" rx="4" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="32" y="55" width="8" height="26" rx="4" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <ellipse cx="25" cy="38" rx="4" ry="5" fill="#f87171" opacity="0.4" />
    <ellipse cx="35" cy="38" rx="4" ry="5" fill="#f87171" opacity="0.4" />
  </svg>
);

const FemaleSlimSVG = () => (
  <svg viewBox="0 0 60 100" className="w-12 h-20 mx-auto" fill="none">
    <circle cx="30" cy="12" r="9" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <path d="M22 23 Q16 35 18 50 Q24 56 36 56 Q42 50 42 37 Q40 24 38 23 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="13" y="25" width="7" height="19" rx="3.5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="40" y="25" width="7" height="19" rx="3.5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <path d="M22 55 L20 82" stroke="#fda4af" strokeWidth="7" strokeLinecap="round" />
    <path d="M38 55 L40 82" stroke="#fda4af" strokeWidth="7" strokeLinecap="round" />
    <path d="M22 55 L20 82" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M38 55 L40 82" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FemaleFitSVG = () => (
  <svg viewBox="0 0 60 100" className="w-12 h-20 mx-auto" fill="none">
    <circle cx="30" cy="12" r="10" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <path d="M21 23 Q12 34 15 50 Q22 60 38 60 Q46 50 45 34 Q40 23 39 23 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="11" y="25" width="8" height="20" rx="4" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="41" y="25" width="8" height="20" rx="4" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <path d="M22 59 L20 82" stroke="#fda4af" strokeWidth="8" strokeLinecap="round" />
    <path d="M38 59 L40 82" stroke="#fda4af" strokeWidth="8" strokeLinecap="round" />
    <path d="M22 59 L20 82" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M38 59 L40 82" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FemaleCurvySVG = () => (
  <svg viewBox="0 0 60 100" className="w-12 h-20 mx-auto" fill="none">
    <circle cx="30" cy="11" r="11" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <path d="M18 23 Q8 36 12 54 Q20 68 40 68 Q52 54 48 36 Q44 23 42 23 Z" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="9" y="26" width="9" height="21" rx="4.5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <rect x="42" y="26" width="9" height="21" rx="4.5" fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5" />
    <path d="M22 67 L20 83" stroke="#fda4af" strokeWidth="9" strokeLinecap="round" />
    <path d="M38 67 L40 83" stroke="#fda4af" strokeWidth="9" strokeLinecap="round" />
    <path d="M22 67 L20 83" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M38 67 L40 83" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
    <ellipse cx="30" cy="42" rx="10" ry="7" fill="#f87171" opacity="0.2" />
  </svg>
);

const maleOptions: AvatarOption[] = [
  { id: 'slim', label: 'Slim Body', svg: <MaleSlimSVG /> },
  { id: 'fit', label: 'Fit Body', svg: <MaleFitSVG /> },
  { id: 'muscular', label: 'Muscular Body', svg: <MaleMuscularSVG /> },
];

const femaleOptions: AvatarOption[] = [
  { id: 'slim', label: 'Slim Body', svg: <FemaleSlimSVG /> },
  { id: 'fit', label: 'Fit Body', svg: <FemaleFitSVG /> },
  { id: 'curvy', label: 'Curvy Body', svg: <FemaleCurvySVG /> },
];

export default function AvatarSelector({ gender, selected, onSelect }: AvatarSelectorProps) {
  const options = gender === 'Female' ? femaleOptions : maleOptions;

  return (
    <div className="grid grid-cols-3 gap-3 mt-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`avatar-card flex flex-col items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
            selected === opt.id
              ? 'selected border-rose-500 bg-rose-50 shadow-md shadow-rose-200'
              : 'border-rose-100 bg-white hover:border-rose-300 hover:bg-rose-50/50'
          }`}
        >
          {opt.svg}
          <span className={`text-xs font-medium text-center leading-tight ${
            selected === opt.id ? 'text-rose-600' : 'text-gray-600'
          }`}>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}
