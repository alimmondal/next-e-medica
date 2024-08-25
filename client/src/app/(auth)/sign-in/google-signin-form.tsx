"use client";
import { Button } from "@/components/ui/button";
// import { SignInWithGoogle } from "@/lib/actions/user.actions";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useFormStatus } from "react-dom";

export default function GoogleSignInForm() {
  const { pending } = useFormStatus();
  const SignInButton = () => {
    return (
      <Button disabled={pending} className="w-full" variant="default">
        {pending ? "Redirecting to Google..." : "Sign In with Google"}
      </Button>
    );
  };

  return (
    <>
      {/* <form action={SignInWithGoogle}> */}
      {/* <SignInButton /> */}
      <Button
        className="py-2 btn btn-circle w-full flex gap-3 items-center justify-center"
        onClick={() =>
          signIn("google", {
            callbackUrl: "http://localhost:3000/admin/overview",
          })
        }
      >
        {pending ? "Redirecting to Google..." : "Sign In with Google"}
        <Image
          src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-webinar-optimizing-for-success-google-business-webinar-13.png"
          width={50}
          height={50}
          alt="google logo"
        />
      </Button>
      {/* </form> */}
    </>
  );
}
