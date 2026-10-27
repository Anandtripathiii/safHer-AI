"use client";
import { useState } from "react";
import { Pencil, Phone, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import type { Contact } from "@/lib/seed";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

const COLORS = ["#E195AB", "#7FA7E0", "#B79CE6", "#4CAF8B", "#F2B23D", "#E58F6A"];
const blank = (): Contact => ({ id: "", name: "", initials: "", phone: "", relation: "", color: COLORS[Math.floor(Math.random() * COLORS.length)] });
const initialsOf = (n: string) => n.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function ContactsPage() {
  const { contacts, saveContact, removeContact } = useApp();
  const [edit, setEdit] = useState<Contact | null>(null);
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
          <p className="mt-1 text-sm text-muted">Alerted in this order. If someone doesn't reply within 20 seconds, we move on to your escalation contact.</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setEdit(blank())}><Plus size={18} /> Add</button>
      </div>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Alerted first</h2>
        <ul className="mt-1 divide-y divide-line">{primary.map((c, i) => <Row key={c.id} c={c} i={i} />)}</ul>
      </section>
      <section className="mt-8 rounded-card bg-success/10 px-4 pt-3">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-success"><ShieldCheck size={16} /> Escalation</h2>
        <ul className="divide-y divide-line">{escalation.map((c) => <Row key={c.id} c={c} />)}</ul>
        {!escalation.length && <p className="pb-4 text-sm text-muted">Mark a contact as an escalation contact to have a backup when someone doesn't respond.</p>}
      </section>

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
