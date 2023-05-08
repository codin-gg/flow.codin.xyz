/** @type {import('next').NextConfig} */

exports.output = 'standalone'
exports.images = { unoptimized: true }
exports.swcMinify = true
exports.reactStrictMode = true
exports.experimental = { appDir: true }
