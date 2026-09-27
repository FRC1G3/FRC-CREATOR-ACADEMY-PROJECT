import "dotenv/config";
import fs, { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { getPrisma } from "../src/lib/prisma";

const base="http://localhost:3100";
const manifest=JSON.parse(readFileSync(".next/server/server-reference-manifest.json","utf8"));
const ids=Object.fromEntries(Object.entries(manifest.node).map(([id,value])=>[(value as {exportedName:string}).exportedName,id]));
const db=getPrisma();
const stage="auth";
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



async function main(){
const student=new Client();await student.login('student@frc.academy','/dashboard');
const course=await student.request('/courses/youtube');assert.ok(course.text.includes('aria-controls="course-module-'));assert.ok(course.text.includes('Expand All'));console.log('PASS curriculum button/panel markup');
const lesson=await student.request('/learn/how-youtube-works');assert.ok(lesson.text.includes('<details open=""'));assert.ok(lesson.text.includes('<summary class="lesson-module-heading"'));console.log('PASS native lesson disclosures');
const account=await db.user.findUniqueOrThrow({where:{email:'student@frc.academy'},select:{id:true,name:true,bio:true,avatarUrl:true}});
const failed=await student.action('/profile','saveProfile',[],{name:'',bio:account.bio??'',avatarUrl:account.avatarUrl??''});assert.ok(failed.text.includes('Check your name'));console.log('PASS profile validation response');
const saved=await student.action('/profile','saveProfile',[],{name:account.name,bio:account.bio??'',avatarUrl:account.avatarUrl??''});assert.ok(saved.text.includes('Profile saved.'));
const after=await db.user.findUniqueOrThrow({where:{id:account.id},select:{name:true,bio:true,avatarUrl:true}});assert.equal(after.name,account.name);assert.equal(after.bio??'',account.bio??'');assert.equal(after.avatarUrl??'',account.avatarUrl??'');console.log('PASS profile save (existing values preserved)');
const attempt=await db.quizAttempt.findFirst({where:{userId:account.id,completedAt:{not:null}},orderBy:{completedAt:'desc'},select:{id:true,quiz:{select:{slug:true}}}});
if(attempt){const result=await student.request('/quizzes/'+attempt.quiz.slug+'/result?attempt='+attempt.id);assert.equal(result.response.status,200);assert.ok(result.text.includes('Review Answers')||result.text.includes('Retry Quiz'));console.log('PASS result navigation markup');}
const assets=JSON.parse(fs.readFileSync('docs/asset-performance.json','utf8'));
for(const asset of assets){const response=await fetch(base+asset.output);assert.equal(response.status,200);assert.equal((await response.arrayBuffer()).byteLength,asset.after);}
console.log('PASS all 9 WebP assets served with measured sizes');await student.action('/dashboard','logout',[]);
}
main().catch(()=>{console.error('Interaction HTTP check failed at '+stage);process.exitCode=1}).finally(()=>db.$disconnect());
