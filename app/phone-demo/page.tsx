"use client";
import { useEffect } from "react";
import { usePhone } from "@/lib/phone-state";
import PhoneFrame from "@/components/PhoneFrame";
import PhoneApp from "@/components/phone/PhoneApp";
import PhoneEngine from "@/components/phone/PhoneEngine";

export default function PhoneDemoPage() {
  const { osDark, pulse } = usePhone();
  useEffect(() => {
    usePhone.persist.rehydrate();
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col items-center gap-8 px-4 pb-32 pt-28 lg:flex-row lg:items-start lg:justify-center lg:gap-12 md:pb-16">
      <div className="flex flex-col items-center">
        <PhoneEngine />
        <PhoneFrame dark={osDark} pulse={pulse}>
          <PhoneApp />
        </PhoneFrame>
        <p className="mt-4 max-w-sm text-center text-xs text-muted">Simulated phone. Nothing here touches your real contacts, location or battery.</p>
      </div>
    </main>
  );
}
