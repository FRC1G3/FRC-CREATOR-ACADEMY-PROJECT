"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { Catalog, QuizEdit } from "@/types/admin";
import AdminFormField from "./AdminFormField";
import AdminEditor from "./AdminEditor";
import CourseModuleFields from "./CourseModuleFields";
export default function QuizForm({catalog,quiz}:{catalog:Catalog;quiz?:QuizEdit}) {
  const [questionCount,setQuestionCount]=useState(quiz?.questions.length ?? 1);
  const locked=Boolean(quiz?._count.attempts);
  return <AdminEditor entity="quiz" id={quiz?.id} cancel="/admin/quizzes" prepare={form=>({ ...Object.fromEntries(form), ...(!locked ? { questions:Array.from({length:questionCount},(_,i)=>({ text:form.get('question-'+i), explanation:form.get('explanation-'+i) ?? '', options:Array.from({length:quiz?.questions[i]?.options.length ?? 4},(_,j)=>({text:form.get('option-'+i+'-'+j),isCorrect:form.get('correct-'+i)===String(j)})) })) } : {}) })}>
    <div className="admin-form-section"><h2>Quiz details</h2><p>{locked ? "Attempts exist: questions, answers and pass score are protected." : "Build a checkpoint for your course."}</p></div>
    <div className="admin-form-grid">
      <AdminFormField label="Quiz Title"><input name="title" required defaultValue={quiz?.title} /></AdminFormField>
      <AdminFormField label="Slug"><input name="slug" defaultValue={quiz?.slug} /></AdminFormField>
      <CourseModuleFields catalog={catalog} courseId={quiz?.courseId} moduleId={quiz?.moduleId} optional fixed={Boolean(quiz)} />
      <AdminFormField label="Description"><textarea name="description" defaultValue={quiz?.description ?? ''} /></AdminFormField>
      <AdminFormField label="Pass Score (%)"><input name="passScore" type="number" min={1} max={100} readOnly={locked} defaultValue={quiz?.passScore ?? 80} /></AdminFormField>
      <AdminFormField label="Status"><select name="status" defaultValue={quiz?.status ?? 'DRAFT'}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></AdminFormField>
    </div>
    <div className="admin-question-list">{Array.from({length:questionCount},(_,index)=><fieldset className="admin-question" key={index} disabled={locked}>
      <legend>Question {index+1}</legend>
      <AdminFormField label="Question text"><textarea name={'question-'+index} rows={2} required defaultValue={quiz?.questions[index]?.text} /></AdminFormField>
      <div className="admin-form-grid">{Array.from({length:quiz?.questions[index]?.options.length ?? 4},(_,j)=><AdminFormField label={'Answer '+String.fromCharCode(65+j)} key={j}><input name={'option-'+index+'-'+j} required defaultValue={quiz?.questions[index]?.options[j]?.text} /></AdminFormField>)}</div>
      <AdminFormField label="Correct answer"><select name={'correct-'+index} required defaultValue={quiz?.questions[index]?.options.findIndex(o=>o.isCorrect) ?? ''}><option value="" disabled>Select the correct answer</option>{Array.from({length:quiz?.questions[index]?.options.length ?? 4},(_,j)=><option value={j} key={j}>{String.fromCharCode(65+j)}</option>)}</select></AdminFormField>
      <AdminFormField label="Explanation"><textarea name={'explanation-'+index} defaultValue={quiz?.questions[index]?.explanation ?? ''} /></AdminFormField>
    </fieldset>)}</div>
    {!locked && <><button className="admin-button" type="button" disabled={questionCount>=50} onClick={()=>setQuestionCount(n=>n+1)}><Plus size={16} />Add Question</button><button className="admin-button" type="button" disabled={questionCount<=1} onClick={()=>setQuestionCount(n=>n-1)}>Remove Last Question</button></>}
  </AdminEditor>;
}
