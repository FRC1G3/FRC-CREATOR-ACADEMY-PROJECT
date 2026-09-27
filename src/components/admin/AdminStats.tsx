import { BookOpen, SquarePlay, Users, ChartColumn } from "lucide-react";
export default function AdminStats({courses,lessons,students,passRate}:{courses:number;lessons:number;students:number;passRate:number}) {
 const stats=[{label:'Total Courses',value:courses,icon:BookOpen,tone:'red'},{label:'Total Lessons',value:lessons,icon:SquarePlay,tone:'blue'},{label:'Total Students',value:students,icon:Users,tone:'purple'},{label:'Quiz Pass Rate',value:passRate+'%',icon:ChartColumn,tone:'amber'}];
 return <section className="admin-stats" aria-label="Academy summary">{stats.map(({label,value,icon:Icon,tone})=><article className="app-card admin-stat" key={label}><span className={'admin-icon admin-tone-'+tone}><Icon size={28}/></span><div><h2>{label}</h2><strong>{value}</strong><p>Current academy data</p></div></article>)}</section>;
}
