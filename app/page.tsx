"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStore } from "@/lib/store";

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    const store = loadStore();
    router.replace(store.family?.onboarded ? "/home" : "/onboarding");
  }, [router]);
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span className="f-nunito" style={{ fontSize:28, fontWeight:800, color:"var(--ink)", opacity:0.2 }}>luma</span>
    </div>
  );
}
