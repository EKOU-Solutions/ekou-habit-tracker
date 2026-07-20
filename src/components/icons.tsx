import Svg, { Path, Rect } from 'react-native-svg';

interface IconProps {
  color: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export function CheckIcon({ color, width = 12, height = 10, strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 14 12">
      <Path
        d="M1 6.5L5 10.5L13 1.5"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MicIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={9} y={3} width={6} height={11} rx={3} fill={color} />
      <Path d="M5 11a7 7 0 0 0 14 0" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M12 18v3" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
