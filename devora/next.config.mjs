/** @type {import('next').NextConfig} */
// Security headers for every route.
// WHY: Next.js `next dev` needs 'unsafe-eval' + localhost websockets for Fast Refresh.
// A prod-strict CSP without those makes the HTML load while JS never finishes hydrating.

const isDevelopment = process.env.NODE_ENV !== "production";

const sharedSecurityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const productionScriptSrc =
  "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com";
const developmentScriptSrc =
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com";

const productionConnectSrc =
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google-analytics.com https://*.google-analytics.com";
const developmentConnectSrc =
  "connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google-analytics.com https://*.google-analytics.com";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://*.googleusercontent.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  isDevelopment ? developmentScriptSrc : productionScriptSrc,
  isDevelopment ? developmentConnectSrc : productionConnectSrc,
  "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com",
  "form-action 'self'",
  // Keep HSTS-style upgrade off in local http://localhost so the tab does not force https.
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  ...sharedSecurityHeaders,
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
