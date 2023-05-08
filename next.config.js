/** @type {import('next').NextConfig} */

exports.output = 'standalone'
exports.images = { unoptimized: true }
exports.swcMinify = true
exports.reactStrictMode = true // this enables us to switch to preact later
exports.experimental = { appDir: true /*, images: { unoptimized: true } */ }

exports.webpack = (config, { dev, isServer }) => {
  if (!dev && !isServer) {
    Object.assign(config.resolve.alias, {
      'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat'
    })
  }
  return config
}
