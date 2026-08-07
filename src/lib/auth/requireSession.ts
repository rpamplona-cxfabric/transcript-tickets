import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth/auth0';

export const getApiSession = () => auth0.getSession();

export const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
