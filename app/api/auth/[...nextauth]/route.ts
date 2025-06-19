import NextAuth from 'next-auth/next';

export const dynamic = 'force-dynamic';

import { authOptions } from 'src/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 
