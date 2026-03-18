// Caesarzkn Iconography — password visibility icons

export function EyeVisible({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Eyelashes */}
      <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="4.5" y1="2.2" x2="5.3" y2="3.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11.5" y1="2.2" x2="10.7" y2="3.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* Eye outline */}
      <path
        d="M2 8C2 8 4.5 4.5 8 4.5C11.5 4.5 14 8 14 8C14 8 11.5 11.5 8 11.5C4.5 11.5 2 8 2 8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pupil */}
      <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function EyeNotVisible({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Closed eye — single curved arc */}
      <path
        d="M2 9C2 9 4.5 5.5 8 5.5C11.5 5.5 14 9 14 9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Eyelashes pointing down */}
      <line x1="8" y1="10.5" x2="8" y2="12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="9.8" x2="4.3" y2="11.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="9.8" x2="11.7" y2="11.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
