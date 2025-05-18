import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function getServerSession() {
  const token = cookies().get('twentyToken')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    return { userId: payload.sub as string };
  } catch {
    return null;
  }
}
