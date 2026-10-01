import { beforeEach, expect, it, vi } from "vitest";
const mock=vi.hoisted(()=>({guard:vi.fn(),execute:vi.fn(),refresh:vi.fn()}));
vi.mock("@/lib/current-user",()=>({requireAdmin:mock.guard}));
vi.mock("@/services/admin",()=>({executeAdmin:mock.execute,adminError:()=>"Safe failure"}));
vi.mock("next/cache",()=>({revalidatePath:mock.refresh}));
import { mutateAdmin } from "../src/actions/admin";
beforeEach(()=>{vi.clearAllMocks();mock.guard.mockResolvedValue({role:"ADMIN"});mock.execute.mockResolvedValue({id:"new"});});
it.each(["course","module","lesson","quiz","badge","node"])("blocks student %s mutation even with forged role",async entity=>{mock.guard.mockRejectedValue(new Error("redirect:/dashboard"));await expect(mutateAdmin({entity,operation:"save",data:{role:"ADMIN"}})).rejects.toThrow("redirect");expect(mock.execute).not.toHaveBeenCalled();});
it("permits authorized mutation and refreshes student/admin paths",async()=>{expect(await mutateAdmin({entity:"course",operation:"save",data:{}})).toMatchObject({id:"new",url:"/admin/courses",success:"Course created successfully."});expect(mock.guard).toHaveBeenCalled();expect(mock.refresh).toHaveBeenCalledWith("/admin","layout");expect(mock.refresh).toHaveBeenCalledWith("/learn/[lessonId]","page");});
it("rejects unknown commands",async()=>{expect(await mutateAdmin({entity:"user",operation:"delete"})).toHaveProperty("error");expect(mock.execute).not.toHaveBeenCalled();});
it.each([undefined,"existing"])("returns lesson list navigation with honest save feedback (%s)",async id=>{
 expect(await mutateAdmin({entity:"lesson",operation:"save",id,data:{}})).toMatchObject({url:"/admin/lessons",success:`Lesson ${id?"updated":"created"} successfully.`});
});
it.each([undefined,"existing"])("returns quiz list navigation with honest save feedback (%s)",async id=>{
 expect(await mutateAdmin({entity:"quiz",operation:"save",id,data:{}})).toMatchObject({url:"/admin/quizzes",success:`Quiz ${id?"updated":"created"} successfully.`});
});
it.each([["badge",undefined,"Badge created successfully."],["badge","b","Badge updated successfully."],["node",undefined,"Roadmap node added successfully."],["node","n","Roadmap node updated successfully."]] as const)("returns specific feedback for %s save",async(entity,id,success)=>{
 expect(await mutateAdmin({entity,operation:"save",id,data:{}})).toMatchObject({success});
});
it("does not return a success or redirect when persistence fails",async()=>{
 mock.execute.mockRejectedValue(new Error("DB rejected"));expect(await mutateAdmin({entity:"lesson",operation:"save",data:{}})).toEqual({error:"Safe failure"});expect(mock.refresh).not.toHaveBeenCalled();
});
