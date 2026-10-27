"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Map as MapIcon, Siren, UsersRound, UserRound, Phone } from "lucide-react";
import { usePhone, favouriteContacts, type Tab } from "@/lib/phone-state";
import { cn } from "@/lib/utils";
import StatusBar from "../StatusBar";
import HomeScreen from "./HomeScreen";
import MapScreen from "./MapScreen";
import SosScreen from "./SosScreen";
import ContactsScreen from "./ContactsScreen";
import { Decoy, LocationPrompt, PhoneToast, Springboard } from "./PhoneSystem";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "sos", label: "SOS", icon: Siren },
  { id: "contacts", label: "Contacts", icon: UsersRound },
  { id: "profile", label: "Profile", icon: UserRound },
];

const SCREENS: Partial<Record<Tab, () => JSX.Element>> = { home: HomeScreen, map: MapScreen, sos: SosScreen, contacts: ContactsScreen };

function TabBar() {
  const { tab, set, favourites, say } = usePhone();
  const [quick, setQuick] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);
  const favs = favouriteContacts(favourites).slice(0, 3);

  return (
    <div className="relative z-[40] shrink-0 border-t border-line/70 bg-surface pb-6 pt-1">
      <AnimatePresence>
        {quick && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-full left-3 mb-2 w-64 rounded-3xl bg-surface p-3 shadow-md ring-1 ring-line">
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">Quick dial</p>
            {favs.length ? favs.map((c) => (
              <button key={c.id} onClick={() => { setQuick(false); say(`Calling ${c.name}… (simulated)`); }} className="mt-1 flex h-14 w-full items-center gap-3 rounded-2xl px-2 active:bg-pink-soft/60">
                <span className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white" style={{ background: c.color }}>{c.initials}</span>
                <span className="flex-1 text-left text-[16px] font-medium">{c.name}</span>
                <Phone size={20} className="text-success" />
              </button>
            )) : <p className="p-2 text-sm text-muted">Star up to 5 favourites in Contacts to quick-dial them here.</p>}
            <button onClick={() => setQuick(false)} className="mt-1 h-11 w-full rounded-2xl text-sm text-muted active:bg-bg">Close</button>
          </motion.div>
        )}
      </AnimatePresence>
      <nav className="flex items-end justify-around px-2" aria-label="App">
        {TABS.map((t) => {
          const active = tab === t.id;
          if (t.id === "sos") {
            return (
              <button key={t.id} onClick={() => set({ tab: "sos" })} aria-label="SOS" className="-mt-7 grid h-[68px] w-[68px] place-items-center rounded-full bg-pink-strong text-white shadow-md ring-4 ring-surface active:scale-95">
                <Siren size={28} strokeWidth={2.4} />
              </button>
            );
          }
          return (
            <button
              key={t.id}
              aria-label={t.label}
              aria-current={active ? "page" : undefined}
              onPointerDown={() => {
                longPressed.current = false;
                if (t.id === "home") hold.current = setTimeout(() => { longPressed.current = true; setQuick(true); navigator.vibrate?.(30); }, 550);
              }}
              onPointerUp={() => hold.current && clearTimeout(hold.current)}
              onPointerLeave={() => hold.current && clearTimeout(hold.current)}
              onClick={() => { if (!longPressed.current) { setQuick(false); set({ tab: t.id }); } }}
              onContextMenu={(e) => e.preventDefault()}
              className={cn("flex h-14 w-16 select-none flex-col items-center justify-center gap-0.5 text-[11px] font-medium", active ? "text-pink-strong" : "text-muted")}
            >
              <t.icon size={24} strokeWidth={active ? 2.4 : 2} />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/** The SafeHer app as it runs on the phone: status bar, current screen and tab bar. */
export default function PhoneApp() {
  const { tab, fireSOS } = usePhone();
  const Screen = SCREENS[tab];
  const taps = useRef<{ t: number; x: number; y: number }[]>([]);

  // Silent SOS: three quick taps in roughly the same spot, anywhere on screen.
  const onTap = (e: React.PointerEvent) => {
    const now = Date.now();
    const recent = taps.current.filter((p) => now - p.t < 700 && Math.hypot(p.x - e.clientX, p.y - e.clientY) < 40);
    taps.current = [...recent, { t: now, x: e.clientX, y: e.clientY }];
    if (taps.current.length >= 3) { taps.current = []; fireSOS("Silent triple-tap", true); }
  };

  return (
    <div className="contents" onPointerDownCapture={onTap}>
      <StatusBar />
      {/* Not `relative`: in-app sheets position against the whole phone screen. */}
      <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {Screen ? <Screen /> : <div className="p-5 text-muted">Loading…</div>}
      </main>
      <TabBar />
      <PhoneToast />
      <LocationPrompt />
      <Springboard />
      <Decoy />
    </div>
  );
}
