console.log(process.env.NEXT_PUBLIC_API_URL)
export const environment = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://be-filler-server.onrender.com',
  secretKey: process.env.NEXT_PUBLIC_SECRET_KEY || 'secret',
  // apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://v21qbr74-3001.euw.devtunnels.ms/'
  // apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://174.136.29.206:3000'
  // apiUrl: process.env.  NEXT_PUBLIC_API_URL || 'https://solarmax.com.pk/gatepass'
};  