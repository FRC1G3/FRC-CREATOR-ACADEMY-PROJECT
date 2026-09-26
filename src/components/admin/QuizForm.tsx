"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { adminCourses } from "@/data/admin-data";
import AdminFormField from "./AdminFormField";

export default function QuizForm() {
  const [questionCount, setQuestionCount] = useState(1);
  return <form className="app-card admin-editor" onSubmit={(event) => event.preventDefault()}>
    <div className="admin-form-section"><h2>Quiz details</h2><p>Build a checkpoint for your course.</p></div>
    <div className="admin-form-grid">
      <div className="admin-field-full"><AdminFormField label="Quiz Title"><input name="title" placeholder="e.g. Fundamentals Check" /></AdminFormField></div>
      <AdminFormField label="Course"><select name="course">{adminCourses.map((course) => <option key={course.id}>{course.title}</option>)}</select></AdminFormField>
      <AdminFormField label="Module"><select name="module"><option>Module 1</option><option>Module 2</option><option>Module 3</option></select></AdminFormField>
      <AdminFormField label="Pass Score (%)"><input name="passScore" type="number" min={0} max={100} defaultValue={80} /></AdminFormField>
    </div>
    <div className="admin-question-list">
      {Array.from({ length: questionCount }, (_, index) => <fieldset className="admin-question" key={index}>
        <legend>Question {index + 1}</legend>
        <AdminFormField label="Question text"><textarea name={`question-${index}`} rows={2} placeholder="Write your question here" /></AdminFormField>
        <div className="admin-form-grid">{["A", "B", "C", "D"].map((letter) => <AdminFormField label={`Answer ${letter}`} key={letter}><input name={`question-${index}-${letter}`} placeholder={`Option ${letter}`} /></AdminFormField>)}</div>
        <AdminFormField label="Correct answer"><select name={`correct-${index}`} defaultValue=""><option value="" disabled>Select the correct answer</option>{["A", "B", "C", "D"].map((letter) => <option key={letter}>{letter}</option>)}</select></AdminFormField>
      </fieldset>)}
    </div>
    <button className="admin-button" type="button" onClick={() => setQuestionCount((count) => count + 1)}><Plus size={16} />Add Question</button>
    <div className="admin-form-footer"><p>UI preview only. Questions are not saved or scored.</p><div><Link className="admin-button" href="/admin/quizzes">Cancel</Link><button className="admin-button" type="button" disabled>Save Draft</button><button className="admin-button admin-button-primary" type="button" disabled>Publish Quiz</button></div></div>
  </form>;
}
