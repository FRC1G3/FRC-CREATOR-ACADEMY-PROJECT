export default function AdminStatusBadge({ status }: { status: string }) {
  const tone = status === "Published" || status === "Active" ? "is-published" : status === "Draft" ? "is-draft" : "is-inactive";
  return <span className={`admin-status ${tone}`}>{status}</span>;
}
