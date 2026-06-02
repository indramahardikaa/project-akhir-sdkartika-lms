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



export interface ExamQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options (A, B, C, D)
  correctAnswer: number; // index 0-3
}

export interface Exam {
  id: string;
  courseId: string;
  guruId: string;
  title: string;
  description: string;
  pertemuan: number; // pertemuan ke-berapa
  questions: ExamQuestion[];
  duration: number; // in minutes
  createdAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  siswaId: string;
  answers: number[]; // student's answers (index 0-3 for each question)
  score: number; // calculated score (0-100)
  submittedAt: string;
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
