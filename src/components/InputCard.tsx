
import AvatarSelector from './AvatarSelector';

interface Person {
  name: string;
  gender: string;
  avatar: string;
  age: string;
  height: string;
}

interface InputCardProps {
  person1: Person;
  person2: Person;
  experience: string;
  onChangePerson1: (
    field: string,
    value: string
  ) => void;
  onChangePerson2: (
    field: string,
    value: string
  ) => void;
  onChangeExperience: (v: string) => void;
  onGenerate: () => void;
  loading: boolean;
  validationError?: string;
}

const genders = ['Male', 'Female'];

const experiences = [
  'Just Crushing',
  'Getting Closer',
  'Deeply In Love',
];

/*
 * Loveons custom height format
 *
 * Minimum: 1.9 ft
 * Maximum: 9.9 ft
 * One decimal place only
 *
 * Examples:
 * 3.5
 * 4.7
 * 5.6
 * 6.3
 * 6.7
 * 9.9
 *
 * Invalid:
 * 1.8
 * 10
 * 10.0
 * 5.65
 * 6.78
 */
const isValidHeight = (value: string): boolean => {
  if (value === '') {
    return true;
  }

  /*
   * Allow:
   * 1
   * 1.
   * 1.9
   * 9.9
   */
  if (!/^\d(\.\d?)?$/.test(value)) {
    return false;
  }

  /*
   * If the user has only typed the first digit,
   * allow it temporarily so they can continue typing.
   */
  if (/^\d$/.test(value)) {
    const firstNumber = Number(value);

    /*
     * 1–9 are allowed as temporary input.
     * Final validation happens when the decimal
     * value is completed.
     */
    return firstNumber >= 1 && firstNumber <= 9;
  }

  /*
   * Allow "1." through "9." while typing.
   */
  if (/^\d\.$/.test(value)) {
    const firstNumber = Number(value.charAt(0));

    return firstNumber >= 1 && firstNumber <= 9;
  }

  const height = Number(value);

  return height >= 1.9 && height <= 9.9;
};

function HeightInput({
  value,
  onChange,
  placeholder,
  focusColor,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  focusColor: 'rose' | 'purple';
}) {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;

    if (isValidHeight(newValue)) {
      onChange(newValue);
    }
  };

  const focusRing =
    focusColor === 'rose'
      ? 'focus:ring-rose-300'
      : 'focus:ring-purple-300';

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`
          w-full
          px-4
          py-3
          pr-11
          rounded-xl
          border
          border-gray-200
          bg-white
          text-gray-800
          placeholder-gray-300
          focus:outline-none
          focus:ring-2
          ${focusRing}
          focus:border-transparent
          text-sm
          transition-all
        `}
      />

      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">
        ft
      </span>
    </div>
  );
}

const RomanticBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none select-none"
    viewBox="0 0 400 300"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    {/* Female silhouette */}
    <ellipse
      cx="155"
      cy="60"
      rx="22"
      ry="25"
      fill="#f43f5e"
    />

    <path
      d="M133 85 Q120 110 125 150 Q135 175 155 178 Q175 175 185 150 Q190 110 177 85 Z"
      fill="#f43f5e"
    />

    <path
      d="M125 150 L118 210"
      stroke="#f43f5e"
      strokeWidth="14"
      strokeLinecap="round"
    />

    <path
      d="M185 150 L192 210"
      stroke="#f43f5e"
      strokeWidth="14"
      strokeLinecap="round"
    />

    <path
      d="M115 92 L105 135"
      stroke="#f43f5e"
      strokeWidth="10"
      strokeLinecap="round"
    />

    <path
      d="M195 92 L205 135"
      stroke="#f43f5e"
      strokeWidth="10"
      strokeLinecap="round"
    />

    {/* Male silhouette */}
    <ellipse
      cx="255"
      cy="58"
      rx="22"
      ry="24"
      fill="#a855f7"
    />

    <path
      d="M233 82 Q238 78 255 80 Q272 78 277 82 L282 148 Q255 155 228 148 Z"
      fill="#a855f7"
    />

    <path
      d="M228 148 L222 210"
      stroke="#a855f7"
      strokeWidth="14"
      strokeLinecap="round"
    />

    <path
      d="M282 148 L288 210"
      stroke="#a855f7"
      strokeWidth="14"
      strokeLinecap="round"
    />

    <path
      d="M220 88 L208 132"
      stroke="#a855f7"
      strokeWidth="10"
      strokeLinecap="round"
    />

    <path
      d="M290 88 L302 132"
      stroke="#a855f7"
      strokeWidth="10"
      strokeLinecap="round"
    />

    {/* Arms */}
    <path
      d="M205 115 Q220 108 228 118"
      stroke="#a855f7"
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />

    <path
      d="M195 112 Q180 108 172 118"
      stroke="#f43f5e"
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />

    {/* Heart */}
    <path
      d="M195 30 C195 24 188 18 182 22 C178 24 178 30 182 34 L195 46 L208 34 C212 30 212 24 208 22 C202 18 195 24 195 30 Z"
      fill="#f43f5e"
    />
  </svg>
);

function GenderButtons({
  value,
  onChange,
}: {
  value: string;
  onChange: (g: string) => void;
}) {
  return (
    <div className="flex gap-2 mt-1">
      {genders.map((gender) => (
        <button
          key={gender}
          type="button"
          onClick={() => onChange(gender)}
          className={`
            gender-btn
            flex-1
            py-1.5
            rounded-lg
            text-xs
            font-semibold
            border
            transition-all
            ${
              value === gender
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-rose-300 hover:text-rose-500'
            }
          `}
        >
          {gender}
        </button>
      ))}
    </div>
  );
}

export default function InputCard({
  person1,
  person2,
  experience,
  onChangePerson1,
  onChangePerson2,
  onChangeExperience,
  onGenerate,
  loading,
  validationError,
}: InputCardProps) {
  return (
    <div className="relative bg-white rounded-3xl shadow-xl shadow-rose-100 border border-rose-100 overflow-hidden">
      <RomanticBackground />

      <div className="relative z-10 p-6 space-y-6">

        {/* Header */}
        <div className="text-center pb-2">
          <h1 className="font-display text-2xl font-bold text-gray-800 leading-tight">
            Discover Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-500">
              {' '}
              Love Guide
            </span>
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Get personalized relationship tips & activities
          </p>
        </div>

        {/* Your info */}
        <div className="space-y-3">

          <label className="block text-xs font-semibold text-rose-500 uppercase tracking-wider">
            Your Name
          </label>

          <input
            type="text"
            placeholder="Enter your name..."
            value={person1.name}
            onChange={(event) =>
              onChangePerson1(
                'name',
                event.target.value
              )
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm transition-all"
          />

          <GenderButtons
            value={person1.gender}
            onChange={(gender) =>
              onChangePerson1(
                'gender',
                gender
              )
            }
          />

          {person1.gender && (
            <div className="mt-1">

              <p className="text-xs text-gray-400 mb-2 font-medium">
                Select your build:
              </p>

              <AvatarSelector
                gender={person1.gender}
                selected={person1.avatar}
                onSelect={(id) =>
                  onChangePerson1(
                    'avatar',
                    id
                  )
                }
              />

            </div>
          )}

          <div className="grid grid-cols-2 gap-3">

            {/* Your Age */}
            <div>

              <label className="block text-xs text-gray-400 mb-1 font-medium">
                Your Age
              </label>

              <input
                type="number"
                placeholder="Age"
                min="18"
                max="99"
                value={person1.age}
                onChange={(event) =>
                  onChangePerson1(
                    'age',
                    event.target.value
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm transition-all"
              />

            </div>

            {/* Your Height */}
            <div>

              <label className="block text-xs text-gray-400 mb-1 font-medium">
                Your Height
              </label>

              <HeightInput
                value={person1.height}
                placeholder="e.g. 5.6"
                onChange={(value) =>
                  onChangePerson1(
                    'height',
                    value
                  )
                }
                focusColor="rose"
              />

            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">

          <div className="flex-1 h-px bg-rose-100" />

          <span className="text-rose-400 font-display text-sm">
            &
          </span>

          <div className="flex-1 h-px bg-rose-100" />

        </div>

        {/* Partner info */}
        <div className="space-y-3">

          <label className="block text-xs font-semibold text-purple-500 uppercase tracking-wider">
            Partner's Name
          </label>

          <input
            type="text"
            placeholder="Enter partner's name..."
            value={person2.name}
            onChange={(event) =>
              onChangePerson2(
                'name',
                event.target.value
              )
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-sm transition-all"
          />

          <GenderButtons
            value={person2.gender}
            onChange={(gender) =>
              onChangePerson2(
                'gender',
                gender
              )
            }
          />

          {person2.gender && (
            <div className="mt-1">

              <p className="text-xs text-gray-400 mb-2 font-medium">
                Select partner's build:
              </p>

              <AvatarSelector
                gender={person2.gender}
                selected={person2.avatar}
                onSelect={(id) =>
                  onChangePerson2(
                    'avatar',
                    id
                  )
                }
              />

            </div>
          )}

          <div className="grid grid-cols-2 gap-3">

            {/* Partner Age */}
            <div>

              <label className="block text-xs text-gray-400 mb-1 font-medium">
                Partner's Age
              </label>

              <input
                type="number"
                placeholder="Age"
                min="18"
                max="99"
                value={person2.age}
                onChange={(event) =>
                  onChangePerson2(
                    'age',
                    event.target.value
                  )
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-sm transition-all"
              />

            </div>

            {/* Partner Height */}
            <div>

              <label className="block text-xs text-gray-400 mb-1 font-medium">
                Partner's Height
              </label>

              <HeightInput
                value={person2.height}
                placeholder="e.g. 6.7"
                onChange={(value) =>
                  onChangePerson2(
                    'height',
                    value
                  )
                }
                focusColor="purple"
              />

            </div>

          </div>
        </div>

        {/* Your Love Stage */}
        <div className="space-y-2">

          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Your Love Stage
          </label>

          <select
            value={experience}
            onChange={(event) =>
              onChangeExperience(
                event.target.value
              )
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm transition-all appearance-none cursor-pointer"
          >

            <option value="">
              Select your love stage...
            </option>

            {experiences.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}

          </select>

        </div>

        {/* Validation message */}
        {validationError && (
          <div
            role="alert"
            className="
              rounded-xl
              border
              border-rose-200
              bg-rose-50
              px-4
              py-3
              text-center
              text-sm
              font-medium
              text-rose-600
              fade-in
            "
          >
            {validationError}
          </div>
        )}

        {/* Generate Button */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="
            w-full
            py-4
            rounded-2xl
            bg-gradient-to-r
            from-rose-500
            via-rose-500
            to-purple-500
            hover:from-rose-600
            hover:via-rose-500
            hover:to-purple-600
            text-white
            font-semibold
            text-base
            shadow-lg
            shadow-rose-200
            hover:shadow-xl
            hover:shadow-rose-200
            active:scale-[0.98]
            transition-all
            duration-200
            disabled:opacity-70
            disabled:cursor-not-allowed
            flex
            items-center
            justify-center
            gap-3
          "
        >

          {loading ? (
            <>
              <span className="text-sm">
                Analyzing compatibility parameters
              </span>

              <span className="flex gap-1">

                <span className="loading-dot w-2 h-2 rounded-full bg-white/80 inline-block" />

                <span className="loading-dot w-2 h-2 rounded-full bg-white/80 inline-block" />

                <span className="loading-dot w-2 h-2 rounded-full bg-white/80 inline-block" />

              </span>
            </>
          ) : (
            <>
              <span>
                Get My Relationship Tips
              </span>

              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />

              </svg>
            </>
          )}

        </button>

      </div>
    </div>
  );
}



