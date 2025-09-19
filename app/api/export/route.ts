
import { NextRequest, NextResponse } from 'next/server';
import { serverDataManager } from '@/lib/server-data';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const csvContent = await serverDataManager.exportWorkouts();

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="workout_history.csv"'
      }
    });
  } catch (error) {
    console.error('Error exporting workouts:', error);
    return NextResponse.json(
      { error: 'Failed to export workouts' },
      { status: 500 }
    );
  }
}
