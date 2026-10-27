"use client";
import { motion } from "framer-motion";
import { BookUser, Phone, ShieldCheck, Star, UserPlus } from "lucide-react";
import { usePhone, favouriteContacts, MAX_FAVOURITES } from "@/lib/phone-state";
import { useApp } from "@/lib/store";
import { PHONE_CONTACTS } from "@/lib/seed";
import { cn } from "@/lib/utils";
import { Avatar, pbtn } from "./ui";
import Helplines from "../Helplines";

/** Dialer-style grid of favourites — big circles, in SOS escalation order. */
export function FavouritesDialer() {
  const { favourites, say } = usePhone();
  const favs = favouriteContacts(favourites);
  if (!favs.length) return null;
  return (
    <section>
      <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wider text-muted">Favourites · SOS order</h2>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {favs.map((c, i) => (
          <button key={c.id} onClick={() => say(`Calling ${c.name}… (simulated)`)} className="flex flex-col items-center gap-1.5 rounded-3xl py-2 active:bg-pink-soft/40" aria-label={`Call ${c.name}`}>
            <span className="relative">
              <Avatar initials={c.initials} color={c.color} size={68} />
              <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[#7c5cd6] text-[12px] font-bold text-white ring-2 ring-bg">{i + 1}</span>
            </span>
            <span className="max-w-full truncate px-1 text-[14px] font-semibold">{c.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function ContactsScreen() {
  const s = usePhone();
  const trusted = useApp((x) => x.contacts);
  const askOpen = s.contactsPerm === "asking";

  const importContacts = () => s.set({ contactsPerm: "asking" });
  const answer = (allow: boolean) => {
    s.set({ contactsPerm: allow ? "granted" : "denied" });
    if (allow) s.say(`Imported ${PHONE_CONTACTS.length} contacts — star up to ${MAX_FAVOURITES} favourites`, "ok");
  };

  return (
    <div className="space-y-5 px-4 pb-6 pt-1">
      <h1 className="px-1 text-[26px] font-bold">Contacts</h1>
      <Helplines phone />
      <FavouritesDialer />

      <section>
        <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wider text-muted">Trusted circle</h2>
        <ul className="mt-2 overflow-hidden rounded-3xl bg-surface shadow-sm">
          {trusted.map((c, i) => (
            <li key={c.id} className={cn("flex min-h-[64px] items-center gap-3 px-4", i > 0 && "border-t border-line/70")}>
              <Avatar initials={c.initials} color={c.color} size={44} />
              <span className="min-w-0 flex-1"><span className="block text-[16px] font-semibold">{c.name}</span><span className="block truncate text-[13px] text-muted">{c.relation}</span></span>
              {c.escalation && <ShieldCheck size={20} className="text-success" aria-label="Escalation contact" />}
            </li>
          ))}
        </ul>
      </section>

      {s.contactsPerm !== "granted" ? (
        <section className="rounded-3xl bg-surface p-4 shadow-sm">
          <BookUser size={28} className="text-pink-strong" />
          <p className="mt-2 text-[17px] font-bold">Import from phone contacts</p>
          <p className="mt-1 text-[14px] text-muted">Pick up to {MAX_FAVOURITES} favourites. They're alerted first in an SOS.</p>
          {s.contactsPerm === "denied" && <p className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-[14px] font-semibold text-danger">Contacts access is off. You can turn it back on below.</p>}
          <button className={cn(pbtn.primary, "mt-3")} onClick={s.contactsPerm === "denied" ? () => s.set({ contactsPerm: "unasked" }) : importContacts}>
            <UserPlus size={20} /> {s.contactsPerm === "denied" ? "Ask again" : "Import from phone contacts"}
          </button>
        </section>
      ) : (
        <section>
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted">Phone contacts</h2>
            <span className="text-[13px] font-semibold text-[#7c5cd6]">{s.favourites.length}/{MAX_FAVOURITES} favourites</span>
          </div>
          <ul className="mt-2 overflow-hidden rounded-3xl bg-surface shadow-sm">
            {PHONE_CONTACTS.map((c, i) => {
              const fav = s.favourites.includes(c.id);
              return (
                <li key={c.id} className={cn("flex min-h-[64px] items-center gap-3 pl-4 pr-1", i > 0 && "border-t border-line/70")}>
                  <Avatar initials={c.initials} color={c.color} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[16px] font-semibold">
                      <span className="truncate">{c.name}</span>
                      {fav && <span className="shrink-0 rounded-full bg-[#7c5cd6] px-1.5 py-0.5 text-[10px] font-bold text-white">#{s.favourites.indexOf(c.id) + 1}</span>}
                    </span>
                    <span className="block truncate text-[13px] text-muted">{c.relation} · {c.phone}</span>
                  </span>
                  <button onClick={() => s.say(`Calling ${c.name}… (simulated)`)} aria-label={`Call ${c.name}`} className="grid h-12 w-12 place-items-center rounded-full text-success active:bg-success/10"><Phone size={20} /></button>
                  <button onClick={() => s.toggleFavourite(c.id)} aria-pressed={fav} aria-label={fav ? `Remove ${c.name} from favourites` : `Add ${c.name} to favourites`} className="grid h-14 w-14 place-items-center rounded-full active:bg-[#7c5cd6]/10">
                    <Star size={26} className={fav ? "fill-[#7c5cd6] text-[#7c5cd6]" : "text-muted"} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {askOpen && (
        <div className="absolute inset-0 z-[78] grid place-items-center bg-black/45 px-8">
          <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} role="alertdialog" aria-label="Contacts permission" className="w-full overflow-hidden rounded-[22px] bg-surface/95 text-center backdrop-blur">
            <div className="px-5 pb-4 pt-5">
              <BookUser size={28} className="mx-auto text-pink-strong" />
              <p className="mt-2 text-[17px] font-semibold leading-snug">“SafeHer AI” would like to access your contacts</p>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">Only the people you star are ever alerted. Nobody is contacted when you import.</p>
            </div>
            <div className="grid grid-cols-2 border-t border-line">
              <button onClick={() => answer(false)} className="h-12 text-[17px] text-[#2F7BF6] active:bg-bg">Deny</button>
              <button onClick={() => answer(true)} className="h-12 border-l border-line text-[17px] font-semibold text-[#2F7BF6] active:bg-bg">Allow</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
