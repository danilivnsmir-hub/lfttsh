
import { NextRequest, NextResponse } from 'next/server';
import { serverDataManager } from '@/lib/server-data';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const exercises = await serverDataManager.getExercises();
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, muscle_group } = await request.json();

    if (!name || !muscle_group) {
      return NextResponse.json(
        { error: 'Name and muscle_group are required' },
        { status: 400 }
      );
    }

    const exercise = await serverDataManager.createExercise(name, muscle_group);
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'Exercise with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
