import "dotenv/config";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { getPrisma } from "../src/lib/prisma";
import { writeFileSync } from "node:fs";
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
const user=new Client();await user.login('student@frc.academy','/dashboard');
const timings=[];
for(const path of ['/courses','/dashboard','/courses/youtube','/profile','/achievements']){
 const samples=[];
 for(let i=0;i<3;i++){const started=performance.now();const page=await user.request(path);assert.equal(page.response.status,200);samples.push(Math.round(performance.now()-started));}
 timings.push({path,fullResponseMs:samples});console.log(path,samples.join(','));
}
await user.action('/dashboard','logout',[]);
const label=process.argv.includes('--after')?'after':'before';writeFileSync('docs/performance-'+label+'.json',JSON.stringify({note:'Local production server + remote Neon, full HTML response, 3 sequential samples; no browser/assets. Not a controlled benchmark.',timings},null,2)+'\n');}
main().catch(()=>{console.error('Timing check failed at '+stage);process.exitCode=1}).finally(()=>db.$disconnect());
