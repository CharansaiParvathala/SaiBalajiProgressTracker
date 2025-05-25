import { VercelRequest, VercelResponse } from '@vercel/node';
import * as couchbase from 'couchbase';
import * as jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract JWT from cookie
    const token = req.cookies?.authToken;
    if (!token) {
      return res.status(401).json({ error: 'No session found' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    const cluster = await couchbase.connect(process.env.COUCHBASE_URL!, {
      username: process.env.COUCHBASE_USERNAME!,
      password: process.env.COUCHBASE_PASSWORD!,
    });
    const bucket = cluster.bucket('travel-sample');
    const collection = bucket.defaultCollection();
    const key = `myapp::user::${decoded.email}`;

    const result = await collection.get(key);
    const user = result.content;

    delete user.password; // Remove password from response
    res.status(200).json(user);
  } catch (error: any) {
    console.error('Error in /api/me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
