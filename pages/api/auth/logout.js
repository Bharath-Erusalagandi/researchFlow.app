export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // In a stateless JWT auth system, the actual logout happens on the client-side
  // by removing the token from storage
  // This endpoint is mainly for tracking purposes or potential future extensions

  return res.status(200).json({ message: 'Logout successful' });
} 