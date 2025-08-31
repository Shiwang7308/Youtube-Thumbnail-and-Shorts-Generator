import { NextRequest, NextResponse } from 'next/server';

// Get demo credentials from environment variables
const DEMO_CREDENTIALS = {
  email: process.env.DEMO_EMAIL || '',
  password: process.env.DEMO_PASSWORD || ''
};

// Check authentication status (GET request)
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      const decoded = Buffer.from(authToken, 'base64').toString();
      const [email, timestamp] = decoded.split(':');
      
      if (email === DEMO_CREDENTIALS.email) {
        return NextResponse.json({ 
          authenticated: true, 
          user: { email, name: 'Demo User' }
        });
      } else {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate credentials against environment variables
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      // Create a simple session token (in production, use proper JWT)
      const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          email: email,
          name: 'Demo User'
        }
      });

      // Set HTTP-only cookie for authentication
      response.cookies.set('auth-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    } else {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
