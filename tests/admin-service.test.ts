import { beforeEach, expect, it, vi } from "vitest";
import { Prisma } from "../src/generated/prisma/client";
const mock=vi.hoisted(()=>{
  const model=()=>({findUnique:vi.fn(),findUniqueOrThrow:vi.fn(),findFirst:vi.fn(),findMany:vi.fn(),create:vi.fn(),update:vi.fn(),updateMany:vi.fn(),delete:vi.fn(),deleteMany:vi.fn(),count:vi.fn()});
  return {db:{user:model(),course:model(),module:model(),lesson:model(),quiz:model(),question:model(),badge:model(),userBadge:model(),roadmapNode:model(),enrollment:model(),lessonProgress:model(),quizAttempt:model(),$queryRaw:vi.fn()},transaction:vi.fn()};
});
vi.mock("@/lib/prisma",()=>({getPrisma:()=>({$transaction:mock.transaction})}));
import { executeAdmin, adminError } from "../src/services/admin";
import { courseSchema, questionSchema, badgeSchema } from "../src/lib/admin-validation";
const course={title:"Test Course",slug:"test-course",shortDescription:"Short",description:"Full",instructorName:"Creator",level:"BEGINNER",status:"DRAFT",estimatedDuration:10};
const lesson={courseId:"c",moduleId:"m",title:"Lesson",slug:"lesson",description:"",videoUrl:"https://youtu.be/PHVuZ5I_Jb4",thumbnailUrl:"",durationSeconds:60,order:1,status:"PUBLISHED"};
const question={text:"Question",explanation:"",options:[{text:"A",isCorrect:true},{text:"B",isCorrect:false}]};
const quiz={courseId:"c",moduleId:"m",title:"Quiz",slug:"quiz",passScore:80,status:"DRAFT",questions:[question]};
beforeEach(()=>{vi.resetAllMocks();mock.transaction.mockImplementation(async fn=>fn(mock.db));mock.db.user.findMany.mockResolvedValue([]);mock.db.badge.findMany.mockResolvedValue([]);mock.db.badge.findUniqueOrThrow.mockResolvedValue({status:"ACTIVE",conditionType:"QUIZ_COUNT",conditionValue:1});mock.db.badge.update.mockResolvedValue({id:"b"});mock.db.badge.create.mockResolvedValue({id:"b"});mock.db.module.findUnique.mockResolvedValue({courseId:"c"});mock.db.module.findFirst.mockResolvedValue({id:"m"});mock.db.quiz.findUniqueOrThrow.mockResolvedValue({courseId:"c",moduleId:"m",passScore:80,_count:{attempts:0}});});
it("creates course with generated slug",async()=>{await executeAdmin({entity:"course",operation:"save",data:{...course,slug:""}});expect(mock.db.course.create).toHaveBeenCalledWith({data:expect.objectContaining({slug:"test-course"})});});
it.each(["DRAFT","PUBLISHED"])("updates course status %s without recreating",async status=>{await executeAdmin({entity:"course",operation:"save",id:"c",data:{...course,status}});expect(mock.db.course.update).toHaveBeenCalledWith({where:{id:"c"},data:expect.objectContaining({status})});expect(mock.db.course.create).not.toHaveBeenCalled();});
it("rejects invalid course enums",()=>expect(courseSchema.safeParse({...course,level:"invalid"}).success).toBe(false));
it("reports duplicate slug/order safely",()=>expect(adminError(new Prisma.PrismaClientKnownRequestError("SQL secret",{code:"P2002",clientVersion:"7.10.0"}))).toContain("already used"));
it("blocks deletion of a course with students",async()=>{mock.db.course.findUniqueOrThrow.mockResolvedValue({_count:{modules:0,quizzes:0,enrollments:1,roadmapNodes:0}});await expect(executeAdmin({entity:"course",operation:"delete",id:"c",data:{}})).rejects.toThrow("contains content or learning history");expect(mock.db.course.delete).not.toHaveBeenCalled();});
it("creates lesson in a valid module with DB video URL",async()=>{await executeAdmin({entity:"lesson",operation:"save",data:lesson});expect(mock.db.lesson.create).toHaveBeenCalledWith({data:expect.objectContaining({videoUrl:lesson.videoUrl,moduleId:"m"})});});
it("allocates the next lesson order while holding the course transaction lock",async()=>{
 mock.db.lesson.findFirst.mockResolvedValue({order:4});
 await executeAdmin({entity:"lesson",operation:"save",data:{...lesson,order:""}});
 expect(mock.db.lesson.create).toHaveBeenCalledWith({data:expect.objectContaining({moduleId:"m",order:5})});
 expect(mock.db.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(mock.db.lesson.findFirst.mock.invocationCallOrder[0]);
});
it("does not insert a lesson when its module is missing",async()=>{
 await expect(executeAdmin({entity:"lesson",operation:"save",data:{...lesson,moduleId:""}})).rejects.toThrow();expect(mock.db.lesson.create).not.toHaveBeenCalled();
});
it.each(["publish","unpublish"] as const)("changes course status through explicit %s action",async operation=>{
 await executeAdmin({entity:"course",id:"c",operation,data:{}});
 expect(mock.db.course.update).toHaveBeenCalledWith({where:{id:"c"},data:{status:operation==="publish"?"PUBLISHED":"DRAFT"}});
 expect(mock.db.enrollment.deleteMany).not.toHaveBeenCalled();
});
it("publishes a valid lesson and rejects missing video",async()=>{
 mock.db.lesson.findUniqueOrThrow.mockResolvedValue({module:{courseId:"c"},videoUrl:lesson.videoUrl});
 await executeAdmin({entity:"lesson",id:"l",operation:"publish",data:{}});
 expect(mock.db.lesson.update).toHaveBeenCalledWith({where:{id:"l"},data:{status:"PUBLISHED"}});
 mock.db.lesson.update.mockClear();mock.db.lesson.findUniqueOrThrow.mockResolvedValue({module:{courseId:"c"},videoUrl:""});
 await expect(executeAdmin({entity:"lesson",id:"l",operation:"publish",data:{}})).rejects.toThrow("video URL");expect(mock.db.lesson.update).not.toHaveBeenCalled();
});
it("blocks lesson deletion when direct learner history exists",async()=>{
 mock.db.lesson.findUniqueOrThrow.mockResolvedValue({module:{courseId:"c"}});mock.db.lessonProgress.count.mockResolvedValue(1);
 await expect(executeAdmin({entity:"lesson",id:"l",operation:"delete",data:{}})).rejects.toThrow("learner history");
 expect(mock.db.lesson.delete).not.toHaveBeenCalled();expect(mock.db.roadmapNode.deleteMany).not.toHaveBeenCalled();
});
it("removes only an unused lesson's structural roadmap node before deletion",async()=>{
 mock.db.lesson.findUniqueOrThrow.mockResolvedValue({module:{courseId:"c"}});mock.db.lessonProgress.count.mockResolvedValue(0);mock.db.roadmapNode.count.mockResolvedValue(1);mock.db.enrollment.count.mockResolvedValue(0);mock.db.quizAttempt.count.mockResolvedValue(0);
 await executeAdmin({entity:"lesson",id:"l",operation:"delete",data:{}});
 expect(mock.db.roadmapNode.deleteMany).toHaveBeenCalledWith({where:{lessonId:"l"}});expect(mock.db.lesson.delete).toHaveBeenCalledWith({where:{id:"l"}});expect(mock.db.lessonProgress.deleteMany).not.toHaveBeenCalled();
});
it("keeps a structural lesson when the course path already has students",async()=>{
 mock.db.lesson.findUniqueOrThrow.mockResolvedValue({module:{courseId:"c"}});mock.db.lessonProgress.count.mockResolvedValue(0);mock.db.roadmapNode.count.mockResolvedValue(1);mock.db.enrollment.count.mockResolvedValue(1);
 await expect(executeAdmin({entity:"lesson",id:"l",operation:"delete",data:{}})).rejects.toThrow("learning path");expect(mock.db.roadmapNode.deleteMany).not.toHaveBeenCalled();expect(mock.db.lesson.delete).not.toHaveBeenCalled();
});
it("revalidates uploaded image bytes before opening a write transaction",async()=>{
 await expect(executeAdmin({entity:"course",operation:"save",data:{...course,thumbnailUrl:"data:image/jpeg;base64,/9j/AAAA"}})).rejects.toThrow("Invalid image");expect(mock.transaction).not.toHaveBeenCalled();
});
it("editing one badge targets only that badge and retains its independent icon",async()=>{
 const icons:Record<string,string>={a:"play",b:"star",c:"flame"};mock.db.badge.update.mockImplementation(async({where,data})=>{icons[where.id]=data.icon;return{id:where.id};});
 await executeAdmin({entity:"badge",operation:"save",id:"b",data:{name:"B",slug:"b",description:"",icon:"crown",conditionType:"QUIZ_COUNT",conditionValue:1,status:"ACTIVE"}});
 expect(icons).toEqual({a:"play",b:"crown",c:"flame"});
});
it("rejects foreign module",async()=>{mock.db.module.findUnique.mockResolvedValue({courseId:"other"});await expect(executeAdmin({entity:"lesson",operation:"save",data:lesson})).rejects.toThrow("belonging");expect(mock.db.lesson.create).not.toHaveBeenCalled();});
it("edits existing lesson ID without touching progress",async()=>{mock.db.lesson.findUniqueOrThrow.mockResolvedValue({moduleId:"m"});await executeAdmin({entity:"lesson",operation:"save",id:"l",data:lesson});expect(mock.db.lesson.update).toHaveBeenCalledWith({where:{id:"l"},data:expect.objectContaining({videoUrl:lesson.videoUrl})});expect(mock.db.lessonProgress.deleteMany).not.toHaveBeenCalled();});
it("creates quiz and nested questions/options atomically",async()=>{await executeAdmin({entity:"quiz",operation:"save",data:quiz});expect(mock.transaction).toHaveBeenCalledTimes(1);expect(mock.db.quiz.create).toHaveBeenCalledWith({data:expect.objectContaining({questions:{create:[expect.objectContaining({order:1,options:{create:[{text:"A",isCorrect:true,order:1},{text:"B",isCorrect:false,order:2}]}})]}})});});
it.each([0,2])("rejects %s correct options",correct=>expect(questionSchema.safeParse({...question,options:question.options.map((o,i)=>({...o,isCorrect:i<correct}))}).success).toBe(false));
it("locks structural quiz edits once history exists",async()=>{mock.db.quiz.findUniqueOrThrow.mockResolvedValue({courseId:"c",moduleId:"m",passScore:80,_count:{attempts:1}});await expect(executeAdmin({entity:"quiz",operation:"save",id:"q",data:quiz})).rejects.toThrow("attempts");expect(mock.db.question.deleteMany).not.toHaveBeenCalled();});
it("blocks quiz deletion with learner history and keeps attempts",async()=>{mock.db.quiz.findUniqueOrThrow.mockResolvedValue({courseId:"c"});mock.db.quizAttempt.count.mockResolvedValue(1);await expect(executeAdmin({entity:"quiz",operation:"delete",id:"q",data:{}})).rejects.toThrow("learner history");expect(mock.db.quiz.delete).not.toHaveBeenCalled();expect(mock.db.quizAttempt.deleteMany).not.toHaveBeenCalled();});
it("blocks deletion of an earned badge",async()=>{mock.db.userBadge.count.mockResolvedValue(1);await expect(executeAdmin({entity:"badge",operation:"delete",id:"b",data:{}})).rejects.toThrow("already been earned");expect(mock.db.badge.delete).not.toHaveBeenCalled();});
it("publishes and unpublishes quizzes without deleting attempts",async()=>{mock.db.quiz.findUniqueOrThrow.mockResolvedValue({courseId:"c"});await executeAdmin({entity:"quiz",operation:"publish",id:"q",data:{}});await executeAdmin({entity:"quiz",operation:"unpublish",id:"q",data:{}});expect(mock.db.quiz.update.mock.calls.map(call=>call[0].data.status)).toEqual(["PUBLISHED","DRAFT"]);expect(mock.db.quizAttempt.deleteMany).not.toHaveBeenCalled();});
it("edits only safe roadmap title metadata",async()=>{mock.db.roadmapNode.findUniqueOrThrow.mockResolvedValue({id:"n",courseId:"c",order:1});mock.db.roadmapNode.findMany.mockResolvedValue([{id:"n",order:1}]);await executeAdmin({entity:"node",operation:"save",id:"n",data:{title:"Renamed"}});expect(mock.db.roadmapNode.update).toHaveBeenCalledWith({where:{id:"n"},data:{title:"Renamed"}});});
it("rejects a duplicate roadmap target on the server",async()=>{mock.db.roadmapNode.findMany.mockResolvedValue([{lessonId:"l",quizId:null,badgeId:null,order:1}]);mock.db.lesson.findFirst.mockResolvedValue({id:"l"});await expect(executeAdmin({entity:"node",operation:"save",data:{courseId:"c",type:"LESSON",title:"Lesson",targetId:"l"}})).rejects.toThrow("already has");expect(mock.db.roadmapNode.create).not.toHaveBeenCalled();});
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
  expect(mock.db.enrollment.updateMany).toHaveBeenCalledWith({where:{userId:{in:["u"]},courseId:"c",completedAt:{not:null}},data:{completedAt:null}});
});
const badgeData={name:"Badge",slug:"badge",description:"",icon:"star",conditionType:"QUIZ_COUNT",conditionValue:1,status:"ACTIVE"};
it.each(["create","activate","condition"])("reconciles relevant existing learners after badge %s",async change=>{
  mock.db.badge.findUniqueOrThrow.mockResolvedValue({...badgeData,status:change==="activate"?"INACTIVE":"ACTIVE",conditionValue:change==="condition"?3:1});
  await executeAdmin({entity:"badge",operation:"save",...(change==="create"?{}:{id:"b"}),data:badgeData});
  expect(mock.db.user.findMany).toHaveBeenCalledTimes(1);
  expect(mock.db.badge.findMany.mock.calls[0][0].where).toEqual({status:"ACTIVE",id:"b"});
  expect(mock.db.userBadge.deleteMany).not.toHaveBeenCalled();
});
it("does not reconcile all students for icon/name-only changes or deactivation",async()=>{
  mock.db.badge.findUniqueOrThrow.mockResolvedValue(badgeData);
  await executeAdmin({entity:"badge",operation:"save",id:"b",data:{...badgeData,name:"Renamed",icon:"crown"}});
  await executeAdmin({entity:"badge",operation:"save",id:"b",data:{...badgeData,status:"INACTIVE"}});
  expect(mock.db.user.findMany).not.toHaveBeenCalled();expect(mock.db.userBadge.deleteMany).not.toHaveBeenCalled();
});
