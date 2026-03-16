import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
    trailingSlash: true,
    images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
