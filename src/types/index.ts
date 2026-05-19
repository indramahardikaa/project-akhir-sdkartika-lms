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
