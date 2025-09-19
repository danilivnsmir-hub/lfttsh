
import { NextRequest, NextResponse } from 'next/server';
import { serverDataManager } from '@/lib/server-data';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exercise_id');

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'exercise_id parameter is required' },
        { status: 400 }
      );
    }

    const exerciseIdNum = parseInt(exerciseId);
    if (isNaN(exerciseIdNum)) {
      return NextResponse.json(
        { error: 'Invalid exercise_id' },
        { status: 400 }
      );
    }

    const statistics = await serverDataManager.getStatistics(exerciseIdNum);
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
