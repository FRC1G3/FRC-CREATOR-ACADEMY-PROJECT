import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import CourseForm from "@/components/admin/CourseForm";
import ModulesManagement from "@/components/admin/ModulesManagement";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export default async function Page({params}:{params:Promise<{courseId:string}>}) {await requireAdmin();const {courseId}=await params;const course=await getPrisma().course.findUnique({where:{id:courseId},include:{modules:{orderBy:{order:"asc"}}}});if(!course)notFound();return <><AdminPageHeader eyebrow="Course Management" title="Edit Course" description={course.title} /><CourseForm key={course.id} course={course} /><ModulesManagement courseId={course.id} modules={course.modules} /></>;}
