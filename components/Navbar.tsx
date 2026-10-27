"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookUser, Bot, History, Home, LayoutDashboard, Map, MapPin, Moon, Navigation, Search, Settings, ShieldHalf, Siren, Smartphone, Sun, Users, CircleHelp, PlayCircle,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { LANGS, t, type Key } from "@/lib/i18n";
import { LANDMARKS } from "@/lib/seed";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";
import { useDeviceBattery } from "@/lib/hooks";
import { BatteryGlyph } from "./StatusBar";
import Logo from "./Logo";
import { AUTO_DEMO_EVENT } from "./AutoDemo";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./ui/sheet";

export const NAV: { href: string; key: Key; icon: typeof Home }[] = [
  { href: "/journey", key: "journey", icon: Navigation },
  { href: "/map", key: "map", icon: Map },
  { href: "/sos", key: "sos", icon: Siren },
  { href: "/assistant", key: "assistant", icon: Bot },
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/phone-demo", key: "phoneDemo", icon: Smartphone },
];

const MORE: { href: string; key: Key; icon: typeof Home }[] = [
  { href: "/contacts", key: "contacts", icon: BookUser },
  { href: "/community", key: "community", icon: Users },
  { href: "/history", key: "history", icon: History },
  { href: "/settings", key: "settings", icon: Settings },
];

export const SHORTCUTS = [
  ["Ctrl + Shift + S", "Send SOS from any page"],
  ["Ctrl + Shift + D", "Toggle demo mode"],
  ["Ctrl + Shift + X", "Cancel active alert (false alarm)"],
  ["Ctrl + Shift + F", "Fake call now"],
  ["Ctrl + K", "Search"],
  ["Esc", "Close drawers and dialogs"],
];

function IconLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-xl border-2 transition duration-200 ease-out",
        active ? "border-pink-strong text-pink-strong" : "border-transparent text-muted hover:bg-pink-soft/50 hover:text-ink",
        href === "/sos" && !active && "text-danger",
      )}
    >
      <Icon size={18} strokeWidth={2.2} />
    </Link>
  );
}

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { theme, demoMode, lang, set, minimized } = useApp();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [help, setHelp] = useState(false);
  const [q, setQ] = useState("");
  const battery = useDeviceBattery();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    const close = (e: MouseEvent) => menuRef.current && !menuRef.current.contains(e.target as Node) && setMenu(false);
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", key); };
  }, []);

  const isActive = (href: string) => path.startsWith(href);
  const pages = [...NAV, ...MORE].map((n) => ({ href: n.href, label: t(n.key, lang) })).filter((p) => p.label.toLowerCase().includes(q.toLowerCase()));
  const places = q ? LANDMARKS.filter((l) => l.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  const go = (href: string) => { setSearch(false); setQ(""); router.push(href); };

  const roundBtn = "grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-pink-soft/50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-strong";

  // "App minimised" on the web: the whole navbar collapses into one soft-pulsing bubble.
  if (minimized) {
    return (
      <motion.button
        onClick={() => set({ minimized: false })}
        aria-label="SafeHer running — tap to restore"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: [1, 1.05, 1] }}
        transition={{ scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.25 } }}
        className="fixed bottom-6 right-6 z-[1000] flex h-14 items-center gap-2 rounded-full bg-surface pl-2 pr-5 text-sm font-semibold text-ink shadow-md ring-1 ring-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-strong"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-pink-strong text-white"><ShieldHalf size={20} /></span>
        {t("safeherRunning", lang)}
      </motion.button>
    );
  }

  return (
    <>
      <header className="fixed inset-x-3 top-4 z-[1000] mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 rounded-3xl border border-line/70 bg-surface px-3 shadow-sm">
        <Link href="/sos" className="flex items-center gap-2 rounded-xl pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-strong">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-pink-soft text-pink-strong">
            <ShieldHalf size={18} strokeWidth={2.4} />
          </span>
          <Logo className="text-[18px]" />
          {demoMode && <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#9a6a0c] dark:text-warning">DEMO</span>}
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => <IconLink key={n.href} href={n.href} label={t(n.key, lang)} icon={n.icon} active={isActive(n.href)} />)}
        </nav>

        <div className="flex items-center gap-1">
          <label className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 text-xs font-medium text-muted hover:bg-pink-soft/40" title="Demo mode (Ctrl+Shift+D)">
            <span className="hidden sm:inline">{t("demoMode", lang)}</span>
            <Switch checked={demoMode} onCheckedChange={(v) => set({ demoMode: v })} aria-label="Demo mode" />
          </label>
          {battery && (
            <span title={`Device battery${battery.charging ? " · charging" : ""}`} className={cn("mr-1 hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums lg:flex", battery.level < 10 ? "bg-danger/10 text-danger" : battery.level < 20 ? "bg-warning/20 text-[#7a5408]" : "bg-bg text-muted")}>
              <BatteryGlyph level={battery.level} className="text-ink" />{battery.level}%
            </span>
          )}
          <button className={cn(roundBtn, "hidden text-pink-strong sm:grid")} aria-label="Play auto demo" title="Play auto demo (2 min)"
            onClick={() => { if (path === "/phone-demo") window.dispatchEvent(new Event(AUTO_DEMO_EVENT)); else router.push("/phone-demo?auto=1"); }}>
            <PlayCircle size={18} />
          </button>
          <button className={cn(roundBtn, "hidden sm:grid")} onClick={() => setSearch(true)} aria-label={t("search", lang)} title={`${t("search", lang)} (Ctrl+K)`}>
            <Search size={18} />
          </button>
          <button className={roundBtn} onClick={() => set({ theme: theme === "dark" ? "light" : "dark" })} aria-label="Toggle theme" title="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className={cn(roundBtn, "hidden sm:grid")} onClick={() => setHelp(true)} aria-label="Help and shortcuts" title="Help">
            <CircleHelp size={18} />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenu((m) => !m)}
              aria-label="Account menu"
              aria-expanded={menu}
              className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-pink-soft to-pink-strong text-sm font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-strong focus-visible:ring-offset-2"
            >
              AN
            </button>
            {menu && (
              <div className="absolute right-0 top-12 w-60 rounded-2xl border border-line bg-surface p-2 shadow-md">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">Anand Tripathi</p>
                  <p className="text-xs text-muted">Delhi NCR · sample profile</p>
                </div>
                {MORE.map((m) => (
                  <Link key={m.href} href={m.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-pink-soft/50">
                    <m.icon size={18} className="text-muted" /> {t(m.key, lang)}
                  </Link>
                ))}
                <div className="my-1 h-px bg-line sm:hidden" />
                <button onClick={() => { setMenu(false); setSearch(true); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-pink-soft/50 sm:hidden">
                  <Search size={18} className="text-muted" /> {t("search", lang)}
                </button>
                <button onClick={() => { setMenu(false); setHelp(true); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-pink-soft/50 sm:hidden">
                  <CircleHelp size={18} className="text-muted" /> {t("help", lang)}
                </button>
                <div className="my-1 h-px bg-line" />
                <div className="flex items-center gap-1 px-2 py-1.5" role="radiogroup" aria-label={t("language", lang)}>
                  {LANGS.map((l) => (
                    <button key={l.id} role="radio" aria-checked={lang === l.id} onClick={() => set({ lang: l.id })}
                      className={cn("flex-1 rounded-full px-2 py-1.5 text-xs font-semibold", lang === l.id ? "bg-pink-strong text-white" : "text-muted hover:bg-pink-soft/50")}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile: the six main destinations move to a bottom pill, within thumb reach. */}
      <nav aria-label="Main" className="fixed inset-x-3 bottom-3 z-[1000] mx-auto flex h-16 max-w-md items-center justify-around rounded-3xl border border-line/70 bg-surface px-2 shadow-md md:hidden">
        {NAV.map((n) => <IconLink key={n.href} href={n.href} label={t(n.key, lang)} icon={n.icon} active={isActive(n.href)} />)}
      </nav>

      <Sheet open={search} onOpenChange={setSearch}>
        <SheetContent>
          <SheetTitle>{t("search", lang)}</SheetTitle>
          <SheetDescription>Jump to a screen or plan a trip to a place.</SheetDescription>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “map”, “history” or “Nehru Place”" className="input mt-4" />
          <div className="mt-4 space-y-1">
            {pages.map((p) => (
              <button key={p.href} onClick={() => go(p.href)} className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm hover:bg-pink-soft/50">{p.label}</button>
            ))}
            {places.map((l) => (
              <button key={l.id} onClick={() => go(`/journey?to=${l.id}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-pink-soft/50">
                <MapPin size={18} className="text-pink-strong" />
                <span>Plan a trip to <b>{l.name}</b> <span className="text-muted">· {l.area}</span></span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={help} onOpenChange={setHelp}>
        <SheetContent>
          <SheetTitle>{t("help", lang)}</SheetTitle>
          <SheetDescription>SafeHer is a hackathon prototype. All people, places and alerts are sample data, and it never contacts real emergency services.</SheetDescription>
          <dl className="mt-6 divide-y divide-line">
            {SHORTCUTS.map(([k, d]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm">{d}</dt>
                <dd><kbd className="whitespace-nowrap rounded-lg border border-line bg-bg px-2 py-1 text-xs font-medium">{k}</kbd></dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 rounded-2xl bg-pink-soft/40 p-4 text-sm">In a real emergency in India, dial <b>112</b>. Women helpline: <b>1091</b>.</p>
        </SheetContent>
      </Sheet>
    </>
  );
}
