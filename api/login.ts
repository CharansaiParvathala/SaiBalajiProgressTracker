import { VercelRequest, VercelResponse } from '@vercel/node';
import * as couchbase from 'couchbase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { email, password } = req.body;

  try {
    const cluster = await couchbase.connect("couchbases://cb.drr3tmw3bgdgggid.cloud.couchbase.com", {
      username: "saibalaji",
      password: "Parvathala@97046",
    });
    const bucket = cluster.bucket('travel-sample');  // Use the existing bucket
    const collection = bucket.defaultCollection();   // Use the default collection

    const key = `myapp::user::${email}`;  // Unique key pattern for users
    const result = await collection.get(key);
    const user = result.content;

    if (user.password === password) {
      delete user.password;  // Don’t send the password back
      res.status(200).json(user);
    } else {
      res.status(401).json({ error: 'Wrong email or password' });
    }
  } catch (error: any) {
    if (error.name === 'DocumentNotFoundException') {
      res.status(401).json({ error: 'Wrong email or password' });
    } else {
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
}
