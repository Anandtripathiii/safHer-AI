"use client";
import { useState } from "react";
import { BookUser, Pencil, Phone, Plus, ShieldCheck, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { PHONE_CONTACTS, type Contact } from "@/lib/seed";
import { usePhone, MAX_FAVOURITES } from "@/lib/phone-state";
import Helplines from "@/components/Helplines";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

const COLORS = ["#E195AB", "#7FA7E0", "#B79CE6", "#4CAF8B", "#F2B23D", "#E58F6A"];
const blank = (): Contact => ({ id: "", name: "", initials: "", phone: "", relation: "", color: COLORS[Math.floor(Math.random() * COLORS.length)] });
const initialsOf = (n: string) => n.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function ContactsPage() {
  const { contacts, saveContact, removeContact } = useApp();
  const [edit, setEdit] = useState<Contact | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const phone = usePhone();
  const imported = phone.contactsPerm === "granted";
  const toggleStar = (c: (typeof PHONE_CONTACTS)[number]) => {
    const on = phone.favourites.includes(c.id);
    if (!on && phone.favourites.length >= MAX_FAVOURITES) return toast.error(`You can pick up to ${MAX_FAVOURITES} favourites`);
    phone.toggleFavourite(c.id);
    toast(on ? `${c.name} removed from favourites` : `${c.name} is now alerted first in an SOS`);
  };
  const primary = contacts.filter((c) => !c.escalation);
  const escalation = contacts.filter((c) => c.escalation);

  const save = () => {
    if (!edit) return;
    if (!edit.name.trim()) return toast.error("Add a name");
    if (!/^[+\d][\d\s-]{6,}$/.test(edit.phone.trim())) return toast.error("Add a valid phone number");
    saveContact({ ...edit, id: edit.id || `c-${Date.now()}`, name: edit.name.trim(), initials: initialsOf(edit.name), relation: edit.relation.trim() || "Trusted contact" });
    toast.success(edit.id ? "Contact updated" : `${edit.name.trim()} added to your circle`);
    setEdit(null);
  };

  const Row = ({ c, i }: { c: Contact; i?: number }) => (
    <li className="flex items-center gap-4 py-4">
      {i !== undefined && <span className="w-5 text-center text-sm font-semibold tabular-nums text-muted">{i + 1}</span>}
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ background: c.color }}>{c.initials}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{c.name}</p>
        <p className="truncate text-sm text-muted">{c.relation} · {c.phone}</p>
      </div>
      <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="btn-ghost hidden h-10 w-10 px-0 sm:inline-flex" aria-label={`Call ${c.name}`} onClick={(e) => { e.preventDefault(); toast("Calling is disabled in this prototype"); }}><Phone size={18} /></a>
      <button className="btn-ghost h-10 w-10 px-0" aria-label={`Edit ${c.name}`} onClick={() => setEdit(c)}><Pencil size={18} /></button>
      <button className="btn-ghost h-10 w-10 px-0 text-danger" aria-label={`Remove ${c.name}`} onClick={() => {
        if (contacts.length <= 1) return toast.error("Keep at least one trusted contact");
        removeContact(c.id);
        toast(`${c.name} removed`, { action: { label: "Undo", onClick: () => saveContact(c) } });
      }}><Trash2 size={18} /></button>
    </li>
  );

  return (
    <main className="mx-auto max-w-2xl px-4 pb-32 pt-28 md:pb-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Trusted contacts</h1>
          <p className="mt-1 text-sm text-muted">{phone.favourites.length ? "Your starred favourites are alerted first, then everyone below in this order." : "Alerted in this order."} If someone doesn't reply within 20 seconds, we move on to your escalation contact.</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {!imported && <button className="btn-secondary" onClick={() => setImportOpen(true)}><BookUser size={18} /> Import contacts</button>}
          <button className="btn-primary" onClick={() => setEdit(blank())}><Plus size={18} /> Add</button>
        </div>
      </div>

      <Helplines className="mt-8" />

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Alerted first</h2>
        <ul className="mt-1 divide-y divide-line">{primary.map((c, i) => <Row key={c.id} c={c} i={i} />)}</ul>
      </section>
      <section className="mt-8 rounded-card bg-success/10 px-4 pt-3">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-success"><ShieldCheck size={16} /> Escalation</h2>
        <ul className="divide-y divide-line">{escalation.map((c) => <Row key={c.id} c={c} />)}</ul>
        {!escalation.length && <p className="pb-4 text-sm text-muted">Mark a contact as an escalation contact to have a backup when someone doesn't respond.</p>}
      </section>

      {imported && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Imported contacts</h2>
            <span className="text-sm font-semibold text-[#7c5cd6]">{phone.favourites.length}/{MAX_FAVOURITES} favourites · alerted first in SOS</span>
          </div>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {PHONE_CONTACTS.map((c) => {
              const fav = phone.favourites.includes(c.id);
              return (
                <li key={c.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${fav ? "border-[#7c5cd6]/40 bg-[#7c5cd6]/5" : "border-line bg-surface"}`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: c.color }}>{c.initials}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="truncate">{c.name}</span>
                      {fav && <span className="shrink-0 rounded-full bg-[#7c5cd6] px-1.5 py-0.5 text-[10px] font-bold text-white">#{phone.favourites.indexOf(c.id) + 1}</span>}
                    </span>
                    <span className="block truncate text-xs text-muted">{c.relation} · {c.phone}</span>
                  </span>
                  <button onClick={() => toggleStar(c)} aria-pressed={fav} aria-label={fav ? `Remove ${c.name} from favourites` : `Make ${c.name} a favourite`} className="grid h-11 w-11 place-items-center rounded-full hover:bg-[#7c5cd6]/10">
                    <Star size={22} className={fav ? "fill-[#7c5cd6] text-[#7c5cd6]" : "text-muted"} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Sheet open={importOpen} onOpenChange={setImportOpen}>
        <SheetContent>
          <SheetTitle>Import contacts</SheetTitle>
          <SheetDescription>On the mobile app this reads your real contacts. Import the sample contacts for this demo?</SheetDescription>
          <p className="mt-4 text-sm text-muted">{PHONE_CONTACTS.length} sample people. Nobody is contacted when you import — you choose up to {MAX_FAVOURITES} favourites, and they're alerted first in an SOS.</p>
          <div className="mt-6 grid gap-2">
            <button className="btn-primary" onClick={() => { phone.set({ contactsPerm: "granted" }); setImportOpen(false); toast.success(`Imported ${PHONE_CONTACTS.length} sample contacts`, { description: `Star up to ${MAX_FAVOURITES} favourites.` }); }}>Yes, import sample contacts</button>
            <button className="btn-ghost" onClick={() => setImportOpen(false)}>Not now</button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent>
          <SheetTitle>{edit?.id ? "Edit contact" : "Add a trusted contact"}</SheetTitle>
          <SheetDescription>They'll only hear from SafeHer when you start a journey or something seems wrong.</SheetDescription>
          {edit && (
            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
              <div><label className="label" htmlFor="cn">Name</label><input id="cn" className="input mt-1.5" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. Neha Didi" autoFocus /></div>
              <div><label className="label" htmlFor="cp">Phone</label><input id="cp" className="input mt-1.5" inputMode="tel" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} placeholder="+91 98XXX XXXXX" /></div>
              <div><label className="label" htmlFor="cr">Relationship</label><input id="cr" className="input mt-1.5" value={edit.relation} onChange={(e) => setEdit({ ...edit, relation: e.target.value })} placeholder="Sister, roommate, hostel warden…" /></div>
              <label className="flex items-center justify-between rounded-2xl bg-bg p-4">
                <span><span className="block text-sm font-medium">Escalation contact</span><span className="text-xs text-muted">Only alerted when others don't respond</span></span>
                <Switch checked={!!edit.escalation} onCheckedChange={(v) => setEdit({ ...edit, escalation: v })} />
              </label>
              <button className="btn-primary w-full" type="submit">Save contact</button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
