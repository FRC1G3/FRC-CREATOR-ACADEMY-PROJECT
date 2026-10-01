// Opt-in Neon smoke check. Every created record is tagged and removed in finally.
import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID,createHash } from "node:crypto";
import { getPrisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { executeAdmin } from "../src/services/admin";
import { availableRoadmapTargets } from "../src/lib/admin-roadmap";
import { progressStatus } from "../src/lib/admin-students";

async function main(){
 assert.equal(process.env.RUN_ADMIN_UNIVERSITY_CHECK,"1","Explicit opt-in required");
 const db=getPrisma(),tag=randomUUID(),adminId=randomUUID(),studentId=randomUUID(),email=`admin-university-${tag}@example.invalid`,password=randomUUID();let courseId="",emptyCourseId="";const badgeIds:string[]=[];
 try{
  await db.user.create({data:{id:adminId,name:"Temporary Admin University",email,role:"ADMIN",accounts:{create:{accountId:adminId,providerId:"credential",password:await hashPassword(password)}}}});
  await db.user.create({data:{id:studentId,name:"Temporary Student University",email:`student-${tag}@example.invalid`}});
  const login=await fetch(`${process.env.ADMIN_CHECK_ORIGIN||"http://localhost:3100"}/api/auth/sign-in/email`,{method:"POST",headers:{"Content-Type":"application/json",Origin:process.env.ADMIN_CHECK_ORIGIN||"http://localhost:3100"},body:JSON.stringify({email,password})});assert.equal(login.status,200);const cookie=login.headers.getSetCookie().map(v=>v.split(";")[0]).join("; ");
  const page=async(path:string)=>{const response=await fetch((process.env.ADMIN_CHECK_ORIGIN||"http://localhost:3100")+path,{headers:{cookie},redirect:"manual"});assert.equal(response.status,200,path);return response.text();};
  const course=await executeAdmin({entity:"course",operation:"save",data:{title:`University ${tag}`,slug:`university-${tag}`,shortDescription:"Temp",description:"Temp",thumbnailUrl:"",level:"BEGINNER",status:"DRAFT",instructorName:"Temp",estimatedDuration:1}});courseId=course.id;
  const empty=await executeAdmin({entity:"course",operation:"save",data:{title:`Empty ${tag}`,slug:`empty-${tag}`,shortDescription:"Temp",description:"Temp",thumbnailUrl:"",level:"BEGINNER",status:"DRAFT",instructorName:"Temp",estimatedDuration:1}});emptyCourseId=empty.id;
  const courseModule=await executeAdmin({entity:"module",operation:"save",data:{courseId,title:"Module",description:"",order:1}});
  const lesson=await executeAdmin({entity:"lesson",operation:"save",data:{courseId,moduleId:courseModule.id,title:"Published Lesson",slug:`lesson-${tag}`,description:"",videoUrl:"https://youtu.be/dQw4w9WgXcQ",thumbnailUrl:"",durationSeconds:60,order:1,status:"PUBLISHED"}});
  const quiz=await executeAdmin({entity:"quiz",operation:"save",data:{courseId,moduleId:courseModule.id,title:"Published Quiz",slug:`quiz-${tag}`,description:"",passScore:80,status:"PUBLISHED",questions:[{text:"Question",explanation:"",options:[{text:"Correct",isCorrect:true},{text:"Wrong",isCorrect:false}]}]}});
  for(const [name,icon] of [["One","play"],["Two","star"]] as const){const badge=await executeAdmin({entity:"badge",operation:"save",data:{name:`${name} ${tag}`,slug:`${name.toLowerCase()}-${tag}`,description:"",icon,conditionType:"STREAK",conditionValue:99999,status:"ACTIVE"}});badgeIds.push(badge.id);}
  const node=await executeAdmin({entity:"node",operation:"save",data:{courseId,type:"QUIZ",title:"Checkpoint",targetId:quiz.id}});assert(await db.roadmapNode.findUnique({where:{id:node.id}}));
  const snapshot={lessons:[{id:lesson.id,title:"Published Lesson"}],quizzes:[{id:quiz.id,title:"Published Quiz"}],roadmapNodes:await db.roadmapNode.findMany({where:{courseId},select:{lessonId:true,quizId:true,badgeId:true}})};
  assert.equal(availableRoadmapTargets("QUIZ",snapshot,[]).length,0);await assert.rejects(executeAdmin({entity:"node",operation:"save",data:{courseId,type:"QUIZ",title:"Duplicate",targetId:quiz.id}}),/already has/);
  const lessonNode=await executeAdmin({entity:"node",operation:"save",data:{courseId,type:"LESSON",title:"Lesson",targetId:lesson.id}});await executeAdmin({entity:"node",operation:"up",id:lessonNode.id,data:{}});assert.deepEqual((await db.roadmapNode.findMany({where:{courseId},orderBy:{order:"asc"},select:{id:true}})).map(n=>n.id),[lessonNode.id,node.id]);
  await executeAdmin({entity:"node",operation:"save",id:node.id,data:{title:"Renamed checkpoint"}});assert.equal((await db.roadmapNode.findUniqueOrThrow({where:{id:node.id}})).title,"Renamed checkpoint");
  await db.enrollment.create({data:{userId:studentId,courseId}});await db.lessonProgress.create({data:{userId:studentId,lessonId:lesson.id,status:"COMPLETED",completedAt:new Date()}});const attempt=await db.quizAttempt.create({data:{userId:studentId,quizId:quiz.id,score:100,passed:true,completedAt:new Date()}});await db.userBadge.create({data:{userId:studentId,badgeId:badgeIds[0]}});
  await assert.rejects(executeAdmin({entity:"quiz",operation:"delete",id:quiz.id,data:{}}),/learner history/);await assert.rejects(executeAdmin({entity:"badge",operation:"delete",id:badgeIds[0],data:{}}),/already been earned/);await assert.rejects(executeAdmin({entity:"node",operation:"delete",id:node.id,data:{}}),/learner history/);assert.equal(progressStatus(1,1,new Date()),"Completed");
  await executeAdmin({entity:"quiz",operation:"unpublish",id:quiz.id,data:{}});await executeAdmin({entity:"quiz",operation:"publish",id:quiz.id,data:{}});assert.equal((await db.quiz.findUniqueOrThrow({where:{id:quiz.id}})).status,"PUBLISHED");
  const [quizzes,roadmap,badges,students,detail]=await Promise.all([page("/admin/quizzes"),page("/admin/roadmap"),page("/admin/badges"),page("/admin/students"),page(`/admin/students/${studentId}`)]);assert(quizzes.includes("Published Quiz")&&quizzes.includes("Unpublish"));assert(roadmap.includes("Renamed checkpoint")&&!roadmap.includes('>Published Quiz</option>'));assert(badges.includes(`One ${tag}`)&&badges.includes(`Two ${tag}`));assert(students.includes(`Empty ${tag}`)&&students.includes("Quiz Attempts")&&students.includes("All progress"));assert(detail.includes("Course Progress")&&detail.includes("Quiz History")&&detail.includes("Earned Badges"));
  assert.equal(await db.quizAttempt.count({where:{id:attempt.id}}),1);console.log("PASS: quiz, roadmap, badge and students Admin flows persisted; protected history remained intact.");
 }finally{
  await db.quizAnswer.deleteMany({where:{attempt:{userId:studentId}}});await db.quizAttempt.deleteMany({where:{userId:studentId}});await db.userBadge.deleteMany({where:{userId:studentId}});await db.lessonProgress.deleteMany({where:{userId:studentId}});await db.enrollment.deleteMany({where:{userId:studentId}});
  if(courseId){await db.roadmapNode.deleteMany({where:{courseId}});await db.quiz.deleteMany({where:{courseId}});await db.lesson.deleteMany({where:{module:{courseId}}});await db.module.deleteMany({where:{courseId}});await db.course.deleteMany({where:{id:courseId}});}if(emptyCourseId)await db.course.deleteMany({where:{id:emptyCourseId}});await db.badge.deleteMany({where:{id:{in:badgeIds}}});await db.user.deleteMany({where:{id:{in:[adminId,studentId]}}});await db.authThrottle.deleteMany({where:{key:createHash("sha256").update(email).digest("hex")}});await db.$disconnect();console.log("Temporary Admin university fixtures removed.");
 }
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Admin university check failed");process.exitCode=1;});
