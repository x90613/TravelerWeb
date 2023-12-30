"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

// Run: npx shadcn-ui@latest add button
import { Button } from "@/components/ui/button";
// Run: npx shadcn-ui@latest add card
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { publicEnv } from "@/lib/env/public";

function AuthForm() {
  return (
    <>
      <Card className="min-w-[300px] justify-center">
        <CardHeader>
          <CardTitle>Sign {"In"}</CardTitle>
        </CardHeader>
        <CardContent className=" flex flex-col gap-2">
          <Button
            onClick={async () => {
              // TODO: sign in with google
              signIn("google", {
                callbackUrl: `${publicEnv.NEXT_PUBLIC_BASE_URL}/plan`,
              });
            }}
            className="flex w-full"
            variant={"outline"}
          >
            {/* Remember to copy "github.png" to ./public folder */}
            <Image src="/google.png" alt="google icon" width={20} height={20} />
            <span className="grow">Sign In with google</span>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

export default AuthForm;
