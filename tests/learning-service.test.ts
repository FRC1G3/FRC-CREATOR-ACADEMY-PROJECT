import { describe, expect, it, vi } from "vitest";
import { accessible, courseState, evaluateBadgesForUser, type Database } from "../src/services/learning";

function fixture() {
  const course = { id:"c", slug:"youtube", status:"PUBLISHED", modules:[{id:"m",order:1,lessons:[{id:"l1",slug:"first",moduleId:"m",order:1},{id:"l2",slug:"second",moduleId:"m",order:2}]}], quizzes:[{id:"q",slug:"checkpoint",moduleId:"m"}], roadmapNodes:[{id:"n1",type:"LESSON",lessonId:"l1",quizId:null,badgeId:null},{id:"n2",type:"LESSON",lessonId:"l2",quizId:null,badgeId:null},{id:"n3",type:"QUIZ",lessonId:null,quizId:"q",badgeId:null}] };
  const model = {
    course:{findFirst:vi.fn().mockResolvedValue(course)},
    enrollment:{findUnique:vi.fn().mockResolvedValue({id:"enrolled"}),findMany:vi.fn().mockResolvedValue([{course}]),updateMany:vi.fn()},
    lesson:{findFirst:vi.fn().mockResolvedValue({id:"l2",module:{course:{slug:"youtube"}}})},
    lessonProgress:{findMany:vi.fn().mockResolvedValue([])},
    quizAttempt:{findMany:vi.fn().mockResolvedValue([])},
    userBadge:{findMany:vi.fn().mockResolvedValue([]),createMany:vi.fn()},
    badge:{findMany:vi.fn().mockResolvedValue([{id:"badge",conditionType:"FIRST_SECTION_COMPLETE",conditionValue:1,users:[]}])},
  };
  return {course,model,db:model as unknown as Database};
}
describe("course/module progress and access", () => {
  it("queries published content only", async () => { const {db,model}=fixture(); await courseState("u","youtube",db); expect(model.course.findFirst.mock.calls[0][0].where.status).toBe("PUBLISHED"); });
  it("all lessons alone do not complete a module/course with a quiz", async () => { const {db,model}=fixture(); model.lessonProgress.findMany.mockResolvedValue([{lessonId:"l1",status:"COMPLETED"},{lessonId:"l2",status:"COMPLETED"}]); const state=await courseState("u","youtube",db); expect(state).toMatchObject({percentage:100,complete:false,completedModules:0}); });
  it("a historical pass remains valid after failed retries", async () => { const {db,model}=fixture(); model.lessonProgress.findMany.mockResolvedValue([{lessonId:"l1",status:"COMPLETED"},{lessonId:"l2",status:"COMPLETED"}]); model.quizAttempt.findMany.mockResolvedValue([{quizId:"q",passed:false},{quizId:"q",passed:true}]); const state=await courseState("u","youtube",db); expect(state).toMatchObject({complete:true,completedModules:1}); });
  it("blocks a future lesson even for an enrolled user", async () => { const {db}=fixture(); await expect(accessible("u","LESSON","second",db)).rejects.toThrow("earlier roadmap"); });
  it("blocks an unenrolled user", async () => { const {db,model}=fixture(); model.enrollment.findUnique.mockResolvedValue(null); await expect(accessible("u","LESSON","second",db)).rejects.toThrow("Enroll"); });
  it("does not query progress for a public visitor", async () => { const {db,model}=fixture(); await courseState(null,"youtube",db); expect(model.lessonProgress.findMany).not.toHaveBeenCalled(); });
});
describe("badge awards", () => {
  it("does not award an unmet milestone", async () => { const {db,model}=fixture(); await evaluateBadgesForUser("u",db); expect(model.userBadge.createMany).toHaveBeenCalledWith({data:[],skipDuplicates:true}); });
  it("awards once and requests DB duplicate protection on rerun", async () => {
    const {db,model}=fixture();
    model.lessonProgress.findMany.mockResolvedValue([{lessonId:"l1",status:"COMPLETED"},{lessonId:"l2",status:"COMPLETED"}]);
    model.quizAttempt.findMany.mockResolvedValue([{quizId:"q",passed:true}]);
    const stored = new Set<string>();
    model.userBadge.createMany.mockImplementation(async ({data}:{data:{userId:string;badgeId:string}[]}) => { for(const row of data) stored.add(`${row.userId}:${row.badgeId}`); });
    await evaluateBadgesForUser("u",db); await evaluateBadgesForUser("u",db);
    expect(stored.size).toBe(1);
    expect(model.userBadge.createMany).toHaveBeenLastCalledWith({data:[{userId:"u",badgeId:"badge"}],skipDuplicates:true});
    expect(model.enrollment.updateMany.mock.calls[0][0].where.completedAt).toBeNull();
  });
});
