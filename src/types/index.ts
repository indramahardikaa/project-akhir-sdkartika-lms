export type Role = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
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
  type: 'text' | 'video' | 'document';
  url?: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  siswaId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  targetRole: 'all' | 'guru' | 'siswa';
  createdAt: string;
}

export interface Attendance {
  id: string;
  courseId: string;
  siswaId: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  note?: string;
}

export interface ForumTask {
  id: string;
  courseId: string;
  guruId: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  siswaId: string;
  siswaName: string;
  content: string;
  submittedAt: string;
  grade?: number;
}

export interface BankSoal {
  id: string;
  courseId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  createdAt: string;
}

export interface Exam {
  id: string;
  courseId: string;
  guruId: string;
  title: string;
  type: 'UH' | 'UTS' | 'UAS';
  duration: number;
  questions: string[];
  startTime: string;
  endTime: string;
  token: string;
  createdAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  siswaId: string;
  siswaName: string;
  answers: number[];
  score: number;
  submittedAt: string;
}

export interface MeetingRoom {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  meetingUrl: string;
  scheduledAt: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  createdAt: string;
}
