import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({signUp:vi.fn(),signIn:vi.fn(),signOut:vi.fn(),findUser:vi.fn()}));
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
vi.mock("next/navigation",()=>({redirect:(path:string)=>{throw Error(`redirect:${path}`);}}));
vi.mock("@/lib/auth",()=>({getAuth:()=>({api:{signUpEmail:mocks.signUp,signInEmail:mocks.signIn,signOut:mocks.signOut}})}));
vi.mock("@/lib/prisma",()=>({getPrisma:()=>({user:{findUnique:mocks.findUser}})}));
import { authenticate, logout } from "../src/actions/auth";
function form(mode="login") {const data=new FormData(); Object.entries({mode,email:" TEST@example.com ",password:"secure-example", "confirm-password":"secure-example", "full-name":"Creator",role:"ADMIN"}).forEach(([k,v])=>data.set(k,v));return data;}
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv("DATABASE_URL","test");vi.stubEnv("BETTER_AUTH_SECRET","test");mocks.signUp.mockResolvedValue({});mocks.signIn.mockResolvedValue({user:{id:"u"}});mocks.findUser.mockResolvedValue({role:"STUDENT"});});
it("explains missing database setup without trying authentication",async()=>{vi.stubEnv("DATABASE_URL","");expect(await authenticate({},form())).toEqual({error:"Sign-in and registration are unavailable until academy setup is complete."});expect(mocks.signIn).not.toHaveBeenCalled();});
it("redirects successful registration to login without forwarding a client role",async()=>{await expect(authenticate({},form("register"))).rejects.toThrow("redirect:/login");expect(mocks.signUp.mock.calls[0][0].body).toEqual({name:"Creator",email:"test@example.com",password:"secure-example"});expect(mocks.signIn).not.toHaveBeenCalled();});
it.each(["12345678", "abcdefgh"])("accepts a simple eight-character password: %s",async(password)=>{const data=form("register");data.set("password",password);data.set("confirm-password",password);await expect(authenticate({},data)).rejects.toThrow("redirect:/login");});
it("reports individual registration errors without returning credentials",async()=>{const data=form("register");data.set("email","invalid");data.set("full-name","A");data.set("password","1234567");data.set("confirm-password","different");const result=await authenticate({},data);expect(Object.keys(result.fieldErrors!)).toEqual(expect.arrayContaining(["email","name","password","confirmPassword"]));expect(JSON.stringify(result)).not.toContain("1234567");expect(mocks.signUp).not.toHaveBeenCalled();});
it("returns safe duplicate/error feedback",async()=>{mocks.signUp.mockRejectedValue(new Error("P2002 sensitive"));expect(JSON.stringify(await authenticate({},form("register")))).not.toMatch(/P2002|sensitive/);});
it("sends student to dashboard",async()=>{await expect(authenticate({},form())).rejects.toThrow("redirect:/dashboard");});
it("sends admin to admin",async()=>{mocks.findUser.mockResolvedValue({role:"ADMIN"});await expect(authenticate({},form())).rejects.toThrow("redirect:/admin");});
it("rejects external redirect after login",async()=>{const data=form();data.set("callbackUrl","https://evil.test");await expect(authenticate({},data)).rejects.toThrow("redirect:/dashboard");});
it("rejects admin callback for student",async()=>{const data=form();data.set("callbackUrl","/admin/courses");await expect(authenticate({},data)).rejects.toThrow("redirect:/dashboard");});
it("logs out through provider",async()=>{await expect(logout()).rejects.toThrow("redirect:/");expect(mocks.signOut).toHaveBeenCalledTimes(1);});
