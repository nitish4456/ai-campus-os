import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db';
import User, { IUser } from '@/models/User';

export async function getCurrentDbUser(): Promise<IUser | null> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  await connectToDatabase();

  let user = await User.findOne({ clerkId: clerkUser.id });

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    '';

  const googleAccount = clerkUser.externalAccounts?.find(
    (acc) => acc.provider === 'google' || acc.provider.includes('google')
  );
  const googleId = googleAccount?.externalId || clerkUser.id;
  const googleImage = clerkUser.imageUrl || (googleAccount as any)?.imageUrl || null;
  const name =
    `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
    clerkUser.username ||
    'Student User';

  if (!user) {
    // Check if account already exists by email to prevent duplicate accounts
    if (primaryEmail) {
      user = await User.findOne({ email: primaryEmail });
    }

    if (user) {
      // Link existing account
      user.clerkId = clerkUser.id;
      if (googleId) user.googleId = googleId;
      if (googleImage && !user.googleImage) user.googleImage = googleImage;
      await user.save();
    } else {
      // Create new user in MongoDB
      user = await User.create({
        clerkId: clerkUser.id,
        googleId: googleId || clerkUser.id,
        name,
        email: primaryEmail,
        googleImage,
        profileImage: null,
        skills: [],
        interests: [],
        bio: '',
        projects: [],
      });
    }
  } else {
    // Update existing user's googleImage or googleId if changed, but keep custom profileImage untouched
    let needsSave = false;
    if (googleImage && user.googleImage !== googleImage) {
      user.googleImage = googleImage;
      needsSave = true;
    }
    if (googleId && !user.googleId) {
      user.googleId = googleId;
      needsSave = true;
    }
    if (needsSave) {
      await user.save();
    }
  }

  return user;
}
