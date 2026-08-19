import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          background: "linear-gradient(145deg, #060911 0%, #070d1c 44%, #05070f 100%)",
          color: "#ffffff",
          fontSize: 26,
          fontWeight: 800
        }}
      >
        S
      </div>
    ),
    size
  );
}
