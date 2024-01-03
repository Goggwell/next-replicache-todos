/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals = config.externals.concat(['tedious', 'mssql', /* etc. */])
        return config
    },
    experimental: {
        serverComponentsExternalPackages: ['tedious', 'mssql', 'pg-mem', 'pg'],
    }
}

module.exports = nextConfig
