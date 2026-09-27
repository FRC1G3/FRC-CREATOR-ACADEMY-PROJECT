import { expect, it } from "vitest";
import { videoSource } from "../src/lib/video";
it.each(["https://youtu.be/PHVuZ5I_Jb4?si=rd4zQjly3qfHKpOx", "https://www.youtube.com/watch?v=PHVuZ5I_Jb4", "https://youtube.com/watch?v=PHVuZ5I_Jb4", "https://www.youtube.com/embed/PHVuZ5I_Jb4"])("extracts supplied YouTube video: %s", url => { expect(videoSource(url)).toEqual({type:"youtube",src:"https://www.youtube.com/embed/PHVuZ5I_Jb4"}); });
it.each(["https://cdn.example.org/lesson.mp4?token=test", "/videos/lesson.webm"])("keeps direct video: %s", url => {expect(videoSource(url)).toEqual({type:"media",src:url});});
it.each(["", "not a url", "javascript:alert(1)", "https://youtube.com.evil.test/watch?v=PHVuZ5I_Jb4", "https://youtu.be/invalid", "https://evil.test/embed/PHVuZ5I_Jb4", "https://youtube.com/watch?v=PHVuZ5I_Jb4<script>"])("rejects unsafe/unsupported video: %s",url=>expect(videoSource(url)).toBeNull());
