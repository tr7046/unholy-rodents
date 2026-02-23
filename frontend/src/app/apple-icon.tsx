import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 24,
        }}
      >
        <span
          style={{
            fontWeight: 900,
            color: '#c41e3a',
            letterSpacing: '-4px',
            fontFamily: 'sans-serif',
          }}
        >
          UR
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
