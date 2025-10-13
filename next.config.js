/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.svgcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "svgrepo.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "registry.npmmirror.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "registry.npmmirror.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fastapi.tiangolo.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.pinecone.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.inngest.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "langfuse.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.cloudflare.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "developer.apple.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "squareup.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "developer.android.com",
        pathname: "/**",
      },
    ],
  },
};

export default config;
