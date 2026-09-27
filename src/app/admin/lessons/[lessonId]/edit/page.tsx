import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import { adminCatalog } from "@/services/admin-queries";
import LessonForm from "@/components/admin/LessonForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export default async function Page({params}:{params:Promise<{lessonId:string}>}) {await requireAdmin(); const {lessonId}=await params;const record=await getPrisma().lesson.findUnique({where:{id:lessonId},include:{module:true}});if(!record)notFound();return <><AdminPageHeader eyebrow="Lesson Management" title="Edit Lesson" description={record.title} /><LessonForm key={record.id} catalog={await adminCatalog()} lesson={record} /></>; }
