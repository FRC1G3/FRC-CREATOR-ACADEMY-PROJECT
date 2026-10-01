import { expect,it } from "vitest";
import { progressStatus } from "../src/lib/admin-students";
import { adminStudentDetailSelect } from "../src/services/admin-queries";
it.each([[0,5,null,"Not Started"],[2,5,null,"In Progress"],[5,5,new Date(),"Completed"],[5,5,null,"Completed"]] as const)("derives student progress from real completion state",(done,total,completedAt,status)=>expect(progressStatus(done,total,completedAt)).toBe(status));
it("student detail selects useful learning data without auth secrets",()=>{const fields=JSON.stringify(adminStudentDetailSelect);expect(fields).toContain("quizAttempts");expect(fields).toContain("lessonProgress");expect(fields).toContain("badges");expect(fields).not.toMatch(/password|session|account|secret/i);});
