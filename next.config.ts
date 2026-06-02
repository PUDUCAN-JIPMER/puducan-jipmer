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
    /*configs*/
})

export default nextConfig
