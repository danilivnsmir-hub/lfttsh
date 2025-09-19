

import { NextRequest, NextResponse } from 'next/server';
import { serverDataManager } from '@/lib/server-data';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const exercises = await serverDataManager.getExercisesFromWorkouts();
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises from workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises from workouts' },
      { status: 500 }
    );
  }
}
