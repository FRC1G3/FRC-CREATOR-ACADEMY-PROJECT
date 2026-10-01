// Explicit opt-in. Uses the existing connection; creates and cleans only this run's records.
import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getPrisma } from "../src/lib/prisma";
import { courseState, studentOverview, accessible, reconcileCourseEnrollments } from "../src/services/learning";
import { executeAdmin } from "../src/services/admin";
import { quizResultInclude } from "../src/services/quiz-results";
import { adminCourseProgress } from "../src/lib/admin-students";

async function main() {
  assert.equal(process.env.RUN_FINAL_CONSISTENCY_CHECK,"1","Explicit opt-in required");
  const db=getPrisma(),suffix=randomUUID(),userId=randomUUID(),courseId=randomUUID(),badgeId=randomUUID();
  let created=false;
  try {
    await db.user.create({data:{id:userId,name:"Temporary Final Audit",email:`final-audit-${suffix}@example.invalid`}});
    created=true;
    const course=await db.course.create({data:{id:courseId,slug:`final-audit-${suffix}`,title:"Temporary Final Audit",description:"Isolated verification",shortDescription:"Test",instructorName:"Test",status:"PUBLISHED",enrollments:{create:{userId}},modules:{create:[{title:"Published",order:1,lessons:{create:[1,2,3].map(order=>({title:`Lesson ${order}`,slug:`audit-${suffix}-${order}`,description:"Test",order,status:"PUBLISHED",videoUrl:"https://youtu.be/PHVuZ5I_Jb4",durationSeconds:60}))}},{title:"Draft only",order:2,lessons:{create:{title:"Draft lesson",slug:`draft-${suffix}`,description:"Test",order:1,status:"DRAFT",videoUrl:"",durationSeconds:60}}}]}},include:{modules:{orderBy:{order:"asc"},include:{lessons:{orderBy:{order:"asc"}}}}}});
    const moduleId=course.modules[0].id,lessons=course.modules[0].lessons;
    const quiz=await db.quiz.create({data:{slug:`audit-quiz-${suffix}`,courseId,moduleId,title:"Checkpoint",status:"PUBLISHED",questions:{create:[3,1,2].map(order=>({text:`Question ${order}`,order,options:{create:[{text:"Right",order:1,isCorrect:true},{text:"Wrong",order:2}]}}))}},include:{questions:{include:{options:true}}}});
    await db.roadmapNode.createMany({data:[...lessons.map((l,i)=>({courseId,lessonId:l.id,type:"LESSON" as const,title:l.title,order:i+1})),{courseId,quizId:quiz.id,type:"QUIZ",title:"Checkpoint",order:4}]});
    await assert.rejects(accessible(userId,"QUIZ",quiz.slug),/earlier roadmap/);
    await db.lessonProgress.createMany({data:lessons.map(l=>({userId,lessonId:l.id,status:"COMPLETED" as const,completedAt:new Date()}))});
    let state=(await courseState(userId,course.slug))!;
    assert.equal(state.percentage,75);assert.equal(state.complete,false);assert.equal(state.course.modules.length,1);
    assert.equal((await studentOverview(userId)).percentage,75);
    assert.equal(adminCourseProgress(state.course,state.progress,state.attempts).progress,75);
    assert.equal((await accessible(userId,"QUIZ",quiz.slug))?.node.status,"current");
    const attempt=await db.quizAttempt.create({data:{userId,quizId:quiz.id,score:100,passed:true,completedAt:new Date(),answers:{create:quiz.questions.map(q=>({questionId:q.id,selectedOptionId:q.options.find(o=>o.isCorrect)!.id,isCorrect:true}))}}});
    const result=await db.quizAttempt.findUniqueOrThrow({where:{id:attempt.id},include:quizResultInclude});
    assert.deepEqual(result.answers.map(a=>a.question.order),[1,2,3]);
    await db.quizAttempt.create({data:{userId,quizId:quiz.id,score:0,passed:false,completedAt:new Date()}});
    state=(await courseState(userId,course.slug))!;assert.equal(state.percentage,100);assert.equal(state.passed.size,1);
    const reconcile=()=>db.$transaction(async tx=>{await tx.$queryRaw`SELECT "id" FROM "Course" WHERE "id" = ${courseId} FOR UPDATE`;await reconcileCourseEnrollments(courseId,tx);},{timeout:30000});
    await reconcile();
    const completion=await db.enrollment.findUniqueOrThrow({where:{userId_courseId:{userId,courseId}}});assert(completion.completedAt);
    await executeAdmin({entity:"lesson",operation:"save",data:{courseId,moduleId,title:"New Draft",slug:`new-draft-${suffix}`,description:"",videoUrl:"",thumbnailUrl:"",durationSeconds:60,order:4,status:"DRAFT"}});
    assert.equal((await db.enrollment.findUniqueOrThrow({where:{id:completion.id}})).completedAt?.getTime(),completion.completedAt.getTime());
    const added=await executeAdmin({entity:"lesson",operation:"save",data:{courseId,moduleId,title:"New Published",slug:`new-published-${suffix}`,description:"",videoUrl:"https://youtu.be/PHVuZ5I_Jb4",thumbnailUrl:"",durationSeconds:60,order:5,status:"PUBLISHED"}});
    assert.equal((await db.enrollment.findUniqueOrThrow({where:{id:completion.id}})).completedAt,null);
    assert.equal((await courseState(userId,course.slug))!.percentage,80);
    await db.lessonProgress.create({data:{userId,lessonId:added.id,status:"COMPLETED",completedAt:new Date()}});await reconcile();
    assert((await db.enrollment.findUniqueOrThrow({where:{id:completion.id}})).completedAt);
    const pending=await db.quiz.create({data:{slug:`pending-${suffix}`,courseId,moduleId,title:"Pending checkpoint",status:"PUBLISHED"}});
    await reconcile();assert.equal((await courseState(userId,course.slug))!.complete,false);
    await db.badge.create({data:{id:badgeId,slug:`audit-badge-${suffix}`,name:"Temporary Audit Badge",description:"Test",icon:"star",conditionType:"COURSE_COMPLETE",conditionValue:1,status:"ACTIVE"}});
    const answersBefore=await db.quizAnswer.count({where:{attempt:{userId}}});
    await executeAdmin({entity:"quiz",operation:"unpublish",id:pending.id,data:{}});
    assert.equal((await courseState(userId,course.slug))!.percentage,100);
    assert(await db.userBadge.findUnique({where:{userId_badgeId:{userId,badgeId}}}));
    assert.equal(await db.quizAnswer.count({where:{attempt:{userId}}}),answersBefore);
    assert.equal(await accessible(userId,"QUIZ",pending.slug),null);
    console.log("PASS: real PostgreSQL visibility, shared progress, ordered answer review, completion transitions, targeted badge reconciliation and preserved attempt history.");
  } finally {
    if(created) {
    await db.quizAnswer.deleteMany({where:{attempt:{userId}}});
    await db.quizAttempt.deleteMany({where:{userId}});
    await db.userBadge.deleteMany({where:{userId}});
    await db.lessonProgress.deleteMany({where:{userId}});
    await db.enrollment.deleteMany({where:{userId}});
    await db.course.deleteMany({where:{id:courseId}});
    await db.badge.deleteMany({where:{id:badgeId}});
    await db.user.deleteMany({where:{id:userId}});
    assert.equal(await db.user.count({where:{id:userId}}),0);assert.equal(await db.course.count({where:{id:courseId}}),0);assert.equal(await db.badge.count({where:{id:badgeId}}),0);
    console.log("PASS: this run's temporary users, content, attempts and awards removed.");
    }
    await db.$disconnect();
  }
}
main().catch(error=>{if(error instanceof Error && error.name==="AssertionError")console.error(error.message);console.error("Final consistency verification failed: " + (error instanceof Error ? error.name + ("code" in error ? " (" + String(error.code) + ")" : "") : "unknown") + ". No connection values logged.");process.exitCode=1;});
