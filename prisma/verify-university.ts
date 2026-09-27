import "dotenv/config";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { getPrisma } from "../src/lib/prisma";
import { TEMP_LESSON_VIDEO_URL } from "./video-default";
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


function redirectsTo(page: { response: Response; text: string }, path: string) {
  const location = page.response.headers.get("location");
  const streamed = page.text.match(/<meta[^>]*http-equiv="refresh"[^>]*content="[^;]*;url=([^"]+)"/)?.[1];
  return (location ?? streamed ?? "").startsWith(path);
}
async function main() {
  assert.notEqual(process.env.NODE_ENV,"production");
  const publicClient=new Client(),admin=new Client(),student=new Client();
  for(const path of ['/','/login','/register','/courses','/courses/youtube']) {
    stage = path;
    const page=await publicClient.request(path);assert.equal(page.response.status,200);assert.ok(!page.text.includes('NEXT_HTTP_ERROR_FALLBACK'));console.log('PASS public',path);
  }
  for(const path of ['/dashboard','/roadmap','/profile','/admin','/admin/courses']) {
    const page=await publicClient.request(path);assert.ok(redirectsTo(page,'/login'));console.log('PASS guest protection',path);
  }
  await admin.login('admin@frc.academy','/admin');await student.login('student@frc.academy','/dashboard');
  const identity=await db.user.findUniqueOrThrow({where:{email:'admin@frc.academy'},select:{name:true}});
  for(const path of ['/admin','/admin/courses','/admin/lessons','/admin/quizzes','/admin/roadmap','/admin/badges','/admin/students']) {
    stage = path;
    const page=await admin.request(path);assert.equal(page.response.status,200);assert.ok(!page.text.includes('NEXT_HTTP_ERROR_FALLBACK'));const sidebar=page.text.match(/<div class="admin-profile">([\s\S]*?)<\/aside>/)?.[1];assert.ok(sidebar?.includes(identity.name));console.log('PASS admin identity/route',path);
    const blocked=await student.request(path);assert.ok(redirectsTo(blocked,'/dashboard')); assert.ok(!blocked.text.includes('class="admin-sidebar')); 
  }
  for(const entity of ['course','lesson','quiz','badge']){const r=await student.action('/dashboard','mutateAdmin',[{entity,operation:'save',data:{role:'ADMIN'}}]);assert.ok(r.response.headers.get('x-action-redirect')?.startsWith('/dashboard'));}
  for(const path of ['/dashboard','/roadmap','/learn/how-youtube-works','/quizzes/youtube-basics','/achievements','/profile']) {
    stage = path;
    const page=await student.request(path);assert.equal(page.response.status,200);assert.ok(!page.text.includes('NEXT_HTTP_ERROR_FALLBACK'));
    if(path.startsWith('/learn/'))assert.ok(page.text.includes('https://www.youtube.com/embed/PHVuZ5I_Jb4'));
    if(path.startsWith('/quizzes/'))assert.ok(!page.text.includes('isCorrect'));
    console.log('PASS student',path);
  }
  const catalog=await publicClient.request('/courses');assert.ok(!/readonly/i.test(catalog.text.match(/<input[^>]*type="search"[^>]*>/)?.[0] ?? 'readonly'));
  const detail=await publicClient.request('/courses/youtube');assert.ok(!detail.text.includes('Build a structured YouTube content strategy'));
  const videos=await db.lesson.findMany({select:{videoUrl:true}});assert.ok(videos.every(l=>l.videoUrl===TEMP_LESSON_VIDEO_URL));
  await admin.action('/admin','logout',[]);await student.action('/dashboard','logout',[]);
  console.log('PASS catalog enabled, module outcomes, unchanged temporary videos, role/mutation protection. Browser interactions not tested.');
}
main().catch(()=>{console.error('Runtime verification failed at '+stage+'; sensitive response bodies omitted.');process.exitCode=1}).finally(()=>db.$disconnect());
