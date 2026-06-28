import { supabase } from "./supabaseClient";
import {
  createSlug,
  type SubjevaLesson,
  type SubjevaMainTarget,
  type SubjevaSubject,
  type SubjevaUserProfile,
} from "./subjevaStorage";

type SubjectRow = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description: string;
  completed_units: number;
  total_units: number;
  target_name: string | null;
  target_date: string | null;
  next_topic: string | null;
  study_days: string[];
  notes: string;
  study_minutes: number;
  created_at: string;
};

type LessonRow = {
  id: string;
  user_id: string;
  subject_id: string;
  subject_slug: string;
  subject_name: string;
  title: string;
  dates: string[];
  day: string | null;
  detail: string;
  completed: boolean;
  study_minutes: number;
  created_at: string;
};

type MainTargetRow = {
  id: string;
  user_id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string;
  daily_focus_goal: number;
  study_style: string;
  show_study_badge: boolean;
  created_at: string;
};

function mapSubjectFromDb(row: SubjectRow): SubjevaSubject {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || "",
    completedUnits: row.completed_units || 0,
    totalUnits: row.total_units || 0,
    targetName: row.target_name || undefined,
    targetDate: row.target_date || undefined,
    nextTopic: row.next_topic || undefined,
    studyDays: row.study_days || [],
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}

function mapLessonFromDb(row: LessonRow): SubjevaLesson {
  return {
    id: row.id,
    subjectId: row.subject_id,
    subjectSlug: row.subject_slug,
    subjectName: row.subject_name,
    title: row.title,
    dates: row.dates || [],
    day: row.day || undefined,
    detail: row.detail || "",
    completed: row.completed,
    studyMinutes: row.study_minutes || 0,
    createdAt: row.created_at,
  };
}

function mapMainTargetFromDb(row: MainTargetRow): SubjevaMainTarget {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    time: row.time,
    description: row.description || "",
    createdAt: row.created_at,
  };
}

export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Kullanıcı oturumu bulunamadı.");
  }

  return data.user.id;
}

export async function getDbUserProfile(): Promise<SubjevaUserProfile> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("subjeva_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return {
      displayName: "Öğrenci",
      dailyFocusGoal: 120,
      studyStyle: "Balanced",
      showStudyBadge: true,
    };
  }

  const profile = data as ProfileRow;

  return {
    displayName: profile.display_name,
    dailyFocusGoal: profile.daily_focus_goal,
    studyStyle: profile.study_style,
    showStudyBadge: profile.show_study_badge,
  };
}

export async function saveDbUserProfile(profile: SubjevaUserProfile) {
  const userId = await getCurrentUserId();

  const { error } = await supabase.from("subjeva_profiles").upsert({
    id: userId,
    display_name: profile.displayName,
    daily_focus_goal: profile.dailyFocusGoal,
    study_style: profile.studyStyle,
    show_study_badge: profile.showStudyBadge,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getDbSubjects() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("subjeva_subjects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as SubjectRow[]).map(mapSubjectFromDb);
}

export async function getDbSubjectBySlug(slug: string) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("subjeva_subjects")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return mapSubjectFromDb(data as SubjectRow);
}

export async function createUniqueDbSubjectSlug(name: string) {
  const subjects = await getDbSubjects();

  const baseSlug = createSlug(name) || "subject";
  let nextSlug = baseSlug;
  let counter = 2;

  while (subjects.some((subject) => subject.slug === nextSlug)) {
    nextSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return nextSlug;
}

export async function createDbSubject(name: string) {
  const userId = await getCurrentUserId();
  const slug = await createUniqueDbSubjectSlug(name);

  const { data, error } = await supabase
    .from("subjeva_subjects")
    .insert({
      user_id: userId,
      slug,
      name,
      description: "",
      completed_units: 0,
      total_units: 0,
      notes: "",
      study_minutes: 0,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapSubjectFromDb(data as SubjectRow);
}

export async function deleteDbSubject(subjectId: string) {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("subjeva_subjects")
    .delete()
    .eq("id", subjectId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateDbSubjectProgress(
  subject: SubjevaSubject,
  lessons: SubjevaLesson[]
) {
  const userId = await getCurrentUserId();

  const completedLessonCount = lessons.filter((lesson) => lesson.completed).length;
  const nextTopic =
    lessons.find((lesson) => !lesson.completed)?.title ||
    subject.nextTopic ||
    null;

  const { error } = await supabase
    .from("subjeva_subjects")
    .update({
      completed_units: completedLessonCount,
      total_units: lessons.length,
      next_topic: nextTopic,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subject.id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getDbLessons() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("subjeva_lessons")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as LessonRow[]).map(mapLessonFromDb);
}

export async function getDbLessonsBySubject(subjectId: string) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("subjeva_lessons")
    .select("*")
    .eq("user_id", userId)
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as LessonRow[]).map(mapLessonFromDb);
}

export async function createDbLesson(
  subject: SubjevaSubject,
  title: string,
  dates: string[],
  detail: string
) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("subjeva_lessons")
    .insert({
      user_id: userId,
      subject_id: subject.id,
      subject_slug: subject.slug,
      subject_name: subject.name,
      title,
      dates,
      detail,
      completed: false,
      study_minutes: 0,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapLessonFromDb(data as LessonRow);
}

export async function completeDbLesson(
  lesson: SubjevaLesson,
  extraMinutes: number
) {
  const userId = await getCurrentUserId();

  const nextLessonMinutes = lesson.studyMinutes + extraMinutes;

  const { error } = await supabase
    .from("subjeva_lessons")
    .update({
      completed: true,
      study_minutes: nextLessonMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lesson.id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteDbLesson(lessonId: string) {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("subjeva_lessons")
    .delete()
    .eq("id", lessonId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getDbSubjectMinutes(subjectId: string) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("subjeva_subjects")
    .select("study_minutes")
    .eq("id", subjectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data?.study_minutes || 0);
}

export async function updateDbSubjectMinutes(
  subjectId: string,
  minutes: number
) {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("subjeva_subjects")
    .update({
      study_minutes: Math.max(minutes, 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", subjectId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getDbTotalStudyMinutes() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("subjeva_study_totals")
    .select("total_minutes")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data?.total_minutes || 0);
}

export async function updateDbTotalStudyMinutes(minutes: number) {
  const userId = await getCurrentUserId();

  const { error } = await supabase.from("subjeva_study_totals").upsert({
    user_id: userId,
    total_minutes: Math.max(minutes, 0),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getDbMainTarget() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("subjeva_main_targets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return mapMainTargetFromDb(data as MainTargetRow);
}

export async function saveDbMainTarget(target: Omit<SubjevaMainTarget, "id" | "createdAt">) {
  const userId = await getCurrentUserId();

  const { error } = await supabase.from("subjeva_main_targets").upsert({
    user_id: userId,
    name: target.name,
    date: target.date,
    time: target.time,
    description: target.description,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeDbMainTarget() {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("subjeva_main_targets")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
