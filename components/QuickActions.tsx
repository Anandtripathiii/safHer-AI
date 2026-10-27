"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MapPinned, PhoneIncoming, Share2, Siren, Zap, X } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./ui/sheet";

export default function QuickActions() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { fakeCallAt, fakeCaller, fakeCallDelay, sharing, set, startSharing } = useApp();
  const now = useNow(1000);
  if (path === "/sos" || path === "/assistant") return null;

  const scheduleCall = () => {
    set({ fakeCallAt: Date.now() + fakeCallDelay * 1000 });
    setOpen(false);
    toast(`${fakeCaller} will call in ${fakeCallDelay} seconds`, { description: "Put your phone away — it'll ring like a real call." });
  };
  const item = "flex w-full items-center gap-4 rounded-2xl border border-line p-4 text-left transition hover:bg-pink-soft/40 hover:shadow-sm";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Quick actions"
        // On mobile the map screens use the bottom of the screen for their sheet.
        className={`fixed bottom-24 right-4 z-[995] ${["/journey", "/map"].includes(path) ? "hidden md:grid" : "grid"} h-14 w-14 place-items-center rounded-full bg-pink-strong text-white shadow-md transition hover:brightness-95 md:bottom-6 md:right-6`}
      >
        <Zap size={22} />
        {fakeCallAt && (
          <span className="absolute -top-1 -right-1 rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
            {Math.max(0, Math.ceil((fakeCallAt - now) / 1000))}s
          </span>
        )}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-lg">
          <SheetTitle>Quick actions</SheetTitle>
          <SheetDescription>One tap, no fuss.</SheetDescription>
          <div className="mt-5 grid gap-2">
            {fakeCallAt ? (
              <button className={item} onClick={() => { set({ fakeCallAt: null }); toast("Fake call cancelled"); }}>
                <X size={24} className="text-muted" />
                <span><b className="block">Cancel fake call</b><span className="text-sm text-muted">Ringing in {Math.max(0, Math.ceil((fakeCallAt - now) / 1000))}s</span></span>
              </button>
            ) : (
              <button className={item} onClick={scheduleCall}>
                <PhoneIncoming size={24} className="text-pink-strong" />
                <span><b className="block">Call {fakeCaller} in {fakeCallDelay} sec</b><span className="text-sm text-muted">A realistic incoming call to help you step away</span></span>
              </button>
            )}
            <button className={item} onClick={() => { if (!sharing) startSharing(); setOpen(false); toast.success("Sharing live location", { description: "Your trusted contacts can see you for the next 60 min." }); }}>
              <Share2 size={24} className="text-pink-strong" />
              <span><b className="block">{sharing ? "Location is being shared" : "Share live location"}</b><span className="text-sm text-muted">With Mom, Dad and Priya</span></span>
            </button>
            <Link href="/map" onClick={() => setOpen(false)} className={item}>
              <MapPinned size={24} className="text-pink-strong" />
              <span><b className="block">Nearest help point</b><span className="text-sm text-muted">Police, pharmacies, metro, 24×7 cafés</span></span>
            </Link>
            <Link href="/sos" onClick={() => setOpen(false)} className={`${item} border-danger/30`}>
              <Siren size={24} className="text-danger" />
              <span><b className="block text-danger">Open SOS</b><span className="text-sm text-muted">Or press Ctrl+Shift+S anywhere</span></span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
