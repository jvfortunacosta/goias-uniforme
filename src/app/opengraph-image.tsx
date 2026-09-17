import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Loja Goiás F.A.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public/marca/logo-branca.png")
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#004C1B",
        }}
      >
        <img src={logoSrc} width={280} height={312} alt="" />
        <div
          style={{
            marginTop: 32,
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: -1,
            color: "#f7f8f6",
            textTransform: "uppercase",
          }}
        >
          Loja Goiás F.A.
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 2,
            color: "#00e68a",
            textTransform: "uppercase",
          }}
        >
          Vendas por lote · Futebol Americano
        </div>
      </div>
    ),
    { ...size }
  );
}
