/** @type {import('next').NextConfig} */
const prod = process.env.NODE_ENV === 'production'
const nextConfig = {
    env: {
        EXAMPLE_MOVE_PACKAGE_ID: process.env.NEXT_PUBLIC_EXAMPLE_MOVE_PACKAGE_ID,
        API_HOST: process.env.NEXT_PUBLIC_API_HOST,
        RPID: process.env.NEXT_PUBLIC_RPID
    },
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
