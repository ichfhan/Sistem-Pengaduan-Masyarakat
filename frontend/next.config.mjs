/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/pengaduan/:id/verify', destination: 'http://localhost:5003/api/pengaduan/:id/verify' },
      { source: '/api/auth/:path*', destination: 'http://localhost:5001/api/auth/:path*' },
      { source: '/api/pengaduan/:path*', destination: 'http://localhost:5002/api/pengaduan/:path*' },
      { source: '/uploads/pengaduan/:path*', destination: 'http://localhost:5002/uploads/:path*' },
      { source: '/api/tindak-lanjut/:path*', destination: 'http://localhost:5003/api/tindak-lanjut/:path*' },
      { source: '/uploads/tindaklanjut/:path*', destination: 'http://localhost:5003/uploads/:path*' },
      { source: '/api/dashboard/:path*', destination: 'http://localhost:5005/api/dashboard/:path*' },
    ];
  },
};

export default nextConfig;
