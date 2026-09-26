import Link from "next/link";
export default function EmptyState({ message = "You have not enrolled in a course yet." }: { message?: string }) {
  return <section className="app-card learning-empty"><p>{message}</p><Link href="/courses">Explore Courses →</Link></section>;
}
