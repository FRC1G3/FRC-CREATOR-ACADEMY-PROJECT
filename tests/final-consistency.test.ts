import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { learningProgress } from "../src/lib/learning-rules";
import { deriveCourseState, learningCourseSelect, reconcileBadgesForUsers, type Database } from "../src/services/learning";
import { moduleViews, badgeViews } from "../src/services/presentation";
import { adminCourseProgress } from "../src/lib/admin-students";
import { quizResultInclude } from "../src/services/quiz-results";
import LockedQuiz from "../src/components/quiz/LockedQuiz";
import { AdminCourseFilter } from "../src/components/admin/AdminFilters";
import nextConfig from "../next.config";
import { filterAdminQuizzes } from "../src/lib/admin-quiz-filters";

function graph() {
  return { id:"c",slug:"course",title:"Course",status:"PUBLISHED",modules:[{id:"m",title:"Same title",order:1,lessons:[1,2,3].map(order=>({id:`l${order}`,slug:`lesson-${order}`,moduleId:"m",title:"Repeated title",order,durationSeconds:60}))},{id:"draft",title:"Future title",order:2,lessons:[]},{id:"quiz-only",title:"Same title",order:3,lessons:[]}],quizzes:[{id:"q",slug:"quiz",title:"Quiz",moduleId:"m",_count:{questions:1}},{id:"q-only",slug:"quiz-only",title:"Quiz",moduleId:"quiz-only",_count:{questions:1}}],roadmapNodes:[1,2,3].map(i=>({id:`n${i}`,title:`Step ${i}`,type:"LESSON",lessonId:`l${i}`,quizId:null,badgeId:null})) } as unknown as Parameters<typeof deriveCourseState>[0];
}
const now = new Date();
const enrollment = {userId:"u",courseId:"c",completedAt:null} as Parameters<typeof deriveCourseState>[1];
const progress = [1,2,3].map(i=>({id:`p${i}`,userId:"u",lessonId:`l${i}`,status:"COMPLETED",completedAt:now})) as Parameters<typeof deriveCourseState>[2];
const attempt = {id:"a",quizId:"q",passed:true,score:100,completedAt:now};

it("filters draft-only modules, retaining lesson and quiz-only modules and their stored order",()=>{
  const course=graph(),state=deriveCourseState(course,enrollment,[],[],[]);
  expect(state.course.modules.map(m=>[m.id,m.order])).toEqual([["m",1],["quiz-only",3]]);
  expect(course.modules).toHaveLength(3);
  expect(moduleViews(state).map(m=>m.id)).toEqual(["m","quiz-only"]);
  expect(moduleViews(state)[1].lessons[0].id).toBe("q-only");
});
it("shares required-unit progress with Admin and module presentation, counting a quiz pass only once",()=>{
  const course=graph();course.quizzes=course.quizzes.slice(0,1);
  const state=deriveCourseState(course,enrollment,progress,[],[]);
  expect(state).toMatchObject({percentage:75,complete:false,completedUnits:3,totalUnits:4});
  expect(moduleViews(state)[0].progress).toBe(75);
  expect(adminCourseProgress(course,progress,[])).toMatchObject({progress:75,status:"In Progress"});
  const attempts=[attempt,{...attempt,id:"retry",passed:false},{...attempt,id:"second-pass"}];
  const complete=deriveCourseState(course,enrollment,progress,attempts,[]);
  expect(complete).toMatchObject({percentage:100,complete:true,completedUnits:4});
  expect(adminCourseProgress(course,progress,attempts)).toMatchObject({progress:100,status:"Completed"});
});
it("never rounds an incomplete course up to 100, and never completes an empty course",()=>{
  expect(learningProgress(999,1000,0,0)).toMatchObject({percentage:99,complete:false});
  expect(learningProgress(0,0,0,0)).toMatchObject({percentage:0,complete:false});
  expect(learningProgress(3,3,1,1)).toMatchObject({percentage:100,complete:true});
});
it("keeps database entity IDs when titles repeat",()=>{
  const modules=moduleViews(deriveCourseState(graph(),enrollment,[],[],[]));
  expect(new Set(modules[0].lessons.map(l=>l.id)).size).toBe(modules[0].lessons.length);
  const badges=badgeViews([{id:"b1",name:"Same",users:[],icon:"star"},{id:"b2",name:"Same",users:[],icon:"star"}] as unknown as Parameters<typeof badgeViews>[0]);
  expect(badges.map(b=>b.id)).toEqual(["b1","b2"]);
});
it("orders result answers by question order and selects only useful correct-option text",()=>{
  expect(quizResultInclude.answers.orderBy).toEqual({question:{order:"asc"}});
  expect(quizResultInclude.answers.include.question.include.options).toEqual({where:{isCorrect:true},select:{text:true}});
});
it("locks the quiz without revealing questions and offers course-specific recovery links",()=>{
  const html=renderToStaticMarkup(createElement(LockedQuiz,{courseSlug:"course"}));
  expect(html).toContain("Quiz Locked");expect(html).toContain('href="/roadmap?course=course"');expect(html).toContain('href="/courses/course"');
  expect(html).not.toMatch(/quiz-options|questionId|isCorrect/);
});
it("course filter options use unique IDs even if two courses share a title",()=>{
  const html=renderToStaticMarkup(createElement(AdminCourseFilter,{value:"b",onChange:vi.fn(),courses:[{id:"a",title:"Same"},{id:"b",title:"Same"}]}));
  expect(html).toContain('value="a"');expect(html).toContain('value="b" selected=""');
});
it("selects only the chosen course's quizzes when course titles collide",()=>{
  const rows=[{id:"q1",courseId:"a",course:"Same",title:"Checkpoint"},{id:"q2",courseId:"b",course:"Same",title:"Checkpoint"}];
  expect(filterAdminQuizzes(rows," checkpoint ","b").map(q=>q.id)).toEqual(["q2"]);
  expect(filterAdminQuizzes(rows,"missing","b")).toEqual([]);
});
it("learning queries never request image blobs or hidden quiz answers",()=>{
  const fields=JSON.stringify(learningCourseSelect);
  expect(fields).not.toMatch(/thumbnailUrl|avatarUrl|isCorrect|explanation/);
  expect(learningCourseSelect.modules.select.lessons.where).toEqual({status:"PUBLISHED"});
  expect(learningCourseSelect.quizzes.where).toEqual({status:"PUBLISHED"});
});
it("reconciles eligible learners in batches, preserves earned awards, and limits badge edits to their ID",async()=>{
  const course=graph();course.quizzes=course.quizzes.slice(0,1);
  const users=["u","v"].map(id=>({id,enrollments:[{...enrollment,course}],lessonProgress:progress,quizAttempts:[attempt]}));
  const db={user:{findMany:vi.fn().mockResolvedValue(users)},badge:{findMany:vi.fn().mockResolvedValue([{id:"b",conditionType:"COURSE_COMPLETE",conditionValue:1,users:[{userId:"u"}]}])},userBadge:{createMany:vi.fn()}};
  await reconcileBadgesForUsers(["u","v"],db as unknown as Database,"b");
  expect(db.user.findMany).toHaveBeenCalledTimes(1);expect(db.badge.findMany).toHaveBeenCalledTimes(1);
  expect(db.badge.findMany.mock.calls[0][0].where).toEqual({status:"ACTIVE",id:"b"});
  expect(db.userBadge.createMany).toHaveBeenCalledWith({data:[{userId:"v",badgeId:"b"}],skipDuplicates:true});
});
it("does not award unmet badge conditions or query an empty learner batch",async()=>{
  const db={user:{findMany:vi.fn().mockResolvedValue([{id:"u",enrollments:[],lessonProgress:[],quizAttempts:[]}])},badge:{findMany:vi.fn().mockResolvedValue([{id:"b",conditionType:"COURSE_COMPLETE",conditionValue:1,users:[]}])},userBadge:{createMany:vi.fn()}};
  await reconcileBadgesForUsers([],db as unknown as Database);expect(db.user.findMany).not.toHaveBeenCalled();
  await reconcileBadgesForUsers(null,db as unknown as Database,"b");expect(db.userBadge.createMany).not.toHaveBeenCalled();
});
it("adds safe headers without disabling required outbound embeds or introducing an untested CSP",async()=>{
  const rules=await nextConfig.headers!();
  const headers=Object.fromEntries(rules[0].headers.map(h=>[h.key,h.value]));
  expect(headers).toMatchObject({"X-Content-Type-Options":"nosniff","X-Frame-Options":"SAMEORIGIN","Referrer-Policy":"strict-origin-when-cross-origin"});
  expect(headers).not.toHaveProperty("Content-Security-Policy");
  expect(headers["Permissions-Policy"]).not.toContain("fullscreen");
});
