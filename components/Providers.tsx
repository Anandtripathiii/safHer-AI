"use client";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { useApp } from "@/lib/store";
import Engine from "./Engine";
import Overlays from "./Overlays";
import DemoPanel from "./DemoPanel";
import QuickActions from "./QuickActions";
import WebBanners from "./WebBanners";
import { usePhone } from "@/lib/phone-state";

export default function Providers({ children }: { children: React.ReactNode }) {
  const theme = useApp((s) => s.theme);
  const lang = useApp((s) => s.lang);

  useEffect(() => {
    useApp.persist.rehydrate();
    usePhone.persist.rehydrate(); // favourites + imported contacts are shared with the website
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
      {children}
      <Engine />
      <Overlays />
      <WebBanners />
      <QuickActions />
      <DemoPanel />
      <Toaster position="top-center" theme={theme} richColors closeButton toastOptions={{ style: { borderRadius: 16 } }} offset={92} />
    </>
  );
}
