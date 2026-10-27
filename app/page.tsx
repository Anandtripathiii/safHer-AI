import { redirect } from "next/navigation";

// The app opens straight on SOS: the one screen that must be a tap away.
export default function Home() {
  redirect("/sos");
}
