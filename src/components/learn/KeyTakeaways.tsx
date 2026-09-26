import { Lightbulb, CircleCheck } from "lucide-react";

export default function KeyTakeaways({ lessonTakeaways }: { lessonTakeaways: string[] }) {
  return (
    <section className="lesson-takeaways">
      <h2><Lightbulb />Key Takeaways</h2>
      <ul>{lessonTakeaways.map((item) => <li key={item}><CircleCheck aria-hidden="true" />{item}</li>)}</ul>
    </section>
  );
}
