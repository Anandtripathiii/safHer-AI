"use client";
import { useEffect } from "react";
import { usePhone } from "@/lib/phone-state";
import PhoneFrame from "@/components/PhoneFrame";
import PhoneApp from "@/components/phone/PhoneApp";
import PhoneEngine from "@/components/phone/PhoneEngine";
import JudgeControls from "@/components/JudgeControls";
import WatcherPhone from "@/components/phone/WatcherPhone";
import AutoDemo from "@/components/AutoDemo";
import { useApp } from "@/lib/store";
import { useSafeWordListener } from "@/lib/voice";

export default function PhoneDemoPage() {
  const { osDark, pulse, fireSOS, sos } = usePhone();
  const safeWord = useApp((s) => s.safeWord);
  // The phone listens in the background too: saying the safe word fires a full SOS.
  useSafeWordListener(!sos, safeWord, () => fireSOS("Safe word heard"));
  useEffect(() => {
    usePhone.persist.rehydrate();
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col items-center gap-8 px-4 pb-32 pt-28 lg:flex-row lg:items-start lg:justify-center lg:gap-12 md:pb-16">
      {/* Sticky on desktop so the phone stays in view while judges scroll the controls. */}
      <div className="flex flex-col items-center lg:sticky lg:top-24">
        <PhoneEngine />
        <PhoneFrame dark={osDark} pulse={pulse} onPowerHold={() => fireSOS("Side button held", true)}>
          <PhoneApp />
        </PhoneFrame>
        <p className="mt-4 max-w-sm text-center text-xs text-muted">Simulated phone. Nothing here touches your real contacts, location or battery.</p>
      </div>
      <AutoDemo />
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        {/* Both mirror the same journey: Mom watching from home, Priya on the same group trip. */}
        <div className="flex flex-wrap justify-center gap-4">
          <WatcherPhone contactId="mom" scale={0.45} />
          <WatcherPhone contactId="priya" group scale={0.45} />
        </div>
        <JudgeControls />
      </div>
    </main>
  );
}
