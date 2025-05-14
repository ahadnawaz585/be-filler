console.log(process.env.NEXT_PUBLIC_API_URL)
export const environment = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
  // apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://v21qbr74-3001.euw.devtunnels.ms/'
  // apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://174.136.29.206:3000'
  // apiUrl: process.env.  NEXT_PUBLIC_API_URL || 'https://solarmax.com.pk/gatepass'
};  