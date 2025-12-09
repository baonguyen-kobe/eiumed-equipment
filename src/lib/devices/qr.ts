import QRCode from "qrcode";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Get the URL that the QR code should point to
 */
export function getDeviceQrUrl(deviceId: string): string {
  return `${BASE_URL}/dashboard/devices/${deviceId}`;
}

/**
 * Generate QR code as SVG string
 */
export async function generateDeviceQrSvg(deviceId: string): Promise<string> {
  const url = getDeviceQrUrl(deviceId);
  try {
    const svg = await QRCode.toString(url, {
      type: "svg",
      width: 200,
      margin: 2,
      color: {
        dark: "#1455A3", // Primary color
        light: "#FFFFFF",
      },
    });
    return svg;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

/**
 * Generate QR code as data URL (for img src)
 */
export async function generateDeviceQrDataUrl(
  deviceId: string
): Promise<string> {
  const url = getDeviceQrUrl(deviceId);
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: "#1455A3",
        light: "#FFFFFF",
      },
    });
    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}
