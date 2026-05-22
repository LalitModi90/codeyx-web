import { NextResponse } from 'next/server';

const TAKEN_USERNAMES = [
  'alex',
  'john',
  'dev_pro',
  'coderyx',
  'admin',
  'lalit',
  'coder',
  'google_dev',
  'next_coder'
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.toLowerCase() || '';

  // Validate basic rules
  if (!username || username.length < 4) {
    return NextResponse.json({ 
      available: false, 
      error: 'Username must be at least 4 characters long.' 
    });
  }

  const validFormat = /^[a-zA-Z0-9_]+$/.test(username);
  if (!validFormat) {
    return NextResponse.json({ 
      available: false, 
      error: 'Only letters, numbers, and underscores are allowed.' 
    });
  }

  // Check if taken
  const isTaken = TAKEN_USERNAMES.includes(username);

  if (isTaken) {
    // Generate suggestions
    const suggestions = [
      `${username}_dev`,
      `${username}_codes`,
      `${username}_47`
    ];

    return NextResponse.json({ 
      available: false, 
      suggestions 
    });
  }

  return NextResponse.json({ 
    available: true 
  });
}
