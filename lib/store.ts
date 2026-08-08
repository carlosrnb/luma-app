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
    const raw   = localStorage.getItem("luma_pro_v1");
    const today = new Date().toISOString().split("T")[0];
    if (!raw) {
      const fresh = { isPro: false, trialUsed: false, freeMessagesUsed: 0, freeMessagesDate: today };
      localStorage.setItem("luma_pro_v1", JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw) as ProStatus;
    // reset daily free message counter at midnight
    if (parsed.freeMessagesDate !== today && !parsed.isPro) {
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

// ── ALIMENTAÇÃO ──
export interface FeedLog {
  date: string;       // YYYY-MM-DD
  food: string;
  reaction: "great" | "ok" | "refused" | "allergic";
  notes?: string;
}

export function loadFeedLogs(): FeedLog[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("luma_feed_v1") || "[]"); } catch { return []; }
}
export function saveFeedLogs(logs: FeedLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("luma_feed_v1", JSON.stringify(logs));
}

// ── CRESCIMENTO ──
export interface GrowthLog {
  date: string;
  weightKg?: number;
  heightCm?: number;
  headCm?: number;
}

export function loadGrowthLogs(): GrowthLog[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("luma_growth_v1") || "[]"); } catch { return []; }
}
export function saveGrowthLogs(logs: GrowthLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("luma_growth_v1", JSON.stringify(logs));
}

// ── VACINAÇÃO ──
export interface VaccineRecord {
  id: string;
  name: string;
  dueMonths: number;   // age in months when due
  doneDate?: string;   // YYYY-MM-DD if applied
}

export const VACCINE_SCHEDULE: Omit<VaccineRecord, "doneDate">[] = [
  { id:"bcg",          name:"BCG",                         dueMonths:0 },
  { id:"hepb_0",       name:"Hepatite B (1ª dose)",        dueMonths:0 },
  { id:"penta_1",      name:"Pentavalente (1ª dose)",      dueMonths:2 },
  { id:"vip_1",        name:"VIP/Pólio (1ª dose)",         dueMonths:2 },
  { id:"pneumo_1",     name:"Pneumocócica 10 (1ª dose)",   dueMonths:2 },
  { id:"rota_1",       name:"Rotavírus (1ª dose)",         dueMonths:2 },
  { id:"meningo_1",    name:"Meningocócica C (1ª dose)",   dueMonths:3 },
  { id:"penta_2",      name:"Pentavalente (2ª dose)",      dueMonths:4 },
  { id:"vip_2",        name:"VIP/Pólio (2ª dose)",         dueMonths:4 },
  { id:"pneumo_2",     name:"Pneumocócica 10 (2ª dose)",   dueMonths:4 },
  { id:"rota_2",       name:"Rotavírus (2ª dose)",         dueMonths:4 },
  { id:"meningo_2",    name:"Meningocócica C (2ª dose)",   dueMonths:5 },
  { id:"penta_3",      name:"Pentavalente (3ª dose)",      dueMonths:6 },
  { id:"vip_3",        name:"VIP/Pólio (3ª dose)",         dueMonths:6 },
  { id:"pneumo_3",     name:"Pneumocócica 10 (3ª dose)",   dueMonths:6 },
  { id:"hepb_1",       name:"Hepatite B (3ª dose)",        dueMonths:6 },
  { id:"influenza_1",  name:"Influenza (1ª dose)",         dueMonths:6 },
  { id:"febre_amarela",name:"Febre Amarela",               dueMonths:9 },
  { id:"meningo_ref",  name:"Meningocócica C (reforço)",   dueMonths:12 },
  { id:"pneumo_ref",   name:"Pneumocócica 10 (reforço)",   dueMonths:12 },
  { id:"triplice",     name:"Tríplice viral (1ª dose)",    dueMonths:12 },
  { id:"varicela",     name:"Varicela",                    dueMonths:15 },
  { id:"dtp_ref1",     name:"DTP (1º reforço)",            dueMonths:15 },
  { id:"vop_ref",      name:"VOP/Pólio (1º reforço)",      dueMonths:15 },
  { id:"triplice_2",   name:"Tríplice viral (2ª dose)",    dueMonths:15 },
  { id:"hepA",         name:"Hepatite A",                  dueMonths:15 },
  { id:"dtp_ref2",     name:"DTP (2º reforço)",            dueMonths:48 },
  { id:"vop_ref2",     name:"VOP/Pólio (2º reforço)",      dueMonths:48 },
];

export function loadVaccineRecords(): VaccineRecord[] {
  if (typeof window === "undefined") return VACCINE_SCHEDULE.map(v => ({ ...v }));
  try {
    const raw = localStorage.getItem("luma_vaccines_v1");
    if (!raw) return VACCINE_SCHEDULE.map(v => ({ ...v }));
    return JSON.parse(raw);
  } catch { return VACCINE_SCHEDULE.map(v => ({ ...v })); }
}
export function saveVaccineRecords(records: VaccineRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("luma_vaccines_v1", JSON.stringify(records));
}

// ── CONSULTAS ──
export interface Appointment {
  id: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  doctor: string;
  specialty: string;
  notes?: string;
}

export function loadAppointments(): Appointment[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("luma_appts_v1") || "[]"); } catch { return []; }
}
export function saveAppointments(appts: Appointment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("luma_appts_v1", JSON.stringify(appts));
}

// ── MULTIPLE CHILDREN ──
export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string;
}

export function loadBabyProfiles(): BabyProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("luma_babies_v1");
    if (!raw) {
      // migrate from single baby
      const store = loadStore();
      if (store.family?.baby) {
        const profile: BabyProfile = { id: "default", ...store.family.baby };
        const profiles = [profile];
        localStorage.setItem("luma_babies_v1", JSON.stringify(profiles));
        return profiles;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch { return []; }
}

export function saveBabyProfiles(profiles: BabyProfile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("luma_babies_v1", JSON.stringify(profiles));
}

export function getActiveBabyId(): string {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem("luma_active_baby") || "default";
}

export function setActiveBabyId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("luma_active_baby", id);
}
