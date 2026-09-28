import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({user:vi.fn(),update:vi.fn(),normalize:vi.fn(),refresh:vi.fn()}));
vi.mock("@/lib/current-user",()=>({requireUser:mocks.user}));
vi.mock("@/lib/prisma",()=>({getPrisma:()=>({user:{update:mocks.update}})}));
vi.mock("@/lib/avatar-server",()=>({normalizeAvatar:mocks.normalize}));
vi.mock("next/cache",()=>({revalidatePath:mocks.refresh}));
import { saveProfile } from "../src/actions/learning";
function form(avatar="/images/profiles/frc.PNG") {const data=new FormData();data.set("name","Creator");data.set("bio","Learning");data.set("avatarUrl",avatar);return data;}
beforeEach(()=>{vi.clearAllMocks();mocks.user.mockResolvedValue({id:"owner"});mocks.update.mockResolvedValue({});});
it("saves only the session user's profile and returns a success signal for auto-close",async()=>{
 const data=form();data.set("userId","victim");
 expect(await saveProfile({},data)).toEqual({success:"Profile updated successfully."});
 expect(mocks.update).toHaveBeenCalledWith({where:{id:"owner"},data:{name:"Creator",bio:"Learning",avatarUrl:"/images/profiles/frc.PNG"}});
 expect(mocks.refresh).toHaveBeenCalledWith("/","layout");
});
it("does not overwrite the profile when photo processing fails",async()=>{
 mocks.normalize.mockRejectedValue(new Error("bad image"));
 expect(await saveProfile({},form("data:image/jpeg;base64,/9j/AAAA"))).toHaveProperty("error");
 expect(mocks.update).not.toHaveBeenCalled();expect(mocks.refresh).not.toHaveBeenCalled();
});
it("rejects invalid profile values without writes",async()=>{
 const data=form();data.set("name","A");expect(await saveProfile({},data)).toHaveProperty("error");expect(mocks.update).not.toHaveBeenCalled();
});
it("returns a safe error on persistence failure and leaves submitted fields intact",async()=>{
 mocks.update.mockRejectedValue(new Error("private DB details"));const data=form();
 expect(await saveProfile({},data)).toEqual({error:"Unable to save profile."});expect(data.get("name")).toBe("Creator");
});
