import { expect, it } from "vitest";
import { filterAdminLessons } from "../src/lib/admin-lesson-filters";
const rows=[{title:"Zulu",courseId:"c1",moduleId:"m1",status:"Draft"},{title:"Alpha",courseId:"c1",moduleId:"m1",status:"Published"},{title:"Beta",courseId:"c2",moduleId:"m2",status:"Published"}];
const empty={search:"",course:"",module:"",status:"",sort:""};
it("combines search, course, module and status",()=>expect(filterAdminLessons(rows,{...empty,search:" AL ",course:"c1",module:"m1",status:"Published"})).toEqual([rows[1]]));
it("keeps default query order",()=>expect(filterAdminLessons(rows,empty)).toEqual(rows));
it("sorts A-Z and Z-A without mutating original rows",()=>{
 expect(filterAdminLessons(rows,{...empty,sort:"az"}).map(r=>r.title)).toEqual(["Alpha","Beta","Zulu"]);
 expect(filterAdminLessons(rows,{...empty,sort:"za"}).map(r=>r.title)).toEqual(["Zulu","Beta","Alpha"]);expect(rows[0].title).toBe("Zulu");
});
it("returns no matches for a new empty course rather than other courses",()=>expect(filterAdminLessons(rows,{...empty,course:"new"})).toEqual([]));
