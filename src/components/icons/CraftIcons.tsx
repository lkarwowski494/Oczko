// ============================================================================
// Apps4Craft Studio — Minimalist Vector Icons (react-native-svg)
// Unified linear iconography for Oczko, Napar, Piekarz, Słoik & Dym.
// Zero emojis, uniform 1.75pt stroke, rounded caps and joins.
// ============================================================================

import React from 'react';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** 1. Licznik / Rytuał: Pętla oczka dziewiarskiego (Stitch / Loop) */
export function CounterIcon({ size = 24, color = '#F4EFEA', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Pętla oczka dziewiarskiego */}
      <Path
        d="M8 4c-3 3-4 6-4 9a8 8 0 0 0 16 0c0-3-1-6-4-9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Skrzyżowanie nitek w dole pętli */}
      <Path
        d="M8 17l4-5 4 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="7" r="1.5" fill={color} />
    </Svg>
  );
}

/** 2. Projekty: Teczka rzemieślnicza z dzianiną */
export function ProjectsIcon({ size = 24, color = '#F4EFEA', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7l-2-2H5a2 2 0 0 0-2 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 14h8M8 17h5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** 3. Magazyn / Stash: Kłębek włóczki i motek */
export function StashIcon({ size = 24, color = '#F4EFEA', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Kłębek włóczki */}
      <Circle
        cx="12"
        cy="12"
        r="8"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Przędza i sploty */}
      <Path
        d="M7 8c2.5 1.5 7.5 1.5 10 0M7 16c2.5-1.5 7.5-1.5 10 0M8 7c1.5 2.5 1.5 7.5 0 10M16 7c-1.5 2.5-1.5 7.5 0 10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** 4. Warsztat / Techniki: Skrzyżowane druty z linijką miary */
export function LearnIcon({ size = 24, color = '#F4EFEA', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Drut lewy */}
      <Line
        x1="5"
        y1="19"
        x2="19"
        y2="5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="5" cy="19" r="1.5" fill={color} />
      {/* Drut prawy */}
      <Line
        x1="19"
        y1="19"
        x2="5"
        y2="5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="19" cy="19" r="1.5" fill={color} />
      {/* Znacznik pomiaru próbki */}
      <Rect
        x="9"
        y="9"
        width="6"
        height="6"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

/** 5. Ustawienia: Szwajcarski zarys koła zębatego */
export function SettingsIcon({ size = 24, color = '#F4EFEA', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 6. Zamknij (Close): Bezpieczny krzyżyk */
export function CloseIcon({ size = 20, color = '#F4EFEA', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 7. Cofnij (Undo): Zakrzywiona strzałka powrotu */
export function UndoIcon({ size = 20, color = '#F4EFEA', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 14L4 9l5-5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** 8. Zaznaczenie (Checkmark) */
export function CheckIcon({ size = 20, color = '#4E8D72', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 9. Ikona profilu: Tylko Druty */
export function KnittingIcon({ size = 24, color = '#F4EFEA', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="20" x2="20" y2="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Line x1="20" y1="20" x2="4" y2="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="4" cy="20" r="1.75" fill={color} />
      <Circle cx="20" cy="20" r="1.75" fill={color} />
    </Svg>
  );
}

/** 10. Ikona profilu: Tylko Szydełko */
export function CrochetIcon({ size = 24, color = '#F4EFEA', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Szydełko z ergonomiczną główką i haczykiem */}
      <Path
        d="M19 4c0 1.5-1.5 2.5-3 2.5H7a3 3 0 0 0-3 3v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9h6c2.5 0 4.5-1.5 4.5-4 0-1.5-.5-2-1.5-2s-1.5 1-1 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 11. Ikona profilu: Oba rzemiosła (Mixed) */
export function MixedCraftIcon({ size = 24, color = '#F4EFEA', strokeWidth = 1.75 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="20" x2="20" y2="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="4" cy="20" r="1.75" fill={color} />
      <Path
        d="M20 9c0-2-1-3-2.5-3s-1.5 1-1 2l-7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={strokeWidth} strokeDasharray="2 2" />
    </Svg>
  );
}

// ============================================================================
// Apps4Craft Studio Family Icons
// ============================================================================

export function NaparSuiteIcon({ size = 22, color = '#D97736' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h16l-5.5 10.5h-5L4 6z" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17.5 7.5c2 0 3.5 1 3.5 3s-1.5 3-3 3" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M8 19.5h8" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
    </Svg>
  );
}

export function PiekarzSuiteIcon({ size = 22, color = '#E5A93C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 14c0-5 3.5-9 8-9s8 4 8 9c0 3-3 5-8 5s-8-2-8-5z" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M8 12c1.5-2 3-2 4 0M12 12c1.5-2 3-2 4 0" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
    </Svg>
  );
}

export function SloikSuiteIcon({ size = 22, color = '#4E8D45' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="6" y="8" width="12" height="13" rx="3" stroke={color} strokeWidth={1.75} />
      <Path d="M8 5h8M7 8h10" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
      <Path d="M9 13h6M10 16h4" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
    </Svg>
  );
}

export function DymSuiteIcon({ size = 22, color = '#C25A38' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3c1 3-2 4-1 7 1 2 4 3 4 6a7 7 0 1 1-14 0c0-4 3-6 5-8 1-1 1-3 1-5 2 0 4 0 5 0z" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
