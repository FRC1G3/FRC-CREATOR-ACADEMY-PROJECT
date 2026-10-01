import { expect,it } from "vitest";
import { availableRoadmapTargets,roadmapEmptyMessage } from "../src/lib/admin-roadmap";
const course={lessons:[{id:"l1",title:"One"},{id:"l2",title:"Two"}],quizzes:[{id:"q1",title:"Quiz"}],roadmapNodes:[{lessonId:"l1",quizId:null,badgeId:null},{lessonId:null,quizId:"q1",badgeId:null}]};
it("excludes targets already represented in the selected roadmap",()=>{
 expect(availableRoadmapTargets("LESSON",course,[]).map(item=>item.id)).toEqual(["l2"]);
 expect(availableRoadmapTargets("QUIZ",course,[])).toEqual([]);
});
it("excludes used rewards and explains empty versus exhausted target sets",()=>{
 const rewards=[{id:"b1",title:"One"},{id:"b2",title:"Two"}],withReward={...course,roadmapNodes:[...course.roadmapNodes,{lessonId:null,quizId:null,badgeId:"b1"}]};
 expect(availableRoadmapTargets("REWARD",withReward,rewards).map(item=>item.id)).toEqual(["b2"]);
 expect(roadmapEmptyMessage("QUIZ",true)).toContain("already in this roadmap");
 expect(roadmapEmptyMessage("LESSON",false)).toContain("available yet");
});
