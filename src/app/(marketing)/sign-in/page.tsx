import SignIn from "@/components/auth/sign-in";

export default function SignInPage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-[80vh] w-full py-20 px-5">
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-2">
        Sign in to Badget
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Welcome back! Please enter your email and password to continue.
      </p>
      <SignIn />
    </main>
  );
}
