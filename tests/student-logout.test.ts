import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({signOut:vi.fn(),refresh:vi.fn()}));
vi.mock("next/headers",()=>({headers:async()=>new Headers()}));
vi.mock("next/cache",()=>({revalidatePath:mocks.refresh}));
vi.mock("@/lib/auth",()=>({getAuth:()=>({api:{signOut:mocks.signOut}})}));
import { studentLogout } from "../src/actions/auth";
beforeEach(()=>{vi.clearAllMocks();mocks.signOut.mockResolvedValue({success:true});});
it("revokes the provider session and revalidates identity before success feedback",async()=>{
 expect(await studentLogout()).toEqual({success:"You've been logged out successfully."});expect(mocks.signOut).toHaveBeenCalledTimes(1);expect(mocks.refresh).toHaveBeenCalledWith("/","layout");
});
it("does not falsely signal logout success on provider failure",async()=>{
 mocks.signOut.mockRejectedValue(new Error("private"));expect(await studentLogout()).toEqual({error:"Unable to log out. Please try again."});expect(mocks.refresh).not.toHaveBeenCalled();
});
