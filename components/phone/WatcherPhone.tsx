"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Phone, Siren } from "lucide-react";
import { usePhone, phonePosition } from "@/lib/phone-state";
import { useApp } from "@/lib/store";
import { densify } from "@/lib/simulation";
import { useNow } from "@/lib/hooks";
import { fmtClock } from "@/lib/utils";
import PhoneFrame from "../PhoneFrame";
import StatusBar from "../StatusBar";
import { Avatar } from "./ui";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false, loading: () => <div className="h-full w-full bg-pink-soft/20" /> });

/**
 * A trusted contact's phone mirroring the journey live.
 * "Walk with me" = someone watching from home; `group` = a friend on the same shared trip.
 */
export default function WatcherPhone({ contactId = "mom", group = false, scale = 0.5 }: { contactId?: string; group?: boolean; scale?: number }) {
  const s = usePhone();
  const watcher = useApp((x) => x.contacts.find((c) => c.id === contactId) ?? x.contacts[0]);
  const now = useNow(1000);
  const me = phonePosition(s);
  const live = !!(s.journey || s.sos || s.followed);
  const fit = useMemo(() => (s.journey ? densify(s.journey.route, 2) : [[me[0] - 0.005, me[1] - 0.005], [me[0] + 0.005, me[1] + 0.005]] as [number, number][]), [s.journey?.route, s.journey ? 0 : me[0], s.journey ? 0 : me[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{watcher?.name ?? "Mom"}'s view · {group ? "Group journey" : "Walk with me"}</p>
      <PhoneFrame scale={scale} tilt={false}>
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-3">
          <Avatar initials="AN" color="#E195AB" size={52} />
          <div className="min-w-0">
            <p className="text-[20px] font-bold">Anand</p>
            <p className="text-[15px] text-muted">{group ? (live ? "Walking together · one shared trip" : "Join Anand's next trip as a group") : live ? "Sharing live location with you" : "Not sharing right now"}</p>
          </div>
        </div>
        {s.sos && (
          <div className="mx-4 mb-3 rounded-3xl bg-danger p-4 text-white">
            <p className="flex items-center gap-2 text-[22px] font-black"><Siren size={26} />Anand needs help</p>
            <p className="mt-1 text-[16px]">{s.sos.silent ? "Silent SOS — don't call, she may not be able to talk. Watch the map." : `SOS · ${s.sos.source}`} · {fmtClock((now - s.sos.startedAt) / 1000)}</p>
          </div>
        )}
        {s.followed && !s.sos && (
          <div className="mx-4 mb-3 rounded-3xl bg-[#3b1f33] p-4 text-[17px] font-semibold text-white">“I think I'm being followed.” Heading to {s.followed.target}.</div>
        )}
        <div className="relative isolate mx-4 min-h-0 flex-1 overflow-hidden rounded-3xl">
          {live ? (
            <LiveMap routes={s.journey ? [{ id: "w", points: s.journey.route, color: "#E195AB", active: true }] : []} me={me} destination={s.journey?.destPos} showHelp={false} fitTo={fit} padTop={20} />
          ) : (
            <div className="grid h-full place-items-center bg-bg p-6 text-center text-[17px] text-muted">When Anand starts a journey or sends an SOS, you'll see her here live.</div>
          )}
        </div>
        <div className="p-4 pb-8">
          {s.journey && <p className="mb-2 text-center text-[17px] font-semibold">To {s.journey.destName} · {Math.round(s.journey.progress * 100)}%</p>}
          <div className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-success text-[18px] font-bold text-white"><Phone size={22} />Call Anand</div>
        </div>
      </PhoneFrame>
    </div>
  );
}
