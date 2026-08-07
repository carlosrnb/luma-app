export interface Baby {
  name: string;
  birthDate: string; // ISO date
}

export interface Family {
  parentName: string;
  baby: Baby;
  onboarded: boolean;
}

export interface SleepLog {
  date: string;       // YYYY-MM-DD
  hours: number;
  interruptions: number;
  notes?: string;
}

export interface MoodLog {
  date: string;
  mood: "anxious" | "calm" | "tired" | "happy";
}

export interface FamilyStore {
  family: Family | null;
  sleepLogs: SleepLog[];
  moodLogs: MoodLog[];
}

const KEY = "luma_v1";

export function loadStore(): FamilyStore {
  if (typeof window === "undefined") return { family: null, sleepLogs: [], moodLogs: [] };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { family: null, sleepLogs: [], moodLogs: [] };
  } catch {
    return { family: null, sleepLogs: [], moodLogs: [] };
  }
}

export function saveStore(data: FamilyStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

export function getAgeFull(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = getAgeInMonths(birthDate);
  const days = Math.floor((now.getTime() - new Date(birth.getFullYear(), birth.getMonth() + months, birth.getDate()).getTime()) / 86400000);
  if (months < 1) return `${days} dias`;
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}${days > 0 ? ` e ${days} ${days === 1 ? "dia" : "dias"}` : ""}`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return `${years} ${years === 1 ? "ano" : "anos"}${remMonths > 0 ? ` e ${remMonths} ${remMonths === 1 ? "mês" : "meses"}` : ""}`;
}

export function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number; // timestamp
}

export function loadChat(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("luma_chat_v1");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveChat(msgs: ChatMessage[]) {
  if (typeof window === "undefined") return;
  // keep last 60 messages
  localStorage.setItem("luma_chat_v1", JSON.stringify(msgs.slice(-60)));
}

export function clearChat() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("luma_chat_v1");
}

// Pro status helpers
export interface ProStatus {
  isPro: boolean;
  trialUsed: boolean;
  freeMessagesUsed: number; // resets daily
  freeMessagesDate: string; // YYYY-MM-DD
}

export function loadProStatus(): ProStatus {
  if (typeof window === "undefined")
    return { isPro: false, trialUsed: false, freeMessagesUsed: 0, freeMessagesDate: "" };
  try {
    const raw = localStorage.getItem("luma_pro_v1");
    const today = new Date().toISOString().split("T")[0];
    if (!raw) return { isPro: false, trialUsed: false, freeMessagesUsed: 0, freeMessagesDate: today };
    const parsed = JSON.parse(raw) as ProStatus;
    // reset daily counter
    if (parsed.freeMessagesDate !== today) {
      parsed.freeMessagesUsed = 0;
      parsed.freeMessagesDate = today;
      localStorage.setItem("luma_pro_v1", JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return { isPro: false, trialUsed: false, freeMessagesUsed: 0, freeMessagesDate: "" };
  }
}

export function saveProStatus(status: ProStatus) {
  if (typeof window === "undefined") return;
  localStorage.setItem("luma_pro_v1", JSON.stringify(status));
}

export const FREE_MSG_LIMIT = 3; // messages per day on free plan
