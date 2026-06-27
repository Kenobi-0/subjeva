export type SubjevaSubject = {
  id: string;
  slug: string;
  name: string;
  description: string;
  completedUnits: number;
  totalUnits: number;
  targetName?: string;
  targetDate?: string;
  nextTopic?: string;
  studyDays?: string[];
  notes?: string;
  createdAt: string;
};

export type SubjevaMainTarget = {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  createdAt: string;
};

export type SubjevaWeeklyTask = {
  id: string;
  day: string;
  subjectId?: string;
  subjectName: string;
  topic: string;
  detail: string;
  href?: string;
  createdAt: string;
};

export type SubjevaUserProfile = {
  displayName: string;
  dailyFocusGoal: number;
  studyStyle: string;
  showStudyBadge: boolean;
};

export type SubjevaLesson = {
  id: string;
  subjectId: string;
  subjectSlug: string;
  subjectName: string;
  title: string;
  dates: string[];
  day?: string;
  detail: string;
  completed: boolean;
  studyMinutes: number;
  createdAt: string;
};

const SUBJECTS_KEY = "subjeva-subjects";
const MAIN_TARGET_KEY = "subjeva-main-target";
const WEEKLY_TASKS_KEY = "subjeva-weekly-tasks";
const TOTAL_STUDY_MINUTES_KEY = "subjeva-total-study-minutes";
const USER_PROFILE_KEY = "subjeva-user-profile";
const LESSONS_KEY = "subjeva-lessons";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("subjeva-data-updated"));
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSubjevaSubjects() {
  return readJson<SubjevaSubject[]>(SUBJECTS_KEY, []);
}

export function saveSubjevaSubjects(subjects: SubjevaSubject[]) {
  writeJson(SUBJECTS_KEY, subjects);
}

export function getSubjevaMainTarget() {
  return readJson<SubjevaMainTarget | null>(MAIN_TARGET_KEY, null);
}

export function saveSubjevaMainTarget(target: SubjevaMainTarget) {
  writeJson(MAIN_TARGET_KEY, target);
}

export function removeSubjevaMainTarget() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(MAIN_TARGET_KEY);
  window.dispatchEvent(new Event("subjeva-data-updated"));
}

export function getSubjevaWeeklyTasks() {
  return readJson<SubjevaWeeklyTask[]>(WEEKLY_TASKS_KEY, []);
}

export function saveSubjevaWeeklyTasks(tasks: SubjevaWeeklyTask[]) {
  writeJson(WEEKLY_TASKS_KEY, tasks);
}

export function getSubjevaSubjectMinutes(slug: string) {
  if (typeof window === "undefined") return 0;

  const saved = localStorage.getItem(`subjeva-subject-minutes-${slug}`);
  return saved ? Number(saved) : 0;
}

export function getSubjevaTotalStudyMinutes() {
  if (typeof window === "undefined") return 0;

  const saved = localStorage.getItem(TOTAL_STUDY_MINUTES_KEY);
  return saved ? Number(saved) : 0;
}

export function saveSubjevaTotalStudyMinutes(minutes: number) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOTAL_STUDY_MINUTES_KEY, String(minutes));
  window.dispatchEvent(new Event("subjeva-study-minutes-updated"));
}

export function calculateSubjectProgress(subject: SubjevaSubject) {
  if (!subject.totalUnits || subject.totalUnits < 1) return 0;

  return Math.min(
    Math.round((subject.completedUnits / subject.totalUnits) * 100),
    100
  );
}

export function getSubjevaUserProfile() {
  return readJson<SubjevaUserProfile>(USER_PROFILE_KEY, {
    displayName: "Kenan",
    dailyFocusGoal: 120,
    studyStyle: "Balanced",
    showStudyBadge: true,
  });
}

export function saveSubjevaUserProfile(profile: SubjevaUserProfile) {
  writeJson(USER_PROFILE_KEY, profile);

  localStorage.setItem("subjeva-display-name", profile.displayName);
  window.dispatchEvent(new Event("subjeva-profile-updated"));
}

export function getSubjevaLessons() {
  return readJson<SubjevaLesson[]>(LESSONS_KEY, []);
}

export function saveSubjevaLessons(lessons: SubjevaLesson[]) {
  writeJson(LESSONS_KEY, lessons);
}

export function getSubjevaLessonsBySubject(subjectId: string) {
  const lessons = getSubjevaLessons();

  return lessons.filter((lesson) => lesson.subjectId === subjectId);
}

export function getSubjevaLessonsByDate(date: string) {
  const lessons = getSubjevaLessons();

  return lessons.filter((lesson) => lesson.dates?.includes(date));
}

export function getSubjevaLessonsByDay(day: string) {
  const lessons = getSubjevaLessons();

  return lessons.filter((lesson) => {
    if (lesson.day === day) return true;

    return lesson.dates?.some((date) => {
      const dayName = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
      });

      return dayName === day;
    });
  });
}

export function deleteSubjevaLessonsBySubject(subjectId: string) {
  const lessons = getSubjevaLessons();

  const nextLessons = lessons.filter(
    (lesson) => lesson.subjectId !== subjectId
  );

  saveSubjevaLessons(nextLessons);
}
