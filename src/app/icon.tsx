import { ImageResponse } from "next/og";

// Kích thước chuẩn của favicon
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Use '50%' for a perfect circle
        // Use '8px' or '20%' for a squircle shape
        borderRadius: "20%",
        overflow: "hidden",
        background: "black",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://avatars.githubusercontent.com/u/61035309?v=4"
        alt="Favicon"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>,
    {
      ...size,
    },
  );
}
