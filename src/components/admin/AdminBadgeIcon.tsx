import { Play, Star, Flame, Trophy, Crown } from "lucide-react";
const icons = { play: Play, star: Star, flame: Flame, trophy: Trophy, crown: Crown };
export default function AdminBadgeIcon({ icon }: { icon: string }) {
  const Icon = icons[icon.toLowerCase() as keyof typeof icons] ?? Trophy;
  return <Icon size={28} aria-hidden="true" />;
}
