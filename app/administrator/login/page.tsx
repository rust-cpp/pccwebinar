import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminLogin } from "@/components/admin-login";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/administrator");
  return <main className="grid min-h-screen place-items-center bg-[#0b2419] px-6 text-[#f4f0e6]"><div className="w-full max-w-md border border-white/15 bg-[#102d20] p-8 sm:p-10"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center bg-[#f4f0e6] p-2"><Image src="/pcc-logo.svg" alt="PCC" width={50} height={50} className="h-full w-full object-contain"/></div><div><p className="font-semibold">Punjab Charities Commission</p><p className="mt-1 text-[10px] uppercase tracking-[.2em] text-[#b7cbbd]">Webinar administration</p></div></div><p className="mt-12 text-[10px] font-bold uppercase tracking-[.22em] text-[#c9df72]">Secure access</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.045em]">Administrator sign in</h1><p className="mt-3 text-sm leading-6 text-white/55">Manage sessions, registrations, and attendance records.</p><AdminLogin/></div></main>;
}
