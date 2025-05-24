// src/utils/cbAuth.ts
import bcrypt from 'bcryptjs';

const CB_QUERY_URL = "https://cb.drr3tmw3bgdgggid.cloud.couchbase.com:18093/query/service";
// *** INLINE YOUR COUCHBASE USER & PASS HERE ***
const CB_USER = "saibalaji";
const CB_PASS = "Parvathala@97046";
const CB_AUTH = btoa(`${CB_USER}:${CB_PASS}`);

async function runQuery(
  statement: string,
  args?: Record<string, any>
): Promise<any[]> {
  const body = new URLSearchParams({ statement });
  if (args) body.append("args", JSON.stringify(args));

  const res = await fetch(CB_QUERY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${CB_AUTH}`,
    },
    body: body.toString(),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e: any) => e.msg).join(", "));
  }
  return json.results || json.rows;
}

export async function cbSignup(
  name: string,
  email: string,
  password: string,
  phone: string
) {
  const key = `user::${email}`;

  // check for existing user
  try {
    await runQuery(
      `SELECT META().id FROM \`travel-sample\` USE KEYS [$key]`,
      { key }
    );
    throw new Error("Email already in use");
  } catch (err: any) {
    if (!/not found/i.test(err.message)) throw err;
  }

  // hash & insert
  const passwordHash = bcrypt.hashSync(password, 10);
  const userDoc = {
    type: "user",
    name,
    email,
    phone,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  await runQuery(
    `INSERT INTO \`travel-sample\` (KEY, VALUE) VALUES ($key, $doc)`,
    { key, doc: userDoc }
  );
}

export async function cbLogin(
  email: string,
  password: string
): Promise<{ name: string; email: string }> {
  const key = `user::${email}`;
  const rows = await runQuery(
    `SELECT name, passwordHash FROM \`travel-sample\` USE KEYS [$key]`,
    { key }
  );
  if (!rows.length) throw new Error("Invalid credentials");

  const { name, passwordHash } = rows[0];
  if (!bcrypt.compareSync(password, passwordHash)) {
    throw new Error("Invalid credentials");
  }
  return { name, email };
}
