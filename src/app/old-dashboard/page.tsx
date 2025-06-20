import { signOut, getUser } from "@/actions/auth-actions";
import { ensureAppUser, getUserFamilies } from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateFamilyDialog } from "@/components/create-family-dialog";

export default async function Dashboard() {
  // Use the recommended AppUser system for business logic
  const appUser = await ensureAppUser(); // This will redirect if not authenticated
  const authUser = await getUser(); // Get auth user for basic info like email
  const families = await getUserFamilies();

  console.log("AppUser:", appUser);
  console.log("AuthUser:", authUser);
  console.log("Families:", families);

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            {appUser.firstName || authUser?.name || authUser?.email}!
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button variant="outline" type="submit">
            Sign Out
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Name:</strong>{" "}
              {appUser.firstName && appUser.lastName
                ? `${appUser.firstName} ${appUser.lastName}`
                : authUser?.name || "Not set"}
            </div>
            <div>
              <strong>Email:</strong> {authUser?.email}
            </div>
            <div>
              <strong>Timezone:</strong> {appUser.timezone}
            </div>
            <div>
              <strong>Locale:</strong> {appUser.locale}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <Badge variant="secondary">{appUser.status}</Badge>
            </div>
            <div>
              <strong>Member Since:</strong>{" "}
              {new Date(appUser.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" variant="default">
              Edit Profile
            </Button>
            <Button className="w-full" variant="outline">
              Settings
            </Button>
            <Button className="w-full" variant="outline">
              Support
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Families</CardTitle>
          </CardHeader>
          <CardContent>
            {families.length > 0 ? (
              <div className="space-y-3">
                {families.map((family) => (
                  <div
                    key={family.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{family.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Role: <Badge variant="outline">{family.userRole}</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {family.members?.length || 0} member
                      {family.members?.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No families yet</p>
                <CreateFamilyDialog />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
