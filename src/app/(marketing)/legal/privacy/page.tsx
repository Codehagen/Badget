import { siteConfig } from "@/lib/config";

export default function PrivacyPolicyPage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-[80vh] w-full py-20 px-5 space-y-6">
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground max-w-2xl text-center">
        This is a placeholder privacy policy for {siteConfig.name}. Update this page with the actual policy before launch.
      </p>
    </main>
  );
}
