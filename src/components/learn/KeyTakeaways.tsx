import { Lightbulb, CircleCheck } from "lucide-react";
import { lessonTakeaways } from "@/data/lesson-data";

export default function KeyTakeaways() {
  return (
    <section className="lesson-takeaways">
      <h2><Lightbulb />Key Takeaways</h2>
      <ul>{lessonTakeaways.map((item) => <li key={item}><CircleCheck aria-hidden="true" />{item}</li>)}</ul>
    </section>
  );
}
