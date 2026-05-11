import type { NextConfig } from 'next'
/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa').default({
    dest: 'public',
    register: true,
    skipWaiting: true,
})

const nextConfig: NextConfig = withPWA({
    /* config options here */
})

export default nextConfig
