export default function AdminStatusBadge({ status }: { status: string }) {
  const tone = ["Published", "Active", "Completed", "Passed"].includes(status) ? "is-published" : ["Draft", "In Progress", "Pending"].includes(status) ? "is-draft" : status === "Failed" ? "is-failed" : "is-inactive";
  return <span className={`admin-status ${tone}`}>{status}</span>;
}
