import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { ProfilePhotoSection } from "@/components/profile/ProfilePhotoSection";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { MyLostItems } from "@/components/profile/MyLostItems";
import { User, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default async function ProfilePage() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    redirect("/sign-in");
  }

  const isProfileIncomplete =
    !dbUser.skills || dbUser.skills.length === 0 || !dbUser.interests || dbUser.interests.length === 0;

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={dbUser.name}
          userImageUrl={dbUser.profileImage}
          googleImageUrl={dbUser.googleImage}
        />

        <main className="flex-1 p-6 md:p-10 max-w-4xl w-full mx-auto space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-0.5 border-indigo-500/40 text-indigo-400 bg-indigo-950/30">
                  <User className="w-3.5 h-3.5 mr-1" /> Student Profile
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Your Campus Profile
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage your skills, interests, bio, profile photo, and reported lost items.
              </p>
            </div>
          </div>

          {/* Setup Completion Prompt Banner */}
          {isProfileIncomplete && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Complete Your Profile Setup</p>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Add at least one skill and interest below so UniNest can match you with relevant hackathon teams and campus events.
                </p>
              </div>
            </div>
          )}

          {/* Profile Photo Header Section */}
          <ProfilePhotoSection
            initialImageUrl={dbUser.profileImage}
            googleImageUrl={dbUser.googleImage}
            userName={dbUser.name}
          />

          {/* Profile Form */}
          <ProfileForm
            initialData={{
              name: dbUser.name,
              bio: dbUser.bio || "",
              skills: dbUser.skills || [],
              interests: dbUser.interests || [],
              projects: dbUser.projects || [],
            }}
          />

          {/* My Lost Items Section */}
          <MyLostItems />
        </main>
      </div>
    </div>
  );
}
