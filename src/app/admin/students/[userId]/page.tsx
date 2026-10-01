import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BookCheck, BookOpen, ClipboardCheck } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import AdminBadgeIcon from "@/components/admin/AdminBadgeIcon";
import { adminStudentDetail } from "@/services/admin-queries";

const date=(value:Date|null)=>value?value.toISOString().slice(0,10):"Pending";
export default async function Page({params}:{params:Promise<{userId:string}>}) {
  const {userId}=await params,user=await adminStudentDetail(userId);if(!user)notFound();
  const stats=[{label:"Enrolled Courses",value:user.enrollments.length,icon:BookOpen,tone:"red"},{label:"Completed Lessons",value:user.lessonProgress.length,icon:BookCheck,tone:"blue"},{label:"Quiz Attempts",value:user.quizAttempts.length,icon:ClipboardCheck,tone:"purple"},{label:"Badges Earned",value:user.badges.length,icon:Award,tone:"amber"}];
  return <><AdminPageHeader eyebrow="Student Management" title={user.name} description={`${user.email} · Joined ${date(user.createdAt)}`}><Link className="admin-button" href="/admin/students">← Back to Students</Link></AdminPageHeader>
  <section className="admin-student-detail-stats" aria-label="Student summary">{stats.map(({label,value,icon:Icon,tone})=><article className="app-card admin-stat" key={label}><span className={`admin-icon admin-tone-${tone}`}><Icon size={25}/></span><div><h2>{label}</h2><strong>{value}</strong></div></article>)}</section>
  <div className="admin-student-detail-grid">
   <section className="app-card admin-detail-section"><div className="admin-panel-heading"><div><h2>Course Progress</h2><p>Current requirements for enrolled courses.</p></div></div>{!user.courseProgress.length?<p className="admin-empty">No enrollments yet.</p>:<div className="admin-detail-list">{user.courseProgress.map(item=><article key={item.id}><div><h3>{item.title}</h3><p>{item.completed} of {item.total} learning units</p></div><div className="admin-detail-progress"><span>{item.progress}%</span><progress value={item.progress} max={100}/><AdminStatusBadge status={item.status}/></div></article>)}</div>}</section>
   <section className="app-card admin-detail-section"><div className="admin-panel-heading"><div><h2>Earned Badges</h2><p>Achievements awarded to this student.</p></div></div>{!user.badges.length?<p className="admin-empty">No badges earned yet.</p>:<div className="admin-badge-mini-list">{user.badges.map(item=><article key={item.id}><span className="admin-icon admin-tone-red"><AdminBadgeIcon icon={item.badge.icon}/></span><div><h3>{item.badge.name}</h3><p>Earned {date(item.earnedAt)}</p></div></article>)}</div>}</section>
   <section className="app-card admin-detail-section"><div className="admin-panel-heading"><div><h2>Completed Lessons</h2><p>Most recent completions first.</p></div></div>{!user.lessonProgress.length?<p className="admin-empty">No completed lessons yet.</p>:<div className="admin-detail-list">{user.lessonProgress.map(item=><article key={item.id}><div><h3>{item.lesson.title}</h3><p>{item.lesson.module.course.title}</p></div><time>{date(item.completedAt)}</time></article>)}</div>}</section>
   <section className="app-card admin-detail-section"><div className="admin-panel-heading"><div><h2>Quiz History</h2><p>Every stored attempt, including retries.</p></div></div>{!user.quizAttempts.length?<p className="admin-empty">No quiz attempts yet.</p>:<div className="admin-detail-list">{user.quizAttempts.map(item=><article key={item.id}><div><h3>{item.quiz.title}</h3><p>{item.quiz.course.title} · {item.score==null?"Pending":`${Math.round(item.score)}%`}</p></div><div className="admin-detail-attempt"><AdminStatusBadge status={item.passed==null?"Pending":item.passed?"Passed":"Failed"}/><time>{date(item.completedAt ?? item.startedAt)}</time></div></article>)}</div>}</section>
  </div></>;
}
