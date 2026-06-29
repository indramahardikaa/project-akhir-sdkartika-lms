export type Role = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  classId?: string; // For siswa - which class they belong to
  isAlumni?: boolean; // For siswa who graduated (kelas 6 naik kelas)
  nis?: string; // Nomor Induk Siswa
  nisn?: string; // Nomor Induk Siswa Nasional
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g., "Kelas 1A", "Kelas 1B"
  grade: number; // 1-6
  section: string; // A, B, C
  guruId?: string; // Wali kelas
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  guruId: string;
  guruName: string;
  category: string;
  createdAt: string;
}

export interface Material {
  id: string;
  courseId: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'document' | 'rpp';
  url?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  order: number; // For sequential reading
  createdAt: string;
}

export interface Enrollment {
  id: string;
  siswaId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
}

export interface ReadingProgress {
  id: string;
  siswaId: string;
  materialId: string;
  courseId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  guruId: string;
  title: string;
  description: string;
  imageUrl?: string; // Photo of task/instructions uploaded by guru
  dueDate: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  siswaId: string;
  imageUrl: string; // Photo uploaded by siswa
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface ClassNote {
  id: string;
  classId: string;
  guruId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  classId: string;
  guruId: string;
  siswaId: string;
  date: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  note?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  targetRole?: Role | 'all'; // who can see it
  createdAt: string;
}



export type ExamType = 'UH' | 'PTS' | 'PAS'; // Ulangan Harian, Penilaian Tengah Semester, Penilaian Akhir Semester
export type QuestionType = 'pilihan_ganda' | 'essay';
export type ExamStatus = 'draft' | 'scheduled' | 'active' | 'finished';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: string[]; // 4 options (A, B, C, D) - only for pilihan_ganda
  correctAnswer: number; // index 0-3 - only for pilihan_ganda
  essayKey?: string; // answer key for essay (reference for teacher grading)
  weight: number; // bobot penilaian (point value for this question)
}

export interface Exam {
  id: string;
  courseId: string;
  guruId: string;
  title: string;
  description: string;
  examType: ExamType; // UH, PTS, PAS
  pertemuan: number; // pertemuan ke-berapa (relevant for UH)
  questions: ExamQuestion[];
  duration: number; // in minutes
  scheduledDate: string; // tanggal ujian dijadwalkan
  scheduledTime: string; // waktu mulai ujian (e.g., "08:00")
  classIds: string[]; // kelas yang ditargetkan
  token: string; // token untuk masuk ujian (auto-generated)
  shuffleQuestions: boolean; // acak urutan soal
  shuffleOptions: boolean; // acak pilihan jawaban (khusus PG)
  status: ExamStatus;
  createdAt: string;
}

export interface ExamAnswer {
  questionId: string;
  type: QuestionType;
  selectedOption?: number; // for pilihan_ganda (index 0-3)
  essayAnswer?: string; // for essay
}

export interface ExamResult {
  id: string;
  examId: string;
  siswaId: string;
  answers: ExamAnswer[]; // student's answers
  score: number; // calculated score (0-100), auto for PG, manual for essay
  totalWeight: number; // total weight of all questions
  earnedWeight: number; // weight earned by student
  isAutoGraded: boolean; // true if all PG and auto-calculated
  essayGraded: boolean; // true if all essay questions have been graded
  essayScores?: { questionId: string; score: number }[]; // individual essay scores given by guru
  startedAt: string; // when student started the exam
  submittedAt: string; // when student submitted or time expired
  status: 'in_progress' | 'submitted' | 'graded'; // status of submission
}

export interface Schedule {
  id: string;
  type: 'mengajar' | 'exam';
  title: string;
  courseId?: string;
  guruId?: string;
  guruName?: string;
  classId?: string;
  className?: string;
  day?: string; // senin, selasa, etc.
  time?: string; // e.g., "08:00 - 09:30"
  date?: string; // for exam schedule
  createdAt: string;
}
