import "dotenv/config";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { getPrisma } from "../src/lib/prisma";
import { TEMP_LESSON_VIDEO_URL } from "./video-default";
import type { AdminCommand, AdminResult } from "../src/lib/admin-validation";
const base="http://localhost:3100";
const manifest=JSON.parse(readFileSync(".next/server/server-reference-manifest.json","utf8"));
const ids=Object.fromEntries(Object.entries(manifest.node).map(([id,value])=>[(value as {exportedName:string}).exportedName,id]));
const db=getPrisma();
let stage="auth";
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

async function main() {
  assert.notEqual(process.env.NODE_ENV,"production");
  assert.ok(process.argv.includes("--allow-fixtures"));
  const admin=new Client(),student=new Client();
  await admin.login("admin@frc.academy","/admin");await student.login("student@frc.academy","/dashboard");
  const history=async()=>({progress:await db.lessonProgress.findMany({orderBy:{id:"asc"}}),attempts:await db.quizAttempt.findMany({orderBy:{id:"asc"}}),answers:await db.quizAnswer.findMany({orderBy:{id:"asc"}}),enrollments:await db.enrollment.findMany({orderBy:{id:"asc"}}),badges:await db.userBadge.findMany({orderBy:{id:"asc"}})});
  const before=await history();
  async function command(input:AdminCommand,expectedError=false) {
    const response=await admin.action("/admin/courses","mutateAdmin",[input]);
    let result:AdminResult|undefined;
    for(const line of response.text.split('\n')){const index=line.indexOf(':');if(index<0)continue;try{const value=JSON.parse(line.slice(index+1));if(value && typeof value==='object' && (typeof value.error==='string'||typeof value.success==='string'))result=value;}catch{}}
    assert.ok(result,"Missing action result");
    assert.equal(Boolean(result.error),expectedError, result.error ?? "Expected rejection");
    return result;
  }
  const seedCourse=await db.course.findUniqueOrThrow({where:{slug:"youtube"}});
  const seedLesson=await db.lesson.findFirstOrThrow({where:{slug:"how-youtube-works"}});
  const seedQuiz=await db.quiz.findUniqueOrThrow({where:{slug:"youtube-basics"}});
  const seedStudent=await db.user.findUniqueOrThrow({where:{email:"student@frc.academy"},select:{id:true}});
  stage="authorization and routes";
  for(const entity of ["course","lesson","quiz","badge"]){const rejected=await student.action('/dashboard','mutateAdmin',[{entity,operation:'save',data:{role:'ADMIN'}}]);assert.ok(rejected.response.headers.get('x-action-redirect')?.startsWith('/dashboard'));}
  for(const path of ['/admin','/admin/courses','/admin/courses/new','/admin/courses/'+seedCourse.id+'/edit','/admin/lessons','/admin/lessons/new','/admin/lessons/'+seedLesson.id+'/edit','/admin/quizzes','/admin/quizzes/new','/admin/quizzes/'+seedQuiz.id+'/edit','/admin/roadmap','/admin/badges','/admin/students','/admin/students/'+seedStudent.id]){const page=await admin.request(path);assert.equal(page.response.status,200);assert.ok(!page.text.includes('NEXT_HTTP_ERROR_FALLBACK'));console.log('PASS route',path.replace(/c[a-z0-9]{20,}/g,':id'));}
  for(const path of ['/dashboard','/courses','/courses/youtube','/quizzes/youtube-basics','/roadmap','/achievements','/profile']){assert.equal((await student.request(path)).response.status,200);}
  for(const slug of ['how-youtube-works','creator-mindset','thumbnail-psychology']){const page=await student.request('/learn/'+slug);assert.equal(page.response.status,200);assert.ok(page.text.includes('<iframe'));assert.ok(page.text.includes('https://www.youtube.com/embed/PHVuZ5I_Jb4'));console.log('PASS YouTube iframe',slug);}
  assert.equal(await db.lesson.count(),await db.lesson.count({where:{videoUrl:TEMP_LESSON_VIDEO_URL}}));
  console.log('PASS all current lesson URLs; admin/student routes and mutation protection');
  stage="course CRUD";
  const suffix=Date.now().toString(36), prefix='admin-check-'+suffix;
  const courseData={title:'Admin verification '+suffix,slug:prefix,shortDescription:'Verification',description:'Temporary verification fixture',thumbnailUrl:'',level:'BEGINNER',status:'DRAFT',instructorName:'F.R.C',estimatedDuration:1};
  const created=await command({entity:'course',operation:'save',data:courseData});const courseId=created.id!;
  await command({entity:'course',operation:'save',data:courseData},true);
  await command({entity:'course',operation:'save',id:courseId,data:{...courseData,status:'PUBLISHED'}});
  assert.equal((await student.request('/courses/'+prefix)).response.status,200);
  await command({entity:'course',operation:'save',id:courseId,data:courseData});
  const hidden=await student.request('/courses/'+prefix);assert.ok(hidden.response.status===404 || hidden.text.includes('NEXT_HTTP_ERROR_FALLBACK;404'));
  stage='module and lesson CRUD';
  const moduleData={courseId,title:'Verification module',description:'',order:1};
  const moduleId=(await command({entity:'module',operation:'save',data:moduleData})).id!;
  await command({entity:'module',operation:'save',id:moduleId,data:{...moduleData,title:'Renamed module'}});
  const lessonData={courseId,moduleId,title:'Verification lesson',slug:prefix+'-lesson',description:'Test',videoUrl:TEMP_LESSON_VIDEO_URL,thumbnailUrl:'',durationSeconds:60,order:1,status:'DRAFT'};
  await command({entity:'lesson',operation:'save',data:{...lessonData,moduleId:'missing'}},true);
  const lessonId=(await command({entity:'lesson',operation:'save',data:lessonData})).id!;
  await command({entity:'lesson',operation:'save',id:lessonId,data:{...lessonData,videoUrl:'https://cdn.example.org/video.mp4',title:'Edited verification lesson'}});
  assert.equal((await db.lesson.findUniqueOrThrow({where:{id:lessonId}})).videoUrl,'https://cdn.example.org/video.mp4');
  await command({entity:'module',operation:'delete',id:moduleId,data:{}},true);
  stage='quiz CRUD';
  const questions=[{text:'Question?',explanation:'Explanation',options:[{text:'A',isCorrect:true},{text:'B',isCorrect:false}]}];
  const quizData={courseId,moduleId,title:'Verification quiz',slug:prefix+'-quiz',description:'',passScore:80,status:'DRAFT',questions};
  await command({entity:'quiz',operation:'save',data:{...quizData,questions:[{...questions[0],options:[{text:'A',isCorrect:false},{text:'B',isCorrect:false}]}]}},true);
  const quizId=(await command({entity:'quiz',operation:'save',data:quizData})).id!;
  await command({entity:'quiz',operation:'save',id:quizId,data:{...quizData,title:'Edited quiz'}});
  assert.equal(await db.question.count({where:{quizId}}),1);
  await command({entity:'quiz',operation:'save',id:seedQuiz.id,data:{courseId:seedQuiz.courseId,moduleId:seedQuiz.moduleId,title:seedQuiz.title,slug:seedQuiz.slug,description:seedQuiz.description,passScore:seedQuiz.passScore,status:seedQuiz.status,questions}},true);
  await command({entity:'quiz',operation:'delete',id:seedQuiz.id,data:{}},true);
  await command({entity:'course',operation:'delete',id:seedCourse.id,data:{}},true);
  stage='badge and roadmap CRUD';
  const badgeData={name:'Verification badge',slug:prefix+'-badge',description:'Test',icon:'star',conditionType:'QUIZ_COUNT',conditionValue:99,status:'INACTIVE'};
  const badgeId=(await command({entity:'badge',operation:'save',data:badgeData})).id!;
  await command({entity:'badge',operation:'save',id:badgeId,data:{...badgeData,name:'Updated verification badge'}});
  const earned=await db.badge.findUniqueOrThrow({where:{slug:'creator-starter'}});
  await command({entity:'badge',operation:'delete',id:earned.id,data:{}},true);
  const n1=(await command({entity:'node',operation:'save',data:{courseId,type:'LESSON',title:'Lesson',targetId:lessonId}})).id!;
  const n2=(await command({entity:'node',operation:'save',data:{courseId,type:'QUIZ',title:'Quiz',targetId:quizId}})).id!;
  const n3=(await command({entity:'node',operation:'save',data:{courseId,type:'REWARD',title:'Badge',targetId:badgeId}})).id!;
  await command({entity:'node',operation:'up',id:n2,data:{}});
  let nodes=await db.roadmapNode.findMany({where:{courseId},orderBy:{order:'asc'}});assert.deepEqual(nodes.map(n=>n.id),[n2,n1,n3]);assert.equal(new Set(nodes.map(n=>n.order)).size,3);
  await command({entity:'node',operation:'down',id:n2,data:{}});
  nodes=await db.roadmapNode.findMany({where:{courseId},orderBy:{order:'asc'}});assert.deepEqual(nodes.map(n=>n.id),[n1,n2,n3]);
  assert.deepEqual(await history(),before);
  console.log('PASS course/module/lesson/quiz/badge CRUD, unique ordering, history safety');
  stage='safe fixture cleanup';
  for(const id of [n1,n2,n3]) await command({entity:'node',operation:'delete',id,data:{}});
  await command({entity:'lesson',operation:'delete',id:lessonId,data:{}});
  await command({entity:'quiz',operation:'delete',id:quizId,data:{}});
  await command({entity:'module',operation:'delete',id:moduleId,data:{}});
  await command({entity:'course',operation:'delete',id:courseId,data:{}});
  await command({entity:'badge',operation:'delete',id:badgeId,data:{}});
  assert.deepEqual(await history(),before);
  console.log('PASS fixture cleanup; history unchanged; lessons',await db.lesson.count(),'with supplied URL',await db.lesson.count({where:{videoUrl:TEMP_LESSON_VIDEO_URL}}));
  await admin.action('/admin','logout',[]);await student.action('/dashboard','logout',[]);
}
main().catch(error=>{console.error('FAIL admin verification at',stage,error instanceof assert.AssertionError?error.message:'Safe failure; raw details omitted');process.exitCode=1;}).finally(()=>db.$disconnect());
