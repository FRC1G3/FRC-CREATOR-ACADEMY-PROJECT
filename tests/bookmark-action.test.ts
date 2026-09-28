import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({user:vi.fn(),save:vi.fn(),refresh:vi.fn()}));
vi.mock("@/lib/current-user",()=>({requireUser:mocks.user}));
vi.mock("@/services/bookmarks",()=>({setBookmark:mocks.save}));
vi.mock("next/cache",()=>({revalidatePath:mocks.refresh}));
import { saveBookmark } from "../src/actions/bookmarks";
beforeEach(()=>{vi.clearAllMocks();mocks.user.mockResolvedValue({id:"session-user"});mocks.save.mockResolvedValue({saved:true});});
it("derives bookmark ownership from the session and refreshes saved views",async()=>{
 const input={kind:"course",id:"course",saved:true}; expect(await saveBookmark(input)).toEqual({saved:true});
 expect(mocks.save).toHaveBeenCalledWith("session-user",input);expect(mocks.refresh).toHaveBeenCalledWith("/bookmarks");
});
it("rejects attempts to choose another owner",async()=>{
 expect(await saveBookmark({kind:"course",id:"course",saved:true,userId:"victim"})).toHaveProperty("error");expect(mocks.save).not.toHaveBeenCalled();
});
it("returns safe failure feedback without claiming a bookmark was saved",async()=>{
 mocks.save.mockRejectedValue(new Error("private connection"));expect(await saveBookmark({kind:"lesson",id:"lesson",saved:true})).toEqual({error:"Unable to save bookmark. Please try again."});expect(mocks.refresh).not.toHaveBeenCalled();
});
