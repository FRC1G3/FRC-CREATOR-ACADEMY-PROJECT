import { beforeEach, expect, it, vi } from "vitest";
import { Prisma } from "../src/generated/prisma/client";
const mock=vi.hoisted(()=>{
  const model=()=>({findUnique:vi.fn(),findUniqueOrThrow:vi.fn(),findFirst:vi.fn(),findMany:vi.fn(),create:vi.fn(),update:vi.fn(),updateMany:vi.fn(),delete:vi.fn(),deleteMany:vi.fn(),count:vi.fn()});
  return {db:{course:model(),module:model(),lesson:model(),quiz:model(),question:model(),badge:model(),roadmapNode:model(),enrollment:model(),lessonProgress:model(),quizAttempt:model(),$queryRaw:vi.fn()},transaction:vi.fn()};
});
vi.mock("@/lib/prisma",()=>({getPrisma:()=>({$transaction:mock.transaction})}));
import { executeAdmin, adminError } from "../src/services/admin";
import { courseSchema, questionSchema, badgeSchema } from "../src/lib/admin-validation";
const course={title:"Test Course",slug:"test-course",shortDescription:"Short",description:"Full",instructorName:"Creator",level:"BEGINNER",status:"DRAFT",estimatedDuration:10};
const lesson={courseId:"c",moduleId:"m",title:"Lesson",slug:"lesson",description:"",videoUrl:"https://youtu.be/PHVuZ5I_Jb4",thumbnailUrl:"",durationSeconds:60,order:1,status:"PUBLISHED"};
const question={text:"Question",explanation:"",options:[{text:"A",isCorrect:true},{text:"B",isCorrect:false}]};
const quiz={courseId:"c",moduleId:"m",title:"Quiz",slug:"quiz",passScore:80,status:"DRAFT",questions:[question]};
beforeEach(()=>{vi.resetAllMocks();mock.transaction.mockImplementation(async fn=>fn(mock.db));mock.db.module.findUnique.mockResolvedValue({courseId:"c"});mock.db.module.findFirst.mockResolvedValue({id:"m"});mock.db.quiz.findUniqueOrThrow.mockResolvedValue({courseId:"c",moduleId:"m",passScore:80,_count:{attempts:0}});});
it("creates course with generated slug",async()=>{await executeAdmin({entity:"course",operation:"save",data:{...course,slug:""}});expect(mock.db.course.create).toHaveBeenCalledWith({data:expect.objectContaining({slug:"test-course"})});});
it.each(["DRAFT","PUBLISHED"])("updates course status %s without recreating",async status=>{await executeAdmin({entity:"course",operation:"save",id:"c",data:{...course,status}});expect(mock.db.course.update).toHaveBeenCalledWith({where:{id:"c"},data:expect.objectContaining({status})});expect(mock.db.course.create).not.toHaveBeenCalled();});
it("rejects invalid course enums",()=>expect(courseSchema.safeParse({...course,level:"invalid"}).success).toBe(false));
it("reports duplicate slug/order safely",()=>expect(adminError(new Prisma.PrismaClientKnownRequestError("SQL secret",{code:"P2002",clientVersion:"7.10.0"}))).toContain("already used"));
it("blocks deletion of a course with students",async()=>{mock.db.course.findUniqueOrThrow.mockResolvedValue({_count:{modules:0,quizzes:0,enrollments:1,roadmapNodes:0}});await expect(executeAdmin({entity:"course",operation:"delete",id:"c",data:{}})).rejects.toThrow("empty courses");expect(mock.db.course.delete).not.toHaveBeenCalled();});
it("creates lesson in a valid module with DB video URL",async()=>{await executeAdmin({entity:"lesson",operation:"save",data:lesson});expect(mock.db.lesson.create).toHaveBeenCalledWith({data:expect.objectContaining({videoUrl:lesson.videoUrl,moduleId:"m"})});});
it("rejects foreign module",async()=>{mock.db.module.findUnique.mockResolvedValue({courseId:"other"});await expect(executeAdmin({entity:"lesson",operation:"save",data:lesson})).rejects.toThrow("belonging");expect(mock.db.lesson.create).not.toHaveBeenCalled();});
it("edits existing lesson ID without touching progress",async()=>{mock.db.lesson.findUniqueOrThrow.mockResolvedValue({moduleId:"m"});await executeAdmin({entity:"lesson",operation:"save",id:"l",data:lesson});expect(mock.db.lesson.update).toHaveBeenCalledWith({where:{id:"l"},data:expect.objectContaining({videoUrl:lesson.videoUrl})});expect(mock.db.lessonProgress.deleteMany).not.toHaveBeenCalled();});
it("creates quiz and nested questions/options atomically",async()=>{await executeAdmin({entity:"quiz",operation:"save",data:quiz});expect(mock.transaction).toHaveBeenCalledTimes(1);expect(mock.db.quiz.create).toHaveBeenCalledWith({data:expect.objectContaining({questions:{create:[expect.objectContaining({order:1,options:{create:[{text:"A",isCorrect:true,order:1},{text:"B",isCorrect:false,order:2}]}})]}})});});
it.each([0,2])("rejects %s correct options",correct=>expect(questionSchema.safeParse({...question,options:question.options.map((o,i)=>({...o,isCorrect:i<correct}))}).success).toBe(false));
it("locks structural quiz edits once history exists",async()=>{mock.db.quiz.findUniqueOrThrow.mockResolvedValue({courseId:"c",moduleId:"m",passScore:80,_count:{attempts:1}});await expect(executeAdmin({entity:"quiz",operation:"save",id:"q",data:quiz})).rejects.toThrow("attempts");expect(mock.db.question.deleteMany).not.toHaveBeenCalled();});
it("allows quiz metadata/status updates with attempts",async()=>{mock.db.quiz.findUniqueOrThrow.mockResolvedValue({courseId:"c",moduleId:"m",passScore:80,_count:{attempts:1}});const {questions:_questions,...metadata}=quiz;void _questions;await executeAdmin({entity:"quiz",operation:"save",id:"q",data:{...metadata,status:"PUBLISHED"}});expect(mock.db.quiz.update).toHaveBeenCalled();expect(mock.db.question.deleteMany).not.toHaveBeenCalled();});
it("swaps node orders through an unused order in one transaction",async()=>{mock.db.roadmapNode.findUniqueOrThrow.mockResolvedValue({id:"b",courseId:"c",order:2});mock.db.roadmapNode.findMany.mockResolvedValue([{id:"a",order:1},{id:"b",order:2}]);await executeAdmin({entity:"node",operation:"up",id:"b",data:{}});expect(mock.db.roadmapNode.update.mock.calls.map(c=>c[0])).toEqual([{where:{id:"b"},data:{order:3}},{where:{id:"a"},data:{order:2}},{where:{id:"b"},data:{order:1}}]);expect(mock.db.roadmapNode.delete).not.toHaveBeenCalled();});
it.each(["ACTIVE","INACTIVE"])("updates badge %s without deleting awards",async status=>{const data={name:"Badge",slug:"badge",description:"",icon:"star",conditionType:"QUIZ_COUNT",conditionValue:3,status};expect(badgeSchema.safeParse(data).success).toBe(true);await executeAdmin({entity:"badge",operation:"save",id:"b",data});expect(mock.db.badge.update).toHaveBeenCalled();expect(mock.db.badge.delete).not.toHaveBeenCalled();});

// Exercise real admin transaction orchestration + reconciliation, with only DB I/O mocked.
it.each(["DRAFT", "PUBLISHED"])("admin creates %s lesson and reconciles existing completion", async status => {
  let required = [{id:"old",moduleId:"m"}];
  let completedAt: Date | null = new Date("2026-01-01");
  mock.db.course.findUnique.mockImplementation(async () => ({id:"c",modules:[{id:"m",lessons:required}],quizzes:[],roadmapNodes:[]}));
  mock.db.enrollment.findMany.mockImplementation(async () => [{userId:"u",courseId:"c",completedAt}]);
  mock.db.lessonProgress.findMany.mockResolvedValue([{userId:"u",lessonId:"old",status:"COMPLETED"}]);
  mock.db.quizAttempt.findMany.mockResolvedValue([]);
  mock.db.enrollment.updateMany.mockImplementation(async ({data}) => { if(data.completedAt === null) completedAt=null; });
  mock.db.lesson.create.mockImplementation(async () => { if(status === "PUBLISHED") required=[...required,{id:"new",moduleId:"m"}];return {id:"new"}; });
  await executeAdmin({entity:"lesson",operation:"save",data:{...lesson,status}});
  expect(completedAt === null).toBe(status === "PUBLISHED");
  expect(mock.db.lessonProgress.deleteMany).not.toHaveBeenCalled();
});
it("admin creates a published quiz and invalidates completion in the same transaction",async()=>{
  let quizRequired=false;
  mock.db.quiz.create.mockImplementation(async()=>{quizRequired=true;return {id:"q"}});
  mock.db.course.findUnique.mockImplementation(async()=>({id:"c",modules:[{id:"m",lessons:[{id:"l",moduleId:"m"}]}],quizzes:quizRequired?[{id:"q",moduleId:"m"}]:[],roadmapNodes:[]}));
  mock.db.enrollment.findMany.mockResolvedValue([{userId:"u",courseId:"c",completedAt:new Date()}]);
  mock.db.lessonProgress.findMany.mockResolvedValue([{userId:"u",lessonId:"l",status:"COMPLETED"}]);
  mock.db.quizAttempt.findMany.mockResolvedValue([]);
  await executeAdmin({entity:"quiz",operation:"save",data:{...quiz,status:"PUBLISHED"}});
  expect(mock.db.enrollment.updateMany).toHaveBeenCalledWith({where:{userId:"u",courseId:"c",completedAt:{not:null}},data:{completedAt:null}});
});
