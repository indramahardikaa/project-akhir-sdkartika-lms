import { User, Course, Material, Enrollment } from '@/types';

// Default seed data
const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Administrator',
    email: 'admin@lms.com',
    password: 'admin123',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Budi Santoso',
    email: 'budi@lms.com',
    password: 'guru123',
    role: 'guru',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Siti Rahayu',
    email: 'siti@lms.com',
    password: 'guru123',
    role: 'guru',
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    name: 'Andi Pratama',
    email: 'andi@lms.com',
    password: 'siswa123',
    role: 'siswa',
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    id: '5',
    name: 'Dewi Lestari',
    email: 'dewi@lms.com',
    password: 'siswa123',
    role: 'siswa',
    createdAt: '2024-01-05T00:00:00Z',
  },
];

const defaultCourses: Course[] = [
  {
    id: '1',
    title: 'Matematika Dasar',
    description: 'Pelajaran matematika untuk tingkat dasar meliputi aritmatika, geometri, dan aljabar sederhana.',
    guruId: '2',
    guruName: 'Budi Santoso',
    category: 'Matematika',
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: '2',
    title: 'Bahasa Indonesia',
    description: 'Pelajaran bahasa Indonesia meliputi tata bahasa, menulis, dan membaca.',
    guruId: '3',
    guruName: 'Siti Rahayu',
    category: 'Bahasa',
    createdAt: '2024-01-11T00:00:00Z',
  },
  {
    id: '3',
    title: 'IPA Terpadu',
    description: 'Ilmu Pengetahuan Alam mencakup biologi, fisika, dan kimia dasar.',
    guruId: '2',
    guruName: 'Budi Santoso',
    category: 'Sains',
    createdAt: '2024-01-12T00:00:00Z',
  },
];

const defaultMaterials: Material[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Pengenalan Bilangan',
    content: 'Bilangan adalah konsep dasar dalam matematika. Kita mengenal bilangan bulat, bilangan pecahan, dan bilangan desimal. Bilangan bulat terdiri dari bilangan positif, negatif, dan nol.',
    type: 'text',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    courseId: '1',
    title: 'Operasi Hitung Dasar',
    content: 'Operasi hitung dasar meliputi penjumlahan, pengurangan, perkalian, dan pembagian. Setiap operasi memiliki aturan dan sifat-sifat tertentu.',
    type: 'text',
    createdAt: '2024-01-16T00:00:00Z',
  },
  {
    id: '3',
    courseId: '2',
    title: 'Tata Bahasa Indonesia',
    content: 'Tata bahasa Indonesia meliputi fonologi, morfologi, dan sintaksis. Pemahaman tata bahasa penting untuk komunikasi yang efektif.',
    type: 'text',
    createdAt: '2024-01-17T00:00:00Z',
  },
  {
    id: '4',
    courseId: '3',
    title: 'Pengenalan Sistem Tata Surya',
    content: 'Tata surya kita terdiri dari Matahari sebagai pusat dan delapan planet yang mengelilinginya. Planet-planet tersebut adalah Merkurius, Venus, Bumi, Mars, Jupiter, Saturnus, Uranus, dan Neptunus.',
    type: 'text',
    createdAt: '2024-01-18T00:00:00Z',
  },
];

const defaultEnrollments: Enrollment[] = [
  {
    id: '1',
    siswaId: '4',
    courseId: '1',
    enrolledAt: '2024-02-01T00:00:00Z',
    progress: 50,
  },
  {
    id: '2',
    siswaId: '4',
    courseId: '2',
    enrolledAt: '2024-02-02T00:00:00Z',
    progress: 30,
  },
  {
    id: '3',
    siswaId: '5',
    courseId: '1',
    enrolledAt: '2024-02-03T00:00:00Z',
    progress: 75,
  },
  {
    id: '4',
    siswaId: '5',
    courseId: '3',
    enrolledAt: '2024-02-04T00:00:00Z',
    progress: 20,
  },
];

// Helper functions for localStorage-based data management
function getFromStorage<T>(key: string, defaultData: T[]): T[] {
  if (typeof window === 'undefined') return defaultData;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(stored);
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Users CRUD
export function getUsers(): User[] {
  return getFromStorage('lms_users', defaultUsers);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveToStorage('lms_users', users);
  return newUser;
}

export function updateUser(id: string, data: Partial<User>): User | undefined {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return undefined;
  users[index] = { ...users[index], ...data };
  saveToStorage('lms_users', users);
  return users[index];
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  saveToStorage('lms_users', filtered);
  return true;
}

// Courses CRUD
export function getCourses(): Course[] {
  return getFromStorage('lms_courses', defaultCourses);
}

export function getCourseById(id: string): Course | undefined {
  return getCourses().find((c) => c.id === id);
}

export function getCoursesByGuru(guruId: string): Course[] {
  return getCourses().filter((c) => c.guruId === guruId);
}

export function createCourse(course: Omit<Course, 'id' | 'createdAt'>): Course {
  const courses = getCourses();
  const newCourse: Course = {
    ...course,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  courses.push(newCourse);
  saveToStorage('lms_courses', courses);
  return newCourse;
}

export function updateCourse(id: string, data: Partial<Course>): Course | undefined {
  const courses = getCourses();
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  courses[index] = { ...courses[index], ...data };
  saveToStorage('lms_courses', courses);
  return courses[index];
}

export function deleteCourse(id: string): boolean {
  const courses = getCourses();
  const filtered = courses.filter((c) => c.id !== id);
  if (filtered.length === courses.length) return false;
  saveToStorage('lms_courses', filtered);
  // Also delete related materials and enrollments
  const materials = getMaterials().filter((m) => m.courseId !== id);
  saveToStorage('lms_materials', materials);
  const enrollments = getEnrollments().filter((e) => e.courseId !== id);
  saveToStorage('lms_enrollments', enrollments);
  return true;
}

// Materials CRUD
export function getMaterials(): Material[] {
  return getFromStorage('lms_materials', defaultMaterials);
}

export function getMaterialById(id: string): Material | undefined {
  return getMaterials().find((m) => m.id === id);
}

export function getMaterialsByCourse(courseId: string): Material[] {
  return getMaterials().filter((m) => m.courseId === courseId);
}

export function createMaterial(material: Omit<Material, 'id' | 'createdAt'>): Material {
  const materials = getMaterials();
  const newMaterial: Material = {
    ...material,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  materials.push(newMaterial);
  saveToStorage('lms_materials', materials);
  return newMaterial;
}

export function updateMaterial(id: string, data: Partial<Material>): Material | undefined {
  const materials = getMaterials();
  const index = materials.findIndex((m) => m.id === id);
  if (index === -1) return undefined;
  materials[index] = { ...materials[index], ...data };
  saveToStorage('lms_materials', materials);
  return materials[index];
}

export function deleteMaterial(id: string): boolean {
  const materials = getMaterials();
  const filtered = materials.filter((m) => m.id !== id);
  if (filtered.length === materials.length) return false;
  saveToStorage('lms_materials', filtered);
  return true;
}

// Enrollments CRUD
export function getEnrollments(): Enrollment[] {
  return getFromStorage('lms_enrollments', defaultEnrollments);
}

export function getEnrollmentsBySiswa(siswaId: string): Enrollment[] {
  return getEnrollments().filter((e) => e.siswaId === siswaId);
}

export function getEnrollmentsByCourse(courseId: string): Enrollment[] {
  return getEnrollments().filter((e) => e.courseId === courseId);
}

export function enrollSiswa(siswaId: string, courseId: string): Enrollment {
  const enrollments = getEnrollments();
  const existing = enrollments.find((e) => e.siswaId === siswaId && e.courseId === courseId);
  if (existing) return existing;
  const newEnrollment: Enrollment = {
    id: Date.now().toString(),
    siswaId,
    courseId,
    enrolledAt: new Date().toISOString(),
    progress: 0,
  };
  enrollments.push(newEnrollment);
  saveToStorage('lms_enrollments', enrollments);
  return newEnrollment;
}

export function updateEnrollmentProgress(siswaId: string, courseId: string, progress: number): void {
  const enrollments = getEnrollments();
  const index = enrollments.findIndex((e) => e.siswaId === siswaId && e.courseId === courseId);
  if (index !== -1) {
    enrollments[index].progress = progress;
    saveToStorage('lms_enrollments', enrollments);
  }
}

export function unenrollSiswa(siswaId: string, courseId: string): boolean {
  const enrollments = getEnrollments();
  const filtered = enrollments.filter((e) => !(e.siswaId === siswaId && e.courseId === courseId));
  if (filtered.length === enrollments.length) return false;
  saveToStorage('lms_enrollments', filtered);
  return true;
}
