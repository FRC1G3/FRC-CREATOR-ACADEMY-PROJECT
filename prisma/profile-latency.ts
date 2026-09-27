import "dotenv/config";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { getPrisma } from "../src/lib/prisma";
import { writeFileSync } from "node:fs";
const base="http://localhost:3100";
const manifest=JSON.parse(readFileSync(".next/server/server-reference-manifest.json","utf8"));
const ids=Object.fromEntries(Object.entries(manifest.node).map(([id,value])=>[(value as {exportedName:string}).exportedName,id]));
const db=getPrisma();
class Client {
  cookies = new Map<string, string>();
  async request(path: string, init: RequestInit = {}) {
    const response = await fetch(base + path, { ...init, redirect: "manual", headers: { ...init.headers, cookie: [...this.cookies].map(([k,v]) => `${k}=${v}`).join("; "), origin: base } });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";")[0], split = pair.indexOf("=");
      this.cookies.set(pair.slice(0, split), pair.slice(split + 1));
    }
    return { response, text: await response.text() };
  }
  async action(path: string, name: string, args: unknown[], fields?: Record<string, string>) {
    let body: BodyInit;
    const headers: Record<string,string> = { "Next-Action": ids[name], accept: "text/x-component" };
    if (fields) {
      const form = new FormData();
      for (const [key,value] of Object.entries(fields)) form.set(`_1_${key}`,value);
      form.set("0", JSON.stringify([{}, "$K1"]));
      body = form;
    } else { body = JSON.stringify(args); headers["content-type"] = "text/plain;charset=UTF-8"; }
    return this.request(path, { method: "POST", headers, body });
  }
  async login(email: string, destination: string) {
    const result = await this.action("/login", "authenticate", [], { mode: "login", email, password: process.env.SEED_PASSWORD!, remember: "on" });
    assert.ok(result.response.headers.get("x-action-redirect")?.startsWith(destination), `Login redirect failed (${result.response.status})`);
    console.log(`PASS ${email}: login redirects to ${destination}`);
  }
}




import { hashPassword } from '../src/lib/password';
async function main(){
 const label=process.argv.includes('--after')?'after':'before';
 const email='performance-audit-'+Date.now()+'@example.invalid';
 const course=await db.course.findUniqueOrThrow({where:{slug:'youtube'},include:{modules:{orderBy:{order:'asc'},include:{lessons:{where:{status:'PUBLISHED'},orderBy:{order:'asc'}}}}}});
 const lesson=course.modules[0].lessons[0];
 const fixtureId=crypto.randomUUID();
 const account=await db.user.create({data:{id:fixtureId,email,name:'Temporary Performance Audit',accounts:{create:{providerId:'credential',accountId:fixtureId,password:await hashPassword(process.env.SEED_PASSWORD!)}},enrollments:{create:{courseId:course.id}}}});
 const user=new Client(); const timings=[];
 try{
 await user.login(email,'/dashboard');
 for(let i=0;i<4;i++){
  await db.lessonProgress.deleteMany({where:{userId:account.id}});
  await db.userBadge.deleteMany({where:{userId:account.id}});
  const start=performance.now();const result=await user.action('/learn/'+lesson.slug,'completeLesson',[],{slug:lesson.slug});
  assert.ok(result.text.includes('Lesson completed.'),'Completion failed');
  timings.push({operation:'complete',sample:i,ms:Math.round(performance.now()-start)});
 }
 for(const path of ['/dashboard','/courses','/courses/youtube','/roadmap','/profile','/achievements']){
  for(let i=0;i<4;i++){const start=performance.now();const page=await user.request(path);assert.equal(page.response.status,200);timings.push({operation:path,sample:i,ms:Math.round(performance.now()-start)});}
 }
 console.log(JSON.stringify(timings));writeFileSync('docs/latency-'+label+'.json',JSON.stringify({note:'Sequential production HTTP, temporary enrolled user, first sample is first-process-use NOT proven Neon cold start; milliseconds including full response, no browser rendering.',timings},null,2));

 if(label==='after'){
  await db.user.update({where:{id:account.id},data:{role:'ADMIN'}});
  const adminPage=await user.request('/admin');assert.ok(adminPage.text.includes('admin-sidebar'),'Live promotion not reflected');
  await db.user.update({where:{id:account.id},data:{role:'STUDENT'}});
  const denied=await user.request('/admin');assert.ok(!denied.text.includes('id="admin-sidebar"'),'Stale admin role');
  console.log('PASS live role promotion/demotion in same session');
  const quiz=await db.quiz.findFirstOrThrow({where:{courseId:course.id,status:'PUBLISHED'},orderBy:{module:{order:'asc'}},include:{questions:{include:{options:true}}}});
  const courseModule=course.modules.find(m=>m.id===quiz.moduleId)!;
  for(const item of courseModule.lessons)await db.lessonProgress.upsert({where:{userId_lessonId:{userId:account.id,lessonId:item.id}},create:{userId:account.id,lessonId:item.id,status:'COMPLETED',completedAt:new Date()},update:{status:'COMPLETED',completedAt:new Date()}});
  const quizStart=performance.now();const submitted=await user.action('/quizzes/'+quiz.slug,'submitQuiz',[{quizId:quiz.slug,requestId:crypto.randomUUID(),answers:quiz.questions.map(q=>({questionId:q.id,optionId:q.options.find(o=>o.isCorrect)!.id}))}]);
  assert.ok(submitted.text.includes('/result?attempt='),'Quiz submit failed');console.log('PASS quiz submit HTTP ms',Math.round(performance.now()-quizStart));
  assert.ok(await db.userBadge.count({where:{userId:account.id}})>0,'First-section badge not awarded');
  const locked=course.modules.at(-1)!.lessons.at(-1)!;
  const blocked=await user.action('/learn/'+lesson.slug,'completeLesson',[],{slug:locked.slug});assert.ok(blocked.text.includes('earlier roadmap'),'Locked lesson bypass');
  console.log('PASS first-module quiz, badge award and locked lesson rejection');
 }
 }finally{
 const attempts=await db.quizAttempt.findMany({where:{userId:account.id},select:{id:true}});
 await db.quizAnswer.deleteMany({where:{attemptId:{in:attempts.map(a=>a.id)}}});await db.quizAttempt.deleteMany({where:{userId:account.id}});
 await db.session.deleteMany({where:{userId:account.id}});await db.account.deleteMany({where:{userId:account.id}});await db.userBadge.deleteMany({where:{userId:account.id}});await db.lessonProgress.deleteMany({where:{userId:account.id}});await db.enrollment.deleteMany({where:{userId:account.id}});await db.user.delete({where:{id:account.id}});console.log('Temporary audit user cleaned up.');
 }
}
main().catch(()=>{console.error('Performance audit failed (private details omitted)');process.exitCode=1}).finally(()=>db.$disconnect());
