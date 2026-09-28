import { getCurrentUser } from "@/lib/current-user";
import Navbar from "./Navbar";

export default async function AccountNavigation() {
  const user = await getCurrentUser();
  return <Navbar key={user?.id ?? "guest"} user={user ? { name: user.name, avatarUrl: user.avatarUrl, role: user.role } : null} />;
}
