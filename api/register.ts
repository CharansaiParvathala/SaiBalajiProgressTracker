import express, { Request, Response } from 'express';
import couchbase from 'couchbase';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

// Couchbase connection
const cluster = new couchbase.Cluster('couchbase://localhost', {
  username: 'your-username',
  password: 'your-password',
});
const bucket = cluster.bucket('your-bucket-name');
const collection = bucket.defaultCollection();

// User interface matching frontend expectations
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
}

// Signup endpoint
app.post('/api/register', async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  // Input validation
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const query = `SELECT * FROM \`${bucket.name}\` WHERE email = $1`;
    const options = { parameters: [email] };
    const result = await cluster.query(query, options);

    if (result.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      phone,
    };

    // Insert user into Couchbase
    await collection.insert(newUser.id, newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
