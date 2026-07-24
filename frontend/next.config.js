/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://checkout.culqi.com`,
      "connect-src 'self' https: wss:",
      "frame-src 'self' https://checkout.culqi.com",
      process.env.NODE_ENV === "production" ? "upgrade-insecure-requests" : ""
    ].filter(Boolean).join("; ");

    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }
      ]
    }];
  }
};

module.exports = nextConfig;
