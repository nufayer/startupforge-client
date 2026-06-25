"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card } from "@heroui/react";
import { CheckCircle, Rocket } from "lucide-react";
import { useSession } from "@/lib/auth.client";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { data: session } = useSession();

  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId || !session) return;

    const verify = async () => {
      try {
        const res = await fetch("http://localhost:5000/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": session?.user?.email || "",
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Verification failed");

        setStatus("success");
      } catch (e) {
        setError(e?.message || "Something went wrong");
        setStatus("error");
      }
    };

    verify();
  }, [sessionId, session]);

  return (
    <Card className="bg-zinc-950 border border-zinc-800 p-10 max-w-lg w-full text-center">
      {status === "verifying" && (
        <>
          <div className="w-12 h-12 rounded-full border-t-2 border-l-2 border-violet-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
          <p className="text-zinc-400">Please wait while we confirm your purchase.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="text-green-400 mx-auto mb-4" size={64} />
          <h1 className="text-3xl font-extrabold mb-2">Welcome to Premium!</h1>
          <p className="text-zinc-400 mb-6">
            Your account has been upgraded. You can now post unlimited opportunities.
          </p>
          <Link href="/dashboard">
            <Button color="primary" size="lg" startContent={<Rocket size={18} />}>
              Go to Dashboard
            </Button>
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold mb-2 text-red-400">Verification Failed</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link href="/dashboard">
            <Button color="primary">Go to Dashboard</Button>
          </Link>
        </>
      )}
    </Card>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Suspense fallback={
        <Card className="bg-zinc-950 border border-zinc-800 p-10 max-w-lg w-full text-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-l-2 border-violet-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
        </Card>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
