import { TimelineMotion } from "@/components/sections/timeline-motion";
import { timeline, timelineNote } from "@/data/content";

/** Section 09 - Project timeline. */
export function Timeline() {
  return <TimelineMotion phases={timeline} note={timelineNote} />;
}
