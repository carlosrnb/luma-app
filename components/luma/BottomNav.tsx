"use client";
import { useRouter, usePathname } from "next/navigation";

const items = [
  { icon: "🏠", label: "Início",    href: "/home" },
  { icon: "📈", label: "Evolução",  href: "/desenvolvimento" },
  { icon: null, label: "",           href: "/registro" },   // FAB
  { icon: "📚", label: "Conteúdo",  href: "#" },
  { icon: "⚙️", label: "Ajustes",   href: "#" },
];

export default function BottomNav() {
  const router   = useRouter();
  const pathname = usePathname();

  return (
    <nav
      style={{ backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]
                 bg-bg/90 border-t border-black/5 flex justify-around items-end
                 pt-2 pb-6 z-50"
    >
      {items.map((item, i) => {
        if (!item.icon) {
          return (
            <button
              key={i}
              onClick={() => router.push(item.href)}
              className="w-13 h-13 rounded-full bg-ink flex items-center justify-center
                         text-xl shadow-lg -mt-5 border-4 border-bg"
              style={{ width: 52, height: 52 }}
            >
              ✏️
            </button>
          );
        }
        const active = pathname.startsWith(item.href) && item.href !== "#";
        return (
          <button
            key={i}
            onClick={() => item.href !== "#" && router.push(item.href)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 border-none bg-transparent
                        cursor-pointer transition-opacity
                        ${active ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
          >
            <span className="text-[21px]">{item.icon}</span>
            <span
              className={`text-[10px] font-semibold font-inter
                          ${active ? "text-sage-dk" : "text-ink"}`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
