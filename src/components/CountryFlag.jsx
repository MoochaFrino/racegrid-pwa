const COUNTRY_META = {
  GB: { name: "United Kingdom", label: "Inggris (UK)" },
  IT: { name: "Italy", label: "Italia" },
  MC: { name: "Monaco", label: "Monako" },
  NL: { name: "Netherlands", label: "Belanda" },
  FR: { name: "France", label: "Prancis" },
  AU: { name: "Australia", label: "Australia" },
  NZ: { name: "New Zealand", label: "Selandia Baru" },
  AR: { name: "Argentina", label: "Argentina" },
  BR: { name: "Brazil", label: "Brasil" },
  DE: { name: "Germany", label: "Jerman" },
  ES: { name: "Spain", label: "Spanyol" },
  TH: { name: "Thailand", label: "Thailand" },
  CA: { name: "Canada", label: "Kanada" },
  MX: { name: "Mexico", label: "Meksiko" },
  FI: { name: "Finland", label: "Finlandia" },
  CN: { name: "China", label: "Tiongkok" },
  JP: { name: "Japan", label: "Jepang" },
  US: { name: "United States", label: "Amerika Serikat" },
  AT: { name: "Austria", label: "Austria" },
  BE: { name: "Belgium", label: "Belgia" },
  HU: { name: "Hungary", label: "Hungaria" },
  AZ: { name: "Azerbaijan", label: "Azerbaijan" },
  MY: { name: "Malaysia", label: "Malaysia" },
  SG: { name: "Singapore", label: "Singapura" },
  QA: { name: "Qatar", label: "Qatar" },
  AE: { name: "UAE", label: "Uni Emirat Arab" },
};

function parseFlagCode(flagOrCode) {
  if (!flagOrCode) return "";
  const raw = String(flagOrCode).trim();
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();

  const chars = Array.from(raw);
  if (chars.length >= 2) {
    const c1 = chars[0].codePointAt(0) || 0;
    const c2 = chars[1].codePointAt(0) || 0;
    if (c1 >= 0x1f1e6 && c1 <= 0x1f1ff && c2 >= 0x1f1e6 && c2 <= 0x1f1ff) {
      return (
        String.fromCharCode(c1 - 0x1f1e6 + 65) +
        String.fromCharCode(c2 - 0x1f1e6 + 65)
      );
    }
  }
  return raw.slice(0, 2).toUpperCase();
}

function getCountryName(flagOrCode) {
  const code = parseFlagCode(flagOrCode);
  return COUNTRY_META[code]?.name || code;
}

function renderFlagSvg(code) {
  switch (code) {
    case "GB":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#012169" />
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFF" strokeWidth="8" />
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4.5" />
          <path d="M30,0 V40 M0,20 H60" stroke="#FFF" strokeWidth="13" />
          <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8" />
        </svg>
      );
    case "AU":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#00008B" />
          <rect width="30" height="20" fill="#012169" />
          <path d="M0,0 L30,20 M30,0 L0,20" stroke="#FFF" strokeWidth="4" />
          <path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth="2" />
          <path d="M15,0 V20 M0,10 H30" stroke="#FFF" strokeWidth="6.5" />
          <path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="4" />
          <circle cx="15" cy="30" r="3.2" fill="#FFF" />
          <circle cx="45" cy="8" r="2" fill="#FFF" />
          <circle cx="52" cy="16" r="2" fill="#FFF" />
          <circle cx="45" cy="31" r="2.2" fill="#FFF" />
          <circle cx="38" cy="18" r="1.8" fill="#FFF" />
        </svg>
      );
    case "NZ":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#00247D" />
          <path d="M0,0 L30,20 M30,0 L0,20" stroke="#FFF" strokeWidth="4" />
          <path d="M0,0 L30,20 M30,0 L0,20" stroke="#CC142B" strokeWidth="2" />
          <path d="M15,0 V20 M0,10 H30" stroke="#FFF" strokeWidth="6.5" />
          <path d="M15,0 V20 M0,10 H30" stroke="#CC142B" strokeWidth="4" />
          <circle cx="45" cy="9" r="2.2" fill="#CC142B" stroke="#FFF" strokeWidth="0.8" />
          <circle cx="52" cy="17" r="2.2" fill="#CC142B" stroke="#FFF" strokeWidth="0.8" />
          <circle cx="45" cy="30" r="2.4" fill="#CC142B" stroke="#FFF" strokeWidth="0.8" />
          <circle cx="38" cy="18" r="2" fill="#CC142B" stroke="#FFF" strokeWidth="0.8" />
        </svg>
      );
    case "IT":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="20" height="40" fill="#009246" />
          <rect x="20" width="20" height="40" fill="#FFF" />
          <rect x="40" width="20" height="40" fill="#CE2B37" />
        </svg>
      );
    case "FR":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="20" height="40" fill="#002395" />
          <rect x="20" width="20" height="40" fill="#FFF" />
          <rect x="40" width="20" height="40" fill="#ED2939" />
        </svg>
      );
    case "MC":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="20" fill="#CE1126" />
          <rect y="20" width="60" height="20" fill="#FFF" />
        </svg>
      );
    case "NL":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="13.4" fill="#AE1C28" />
          <rect y="13.3" width="60" height="13.4" fill="#FFF" />
          <rect y="26.6" width="60" height="13.4" fill="#21468B" />
        </svg>
      );
    case "DE":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="13.4" fill="#000" />
          <rect y="13.3" width="60" height="13.4" fill="#DD0000" />
          <rect y="26.6" width="60" height="13.4" fill="#FFCE00" />
        </svg>
      );
    case "ES":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="10" fill="#AA151B" />
          <rect y="10" width="60" height="20" fill="#F1BF00" />
          <rect y="30" width="60" height="10" fill="#AA151B" />
          <rect x="14" y="15" width="6" height="10" rx="1.5" fill="#AA151B" />
        </svg>
      );
    case "TH":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#A51931" />
          <rect y="6.6" width="60" height="26.8" fill="#F4F5F8" />
          <rect y="13.3" width="60" height="13.4" fill="#2D2A4A" />
        </svg>
      );
    case "CA":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="15" height="40" fill="#FF0000" />
          <rect x="15" width="30" height="40" fill="#FFF" />
          <rect x="45" width="15" height="40" fill="#FF0000" />
          <path d="M30,9 L33,17 L39,16 L35,22 L38,26 L31,26 L31,32 L29,32 L29,26 L22,26 L25,22 L21,16 L27,17 Z" fill="#FF0000" />
        </svg>
      );
    case "MX":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="20" height="40" fill="#006847" />
          <rect x="20" width="20" height="40" fill="#FFF" />
          <rect x="40" width="20" height="40" fill="#CE1126" />
          <circle cx="30" cy="20" r="4" fill="#7c5624" />
        </svg>
      );
    case "FI":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#FFF" />
          <rect x="16" width="10" height="40" fill="#003580" />
          <rect y="15" width="60" height="10" fill="#003580" />
        </svg>
      );
    case "BR":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#009B3A" />
          <polygon points="30,5 54,20 30,35 6,20" fill="#FEDF00" />
          <circle cx="30" cy="20" r="8.5" fill="#002776" />
          <path d="M22,19 Q30,16 38,21" stroke="#FFF" strokeWidth="1.8" fill="none" />
        </svg>
      );
    case "AR":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="13.4" fill="#74ACDF" />
          <rect y="13.3" width="60" height="13.4" fill="#FFF" />
          <rect y="26.6" width="60" height="13.4" fill="#74ACDF" />
          <circle cx="30" cy="20" r="4" fill="#F6B40E" />
        </svg>
      );
    case "CN":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#EE1C25" />
          <circle cx="11" cy="12" r="4.5" fill="#FFFF00" />
          <circle cx="20" cy="6" r="1.5" fill="#FFFF00" />
          <circle cx="23" cy="10" r="1.5" fill="#FFFF00" />
          <circle cx="23" cy="15" r="1.5" fill="#FFFF00" />
          <circle cx="20" cy="19" r="1.5" fill="#FFFF00" />
        </svg>
      );
    case "JP":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#FFF" />
          <circle cx="30" cy="20" r="11" fill="#BC002D" />
        </svg>
      );
    case "US":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#B22234" />
          {[1, 3, 5, 7, 9, 11].map((i) => (
            <rect key={i} y={i * 3.08} width="60" height="3.08" fill="#FFF" />
          ))}
          <rect width="26" height="21.5" fill="#3C3B6E" />
          <circle cx="6" cy="6" r="1.3" fill="#FFF" />
          <circle cx="13" cy="6" r="1.3" fill="#FFF" />
          <circle cx="20" cy="6" r="1.3" fill="#FFF" />
          <circle cx="9.5" cy="11" r="1.3" fill="#FFF" />
          <circle cx="16.5" cy="11" r="1.3" fill="#FFF" />
          <circle cx="6" cy="16" r="1.3" fill="#FFF" />
          <circle cx="13" cy="16" r="1.3" fill="#FFF" />
          <circle cx="20" cy="16" r="1.3" fill="#FFF" />
        </svg>
      );
    case "AT":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="13.4" fill="#ED2939" />
          <rect y="13.3" width="60" height="13.4" fill="#FFF" />
          <rect y="26.6" width="60" height="13.4" fill="#ED2939" />
        </svg>
      );
    case "BE":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="20" height="40" fill="#000" />
          <rect x="20" width="20" height="40" fill="#FAE042" />
          <rect x="40" width="20" height="40" fill="#ED2939" />
        </svg>
      );
    case "HU":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="13.4" fill="#CE2939" />
          <rect y="13.3" width="60" height="13.4" fill="#FFF" />
          <rect y="26.6" width="60" height="13.4" fill="#477050" />
        </svg>
      );
    case "AZ":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="13.4" fill="#00B5E2" />
          <rect y="13.3" width="60" height="13.4" fill="#EF3340" />
          <rect y="26.6" width="60" height="13.4" fill="#509E2F" />
          <circle cx="29" cy="20" r="4.2" fill="#FFF" />
          <circle cx="30.5" cy="20" r="3.4" fill="#EF3340" />
          <circle cx="33.5" cy="20" r="1.5" fill="#FFF" />
        </svg>
      );
    case "MY":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#CC0001" />
          {[1, 3, 5, 7, 9, 11, 13].map((i) => (
            <rect key={i} y={i * 2.85} width="60" height="2.85" fill="#FFF" />
          ))}
          <rect width="30" height="22" fill="#010066" />
          <circle cx="13" cy="11" r="5.5" fill="#FFCC00" />
          <circle cx="15" cy="11" r="4.5" fill="#010066" />
          <circle cx="19" cy="11" r="3" fill="#FFCC00" />
        </svg>
      );
    case "SG":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="20" fill="#EE2536" />
          <rect y="20" width="60" height="20" fill="#FFF" />
          <circle cx="14" cy="10" r="6" fill="#FFF" />
          <circle cx="16.2" cy="10" r="5.2" fill="#EE2536" />
        </svg>
      );
    case "QA":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#8A1538" />
          <polygon
            points="0,0 18,0 23,4 18,8 23,12 18,16 23,20 18,24 23,28 18,32 23,36 18,40 0,40"
            fill="#FFF"
          />
        </svg>
      );
    case "AE":
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="13.4" fill="#00732F" />
          <rect y="13.3" width="60" height="13.4" fill="#FFF" />
          <rect y="26.6" width="60" height="13.4" fill="#000" />
          <rect width="16" height="40" fill="#FF0000" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#27272a" />
          <text
            x="30"
            y="25"
            textAnchor="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#fff"
          >
            {code}
          </text>
        </svg>
      );
  }
}

export default function CountryFlag({
  flag,
  size = "sm",
  showName = false,
  showCode = false,
  className = "",
}) {
  const code = parseFlagCode(flag);
  if (!code) return null;

  const countryName = getCountryName(code);
  const dims =
    size === "xs"
      ? "w-4 h-3 rounded-[2px]"
      : size === "md"
      ? "w-6 h-4 rounded-[3px]"
      : "w-5 h-3.5 rounded-[2px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 align-middle ${className}`}
      title={countryName}
    >
      <span
        className={`inline-block overflow-hidden border border-white/25 shadow-2xs shrink-0 ${dims}`}
      >
        {renderFlagSvg(code)}
      </span>
      {showName && (
        <span className="text-[11px] font-bold tracking-wide text-white/95">
          {countryName}
        </span>
      )}
      {showCode && !showName && (
        <span className="text-[10px] font-mono font-bold uppercase text-white/90">
          {code}
        </span>
      )}
    </span>
  );
}
