"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="courses-page"><section className="courses-container app-card learning-empty"><h1>Unable to load this page</h1><p>Please try again shortly.</p><button type="button" onClick={reset}>Try again</button></section></main>;
}
