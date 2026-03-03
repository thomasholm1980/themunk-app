/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ["@themunk/core"],
};

module.exports = nextConfig;
