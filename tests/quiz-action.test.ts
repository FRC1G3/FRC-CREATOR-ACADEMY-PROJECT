import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user:vi.fn(), access:vi.fn(), overview:vi.fn(), derive:vi.fn(), evaluate:vi.fn(), lock:vi.fn(), transaction:vi.fn(), prior:vi.fn(), quiz:vi.fn(), create:vi.fn(), answers:vi.fn() }));
vi.mock("@/lib/current-user",()=>({requireUser:mocks.user}));
vi.mock("@/lib/prisma",()=>({getPrisma:()=>({$transaction:mocks.transaction})}));
vi.mock("next/cache",()=>({revalidatePath:vi.fn()}));
vi.mock("next/navigation",()=>({redirect:vi.fn()}));
vi.mock("@/services/learning",()=>({accessible:mocks.access,studentOverview:mocks.overview,overviewWithQuizAttempt:mocks.derive,evaluateBadgesForUser:mocks.evaluate,lockLearningUser:mocks.lock,LearningError:class extends Error{}}));
import { submitQuiz } from "../src/actions/learning";
beforeEach(()=> {
  vi.clearAllMocks(); mocks.user.mockResolvedValue({id:"session-user"}); mocks.access.mockResolvedValue({id:"q"}); mocks.prior.mockResolvedValue(null); mocks.evaluate.mockResolvedValue(undefined);
  mocks.overview.mockResolvedValue({states:[{enrollment:{},course:{quizzes:[{id:"q",slug:"checkpoint",title:"Quiz"}]},nodes:[{quizId:"q",status:"current"}]}]}); mocks.derive.mockReturnValue({updated:true}); mocks.create.mockImplementation(async ({data}: {data: Record<string, unknown>}) => data); mocks.quiz.mockResolvedValue({id:"q",status:"PUBLISHED",passScore:80,questions:[{id:"question",options:[{id:"correct",isCorrect:true},{id:"wrong",isCorrect:false}]}]});
  mocks.transaction.mockImplementation(async (fn:(db:unknown)=>Promise<unknown>)=>fn({$queryRaw:vi.fn(),quizAttempt:{findUnique:mocks.prior,create:mocks.create},quiz:{findUniqueOrThrow:mocks.quiz},quizAnswer:{createMany:mocks.answers}}));
});
const input=()=>({quizId:"checkpoint",requestId:crypto.randomUUID(),answers:[{questionId:"question",optionId:"correct"}]});
it("rejects locked checkpoints before fetching answers or writing", async () => { mocks.overview.mockResolvedValue({states:[{enrollment:{},course:{quizzes:[{id:"q",slug:"checkpoint"}]},nodes:[{quizId:"q",status:"locked"}]}]}); expect(await submitQuiz(input())).toHaveProperty("error"); expect(mocks.quiz).not.toHaveBeenCalled(); expect(mocks.create).not.toHaveBeenCalled(); });
it("uses one snapshot and passes derived state to badge reconciliation", async () => { await submitQuiz(input()); expect(mocks.overview).toHaveBeenCalledTimes(1); expect(mocks.evaluate).toHaveBeenCalledWith("session-user", expect.anything(), {updated:true}); });
it("derives score and identity from server, writes answers atomically",async()=>{const result=await submitQuiz(input());expect(result.url).toContain("/result?attempt=");expect(mocks.create.mock.calls[0][0].data).toMatchObject({userId:"session-user",score:100,passed:true});expect(mocks.answers).toHaveBeenCalledWith({data:[{attemptId:mocks.create.mock.calls[0][0].data.id,questionId:"question",selectedOptionId:"correct",isCorrect:true}]});expect(mocks.transaction).toHaveBeenCalledTimes(1);});
it("rejects forged score without writes",async()=>{expect(await submitQuiz({...input(),score:100})).toHaveProperty("error");expect(mocks.transaction).not.toHaveBeenCalled();});
it.each(["passed","isCorrect","userId"])("rejects client-controlled %s without writes",async(field)=>{expect(await submitQuiz({...input(),[field]:"forged"})).toHaveProperty("error");expect(mocks.transaction).not.toHaveBeenCalled();});
it("rejects wrong question/option associations",async()=>{const submission=input();submission.answers[0].optionId="foreign";expect(await submitQuiz(submission)).toHaveProperty("error");expect(mocks.create).not.toHaveBeenCalled();});
it("rejects another user's idempotency key",async()=>{mocks.prior.mockResolvedValue({id:"existing",userId:"someone-else",quizId:"q"});expect(await submitQuiz(input())).toHaveProperty("error");expect(mocks.create).not.toHaveBeenCalled();});
it("same submission does not create duplicate attempts",async()=>{mocks.prior.mockResolvedValue({id:"existing",userId:"session-user",quizId:"q"});expect(await submitQuiz(input())).toHaveProperty("url");expect(mocks.create).not.toHaveBeenCalled();});
it("new submissions preserve separate retry attempts",async()=>{await submitQuiz(input());await submitQuiz(input());expect(mocks.create).toHaveBeenCalledTimes(2);expect(mocks.create.mock.calls[0][0].data.id).not.toBe(mocks.create.mock.calls[1][0].data.id);});
it("does not leak database exceptions",async()=>{mocks.transaction.mockRejectedValue(new Error("SQL password=private"));const result=await submitQuiz(input());expect(JSON.stringify(result)).not.toMatch(/SQL|private/);});

it("rejects quiz unpublished while waiting for the admin edit lock",async()=>{mocks.quiz.mockResolvedValue({id:"q",status:"DRAFT",passScore:80,questions:[]});expect(await submitQuiz(input())).toEqual({error:"Quiz unavailable."});expect(mocks.create).not.toHaveBeenCalled();});

it("does not reconcile or report success if answer persistence fails inside the transaction",async()=>{mocks.answers.mockRejectedValueOnce(new Error("private SQL"));expect(await submitQuiz(input())).toHaveProperty("error");expect(mocks.derive).not.toHaveBeenCalled();expect(mocks.evaluate).not.toHaveBeenCalled();});
