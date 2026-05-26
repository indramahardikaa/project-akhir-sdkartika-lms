export type Role = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  classId?: string; // For siswa - which class they belong to
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
  videoUrl?: string; // Video URL attached by guru
  fileUrl?: string; // Document/file URL attached by guru
  fileName?: string; // Name of attached document/file
  rppUrl?: string; // RPP file URL
  rppName?: string; // RPP file name
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
