/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip on the Node.js server; Vercel's CDN also compresses at the edge
  compress: true,

  // Don't leak the framework name via X-Powered-By
  poweredByHeader: false,

  experimental: {
    // Rewrite barrel-file imports so only the exports actually used end up in the
    // bundle. lucide-react ships 1500+ icons and is not in Next.js's built-in list.
    optimizePackageImports: ['lucide-react'],
  },

  images: {
    // Allow Next.js <Image> to serve Supabase Storage receipts.
    // The signed-URL path is /storage/v1/object/sign/… for private buckets.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },

  async headers() {
    return [
      // ── Long-term immutable cache for all Next.js static assets ──────────────
      // Filenames are content-addressed (include a build hash), so the content
      // behind a URL never changes — safe to cache forever.
      // Vercel's CDN sets this automatically; the rule below ensures the same
      // behaviour on any custom / self-hosted server.
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // ── Medium-term cache for the image optimisation endpoint ─────────────────
      // Next.js transforms and resizes source images on the fly; the result is
      // stable for a given URL, so a 7-day CDN cache + 1-day stale-while-revalidate
      // avoids redundant work without serving stale receipts for too long.
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },

      // ── Short cache for the root HTML document ────────────────────────────────
      // The page shell itself should revalidate quickly so deploys propagate fast.
      // stale-while-revalidate lets the CDN serve the old shell instantly while
      // fetching the new one in the background.
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
