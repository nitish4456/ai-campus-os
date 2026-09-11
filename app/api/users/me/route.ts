import { NextResponse } from 'next/server';
import { getCurrentDbUser } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { profileUpdateSchema } from '@/lib/validations/schemas';

export async function GET() {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = profileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, bio, skills, interests, projects } = validationResult.data;

    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: dbUser.clerkId },
      {
        $set: {
          name,
          bio,
          skills,
          interests,
          projects,
        },
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
