import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  output: "standalone",
  // root path for the application. needs to be injected during the build if build env dependent
  basePath: process.env.BASE_PATH ?? ''
};

export default nextConfig;
