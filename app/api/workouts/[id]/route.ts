
import { NextRequest, NextResponse } from 'next/server';
import { serverDataManager } from '@/lib/server-data';

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workoutId = parseInt(params.id);
    
    if (isNaN(workoutId)) {
      return NextResponse.json(
        { error: 'Invalid workout ID' },
        { status: 400 }
      );
    }

    const workouts = await serverDataManager.getWorkouts();
    const workout = workouts.find(w => w.id === workoutId);

    if (!workout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout' },
      { status: 500 }
    );
  }
}
