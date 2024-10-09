/** @type {import('next').NextConfig} */
const prod = process.env.NODE_ENV === 'production'
const nextConfig = {
  //reactStrictMode: true,
  images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'abs.twimg.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'pbs.twimg.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    }
    
};

const withPWA = require('next-pwa')({
    dest: 'public',
   //disable: prod ? false : true
    disable: true
  })
  
  module.exports = withPWA(nextConfig)

//export default nextConfig;
