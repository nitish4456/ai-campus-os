import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const revalidate = 0;

export default async function DashboardPage() {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    redirect("/sign-in");
  }

  // Redirect to profile setup if profile is empty
  const isProfileEmpty =
    (!dbUser.skills || dbUser.skills.length === 0) &&
    (!dbUser.interests || dbUser.interests.length === 0);

  if (isProfileEmpty) {
    redirect("/profile");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header userName={dbUser.name} />

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          <DashboardClient userName={dbUser.name} />
        </main>
      </div>
    </div>
  );
}
