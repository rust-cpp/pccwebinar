"use client";
import { useTransition } from "react";
import { toggleAttendance } from "@/app/actions";
export function AttendanceToggle({ id, attended }: { id: string; attended: boolean }) { const [pending,start]=useTransition(); return <button disabled={pending} onClick={()=>start(()=>toggleAttendance(id,!attended))} className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${attended?"bg-[#dce8d9] text-[#1f583a]":"bg-[#e8e8dc] text-[#526158] hover:bg-[#dfe3d7]"}`}>{pending?"Saving…":attended?"Attended":"Mark attended"}</button> }
