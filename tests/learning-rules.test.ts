import { describe, expect, it } from "vitest";
import { badgeMet, passes, percentage, roadmapStates, scoreAnswers, streak, type LearningNode } from "../src/lib/learning-rules";
import { registerSchema, safeCallback, quizSubmissionSchema } from "../src/lib/validation";

describe("progress", () => {
  it.each([[0,10,0],[5,10,50],[10,10,100],[0,0,0]])("%s/%s = %s", (done,total,result) => expect(percentage(done,total)).toBe(result));
});
describe("quiz grading and validation", () => {
  it.each([[79,false],[80,true],[81,true],[100,true]])("pass threshold %s", (score,expected) => expect(passes(score)).toBe(expected));
  const questions = [1,2,3,4,5].map(n => ({ id: `q${n}`, options: [{id:`a${n}`,isCorrect:true},{id:`b${n}`,isCorrect:false}] }));
  it.each([[0,0,false],[3,60,false],[4,80,true],[5,100,true]])("grades %s correct", (count,score,passed) => {
    expect(scoreAnswers(questions, questions.map((q,i) => ({questionId:q.id,optionId:q.options[i<count?0:1].id})))).toMatchObject({score,passed,correct:count});
  });
  it("rejects foreign question", () => expect(() => scoreAnswers(questions,[{questionId:"foreign",optionId:"a1"}])).toThrow());
  it("rejects another question's option", () => expect(() => scoreAnswers(questions,questions.map(q => ({questionId:q.id,optionId:"a1"})))).toThrow());
  it("rejects duplicate questions", () => expect(() => scoreAnswers(questions,questions.map(() => ({questionId:"q1",optionId:"a1"})))).toThrow());
  it("rejects empty quiz", () => expect(() => scoreAnswers([],[])).toThrow());
  it("rejects forged client score", () => expect(quizSubmissionSchema.safeParse({quizId:"quiz",requestId:crypto.randomUUID(),answers:[{questionId:"q",optionId:"a"}],score:100}).success).toBe(false));
});
describe("linear roadmap", () => {
  const nodes: LearningNode[] = [{id:"1",type:"LESSON",lessonId:"l1",quizId:null,badgeId:null},{id:"2",type:"QUIZ",lessonId:null,quizId:"q1",badgeId:null},{id:"3",type:"LESSON",lessonId:"l2",quizId:null,badgeId:null}];
  const states = (enrolled:boolean, lessons:string[]=[], quizzes:string[]=[]) => roadmapStates(nodes,enrolled,new Set(lessons),new Set(quizzes),new Set()).map(n => n.status);
  it("requires enrollment", () => expect(states(false)).toEqual(["locked","locked","locked"]));
  it("opens first node only", () => expect(states(true)).toEqual(["current","locked","locked"]));
  it("lesson unlocks quiz but failure blocks next lesson", () => expect(states(true,["l1"])).toEqual(["completed","current","locked"]));
  it("any previous pass unlocks next lesson", () => expect(states(true,["l1"],["q1"])).toEqual(["completed","completed","current"]));
  it("completed nodes stay completed", () => expect(states(true,["l1","l2"],["q1"])).toEqual(["completed","completed","completed"]));
});
describe("badge conditions and UTC streak", () => {
  const stats = {modules:0,courses:0,quizzes:0,streak:0};
  it.each(["FIRST_SECTION_COMPLETE","MODULE_COMPLETE","COURSE_COMPLETE","QUIZ_COUNT","STREAK"])("unmet %s", type => expect(badgeMet(type,1,stats)).toBe(false));
  it.each(["FIRST_SECTION_COMPLETE","MODULE_COMPLETE","COURSE_COMPLETE","QUIZ_COUNT","STREAK"])("met %s", type => expect(badgeMet(type,1,{modules:1,courses:1,quizzes:1,streak:1})).toBe(true));
  it("does not award unknown conditions", () => expect(badgeMet("UNKNOWN",null,stats)).toBe(false));
  it("counts distinct consecutive days through yesterday", () => expect(streak([new Date("2026-09-25T01:00Z"),new Date("2026-09-25T20:00Z"),new Date("2026-09-26T20:00Z")],new Date("2026-09-27T10:00Z")).days).toBe(2));
  it("breaks stale streak", () => expect(streak([new Date("2026-09-25")],new Date("2026-09-28")).days).toBe(0));
});
describe("registration and redirects", () => {
  it("normalizes email and strips role", () => expect(registerSchema.parse({name:"Creator",email:" STUDENT@EXAMPLE.COM ",password:"long-password",confirmPassword:"long-password",role:"ADMIN"})).toEqual({name:"Creator",email:"student@example.com",password:"long-password",confirmPassword:"long-password"}));
  it.each(["https://evil.test","//evil.test","/\\evil.test","/login","javascript:alert(1)"])("rejects callback %s", value => expect(safeCallback(value)).toBe("/dashboard"));
  it("keeps local lesson callback", () => expect(safeCallback("/learn/example?source=course")).toBe("/learn/example?source=course"));
});
