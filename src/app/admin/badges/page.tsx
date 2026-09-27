import { requireAdmin } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";
import BadgesManagement from "@/components/admin/BadgesManagement";
export default async function Page(){await requireAdmin();return <BadgesManagement badges={await getPrisma().badge.findMany({orderBy:{createdAt:"desc"}})} />;}
