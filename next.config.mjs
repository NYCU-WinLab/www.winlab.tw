/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "gravatar.com" },
    ],
  },
}

export default nextConfig
