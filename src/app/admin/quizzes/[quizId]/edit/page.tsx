import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import { adminCatalog } from "@/services/admin-queries";
import QuizForm from "@/components/admin/QuizForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export default async function Page({params}:{params:Promise<{quizId:string}>}) {await requireAdmin(); const {quizId}=await params;const record=await getPrisma().quiz.findUnique({where:{id:quizId},include:{questions:{orderBy:{order:"asc"},include:{options:{orderBy:{order:"asc"}}}},_count:{select:{attempts:true}}}});if(!record)notFound();return <><AdminPageHeader eyebrow="Quiz Management" title="Edit Quiz" description={record.title} /><QuizForm key={record.id} catalog={await adminCatalog()} quiz={record} /></>; }
