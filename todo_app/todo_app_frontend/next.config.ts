import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  output: "standalone",
  // root path for the application. needs to be injected during the build if build env dependent
  basePath: process.env.BASE_PATH ?? '',

  // Can define incoming requests (health probes) to redirect to the basepath https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects
  redirects() {
    return [
      {
        source: '/health',
        destination: `${process.env.BASE_PATH}/health`,
        permanent: false,
        basePath: false
      },
      {
        source: '/ready',
        destination: `${process.env.BASE_PATH}/ready`,
        permanent: false,
        basePath: false
      },
    ]
  },
};

export default nextConfig;
