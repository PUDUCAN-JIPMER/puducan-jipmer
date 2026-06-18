import type { NextConfig } from 'next'
/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    fallbacks: {
        document: '/offline',
    },
})

const nextConfig: NextConfig = withPWA({
    // Allow accessing dev resources (HMR) from localhost and the LAN IP during development
    // Include both with and without port to be permissive for requests that omit the port.
    allowedDevOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.1.6',
        '192.168.1.6',
        'http://192.168.1.6:3000',
    ],
})

export default nextConfig
