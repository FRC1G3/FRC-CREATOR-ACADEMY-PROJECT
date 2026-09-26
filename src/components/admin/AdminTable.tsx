import type { ReactNode } from "react";

export default function AdminTable({ columns, label, children, empty = false }: {
  columns: string[]; label: string; children: ReactNode; empty?: boolean;
}) {
  return (
    <div className="app-card admin-panel">
      {empty ? <div className="admin-empty" role="status"><h2>No {label.toLowerCase()} found</h2><p>Try a different search or filter.</p></div> : (
        <div className="admin-table-wrap" role="region" aria-label={label} tabIndex={0}>
          <table className="admin-table"><thead><tr>{columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{children}</tbody></table>
        </div>
      )}
    </div>
  );
}
