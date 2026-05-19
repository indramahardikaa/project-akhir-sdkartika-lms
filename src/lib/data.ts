import { User, Course, Material, Enrollment, Announcement, Attendance, ForumTask, TaskSubmission, BankSoal, Exam, ExamResult, ActivityLog, Kelas, JadwalPelajaran } from '@/types';

// Default seed data
const defaultUsers: User[] = [
  { id: '1', name: 'Administrator', email: 'admin@lms.com', password: 'admin123', role: 'admin', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Budi Santoso', email: 'budi@lms.com', password: 'guru123', role: 'guru', createdAt: '2024-01-02T00:00:00Z' },
  { id: '3', name: 'Siti Rahayu', email: 'siti@lms.com', password: 'guru123', role: 'guru', createdAt: '2024-01-03T00:00:00Z' },
  { id: '4', name: 'Andi Pratama', email: 'andi@lms.com', password: 'siswa123', role: 'siswa', kelas: '1A', nisn: '0012345001', nis: '2024001', createdAt: '2024-01-04T00:00:00Z' },
  { id: '5', name: 'Dewi Lestari', email: 'dewi@lms.com', password: 'siswa123', role: 'siswa', kelas: '1A', nisn: '0012345002', nis: '2024002', createdAt: '2024-01-05T00:00:00Z' },
  { id: '6', name: 'Rizki Ramadhan', email: 'rizki@lms.com', password: 'siswa123', role: 'siswa', kelas: '1B', nisn: '0012345003', nis: '2024003', createdAt: '2024-01-06T00:00:00Z' },

  { id: '7', name: 'Putri Amelia', email: 'putri@lms.com', password: 'siswa123', role: 'siswa', kelas: '2A', nisn: '0012345004', nis: '2024004', createdAt: '2024-01-07T00:00:00Z' },
  { id: '8', name: 'Fajar Nugroho', email: 'fajar@lms.com', password: 'siswa123', role: 'siswa', kelas: '2A', nisn: '0012345005', nis: '2024005', createdAt: '2024-01-08T00:00:00Z' },
  { id: '9', name: 'Sari Wulandari', email: 'sari@lms.com', password: 'siswa123', role: 'siswa', kelas: '3A', nisn: '0012345006', nis: '2024006', createdAt: '2024-01-09T00:00:00Z' },
  { id: '10', name: 'Dimas Aditya', email: 'dimas@lms.com', password: 'siswa123', role: 'siswa', kelas: '2B', nisn: '0012345007', nis: '2024007', createdAt: '2024-01-10T00:00:00Z' },
];

const defaultKelas: Kelas[] = [
  { id: 'k1', name: '1A', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k2', name: '1B', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k3', name: '2A', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k4', name: '2B', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k5', name: '3A', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k6', name: '3B', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k7', name: '4A', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k8', name: '4B', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k9', name: '5A', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k10', name: '5B', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k11', name: '6A', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'k12', name: '6B', createdAt: '2024-01-01T00:00:00Z' },
];


const defaultJadwalPelajaran: JadwalPelajaran[] = [
  { id: 'j1', kelasId: 'k1', courseId: '1', guruId: '2', hari: 'Senin', jamMulai: '08:00', jamSelesai: '09:30' },
  { id: 'j2', kelasId: 'k1', courseId: '2', guruId: '3', hari: 'Selasa', jamMulai: '08:00', jamSelesai: '09:30' },
  { id: 'j3', kelasId: 'k3', courseId: '3', guruId: '2', hari: 'Rabu', jamMulai: '10:00', jamSelesai: '11:30' },
];

const defaultCourses: Course[] = [
  { id: '1', title: 'Matematika Dasar', description: 'Pelajaran matematika untuk tingkat dasar', guruId: '2', guruName: 'Budi Santoso', category: 'Matematika', createdAt: '2024-01-10T00:00:00Z' },
  { id: '2', title: 'Bahasa Indonesia', description: 'Pelajaran bahasa Indonesia meliputi tata bahasa', guruId: '3', guruName: 'Siti Rahayu', category: 'Bahasa', createdAt: '2024-01-11T00:00:00Z' },
  { id: '3', title: 'IPA Terpadu', description: 'Ilmu Pengetahuan Alam mencakup biologi, fisika, dan kimia dasar', guruId: '2', guruName: 'Budi Santoso', category: 'Sains', createdAt: '2024-01-12T00:00:00Z' },
];

const defaultMaterials: Material[] = [
  { id: '1', courseId: '1', title: 'Pengenalan Bilangan', content: 'Bilangan adalah konsep dasar dalam matematika.', type: 'text', createdAt: '2024-01-15T00:00:00Z' },
  { id: '2', courseId: '1', title: 'Operasi Hitung Dasar', content: 'Operasi hitung dasar meliputi penjumlahan, pengurangan, perkalian, dan pembagian.', type: 'text', createdAt: '2024-01-16T00:00:00Z' },
  { id: '3', courseId: '2', title: 'Tata Bahasa Indonesia', content: 'Tata bahasa Indonesia meliputi fonologi, morfologi, dan sintaksis.', type: 'text', createdAt: '2024-01-17T00:00:00Z' },
  { id: '4', courseId: '3', title: 'Pengenalan Sistem Tata Surya', content: 'Tata surya kita terdiri dari Matahari sebagai pusat dan delapan planet.', type: 'text', createdAt: '2024-01-18T00:00:00Z' },
];


const defaultEnrollments: Enrollment[] = [
  { id: '1', siswaId: '4', courseId: '1', enrolledAt: '2024-02-01T00:00:00Z', progress: 50 },
  { id: '2', siswaId: '4', courseId: '2', enrolledAt: '2024-02-02T00:00:00Z', progress: 30 },
  { id: '3', siswaId: '5', courseId: '1', enrolledAt: '2024-02-03T00:00:00Z', progress: 75 },
  { id: '4', siswaId: '5', courseId: '3', enrolledAt: '2024-02-04T00:00:00Z', progress: 20 },
  { id: '5', siswaId: '6', courseId: '1', enrolledAt: '2024-02-05T00:00:00Z', progress: 60 },
  { id: '6', siswaId: '6', courseId: '2', enrolledAt: '2024-02-06T00:00:00Z', progress: 40 },
  { id: '7', siswaId: '7', courseId: '1', enrolledAt: '2024-02-07T00:00:00Z', progress: 45 },
  { id: '8', siswaId: '8', courseId: '3', enrolledAt: '2024-02-08T00:00:00Z', progress: 55 },
  { id: '9', siswaId: '9', courseId: '2', enrolledAt: '2024-02-09T00:00:00Z', progress: 35 },
  { id: '10', siswaId: '10', courseId: '1', enrolledAt: '2024-02-10T00:00:00Z', progress: 25 },
];

const defaultAnnouncements: Announcement[] = [
  { id: '1', title: 'Selamat Datang di Semester Baru', content: 'Selamat datang kembali di semester genap. Semoga semangat belajar tetap terjaga.', authorId: '1', authorName: 'Administrator', targetRole: 'all', createdAt: '2024-02-01T08:00:00Z' },
  { id: '2', title: 'Jadwal UTS Semester Genap', content: 'UTS akan dilaksanakan pada minggu ke-8. Persiapkan diri dengan baik.', authorId: '1', authorName: 'Administrator', targetRole: 'all', createdAt: '2024-02-15T08:00:00Z' },
  { id: '3', title: 'Rapat Guru Bulanan', content: 'Rapat guru bulanan akan diadakan hari Senin pukul 14:00 di ruang guru.', authorId: '1', authorName: 'Administrator', targetRole: 'guru', createdAt: '2024-02-20T08:00:00Z' },
];


const defaultAttendance: Attendance[] = [
  { id: '1', courseId: '1', siswaId: '4', kelasId: 'k1', day: 5, month: 2, year: 2024, status: 'hadir' },
  { id: '2', courseId: '1', siswaId: '5', kelasId: 'k1', day: 5, month: 2, year: 2024, status: 'hadir' },
  { id: '3', courseId: '1', siswaId: '6', kelasId: 'k2', day: 5, month: 2, year: 2024, status: 'izin', note: 'Acara keluarga' },
  { id: '4', courseId: '1', siswaId: '4', kelasId: 'k1', day: 6, month: 2, year: 2024, status: 'hadir' },
  { id: '5', courseId: '1', siswaId: '5', kelasId: 'k1', day: 6, month: 2, year: 2024, status: 'sakit', note: 'Demam' },
  { id: '6', courseId: '2', siswaId: '4', kelasId: 'k1', day: 5, month: 2, year: 2024, status: 'hadir' },
];

const defaultForumTasks: ForumTask[] = [
  { id: '1', courseId: '1', guruId: '2', title: 'Latihan Soal Perkalian', description: 'Kerjakan 20 soal perkalian berikut ini.', deadline: '2024-03-01T23:59:00Z', createdAt: '2024-02-10T08:00:00Z' },
  { id: '2', courseId: '2', guruId: '3', title: 'Menulis Cerita Pendek', description: 'Tulis cerita pendek minimal 500 kata.', deadline: '2024-03-05T23:59:00Z', createdAt: '2024-02-12T08:00:00Z' },
  { id: '3', courseId: '3', guruId: '2', title: 'Laporan Pengamatan Tumbuhan', description: 'Buat laporan pengamatan tumbuhan di sekitar rumah.', deadline: '2024-03-10T23:59:00Z', createdAt: '2024-02-15T08:00:00Z' },
];

const defaultTaskSubmissions: TaskSubmission[] = [
  { id: '1', taskId: '1', siswaId: '4', siswaName: 'Andi Pratama', content: 'Jawaban soal perkalian sudah selesai.', submittedAt: '2024-02-28T10:00:00Z', grade: 85 },
  { id: '2', taskId: '1', siswaId: '5', siswaName: 'Dewi Lestari', content: 'Soal perkalian selesai dikerjakan.', submittedAt: '2024-02-27T14:00:00Z', grade: 90 },
  { id: '3', taskId: '2', siswaId: '4', siswaName: 'Andi Pratama', content: 'Cerita pendek berjudul Petualangan di Hutan.', submittedAt: '2024-03-04T08:00:00Z' },
];


const defaultBankSoal: BankSoal[] = [
  { id: '1', courseId: '1', question: 'Berapakah hasil dari 8 x 7?', options: ['54', '56', '58', '62'], correctAnswer: 1, category: 'Perkalian', difficulty: 'mudah', createdAt: '2024-02-01T00:00:00Z' },
  { id: '2', courseId: '1', question: 'Hasil dari 125 / 5 adalah?', options: ['20', '25', '30', '35'], correctAnswer: 1, category: 'Pembagian', difficulty: 'mudah', createdAt: '2024-02-01T00:00:00Z' },
  { id: '3', courseId: '1', question: 'Luas persegi dengan sisi 9 cm adalah?', options: ['72 cm2', '81 cm2', '90 cm2', '99 cm2'], correctAnswer: 1, category: 'Geometri', difficulty: 'sedang', createdAt: '2024-02-02T00:00:00Z' },
  { id: '4', courseId: '2', question: 'Kata baku dari "analisa" adalah?', options: ['Analisis', 'Analisa', 'Analis', 'Analise'], correctAnswer: 0, category: 'Tata Bahasa', difficulty: 'mudah', createdAt: '2024-02-03T00:00:00Z' },
  { id: '5', courseId: '3', question: 'Planet terbesar di tata surya adalah?', options: ['Saturnus', 'Jupiter', 'Uranus', 'Neptunus'], correctAnswer: 1, category: 'Astronomi', difficulty: 'mudah', createdAt: '2024-02-04T00:00:00Z' },
];

const defaultExams: Exam[] = [
  { id: '1', courseId: '1', guruId: '2', title: 'UH 1 - Matematika Dasar', type: 'UH', duration: 60, questions: ['1', '2', '3'], startTime: '2024-03-01T08:00:00Z', endTime: '2024-03-01T09:00:00Z', token: 'MTK001', createdAt: '2024-02-20T00:00:00Z' },
  { id: '2', courseId: '2', guruId: '3', title: 'UH 1 - Bahasa Indonesia', type: 'UH', duration: 90, questions: ['4'], startTime: '2024-03-15T08:00:00Z', endTime: '2024-03-15T09:30:00Z', token: 'BIN001', createdAt: '2024-03-01T00:00:00Z' },
];

const defaultExamResults: ExamResult[] = [
  { id: '1', examId: '1', siswaId: '4', siswaName: 'Andi Pratama', answers: [1, 1, 1], score: 100, submittedAt: '2024-03-01T08:45:00Z' },
  { id: '2', examId: '1', siswaId: '5', siswaName: 'Dewi Lestari', answers: [1, 0, 1], score: 67, submittedAt: '2024-03-01T08:50:00Z' },
  { id: '3', examId: '1', siswaId: '6', siswaName: 'Rizki Ramadhan', answers: [1, 1, 0], score: 67, submittedAt: '2024-03-01T08:55:00Z' },
];


const defaultActivityLogs: ActivityLog[] = [
  { id: '1', userId: '1', userName: 'Administrator', action: 'Menambahkan pengumuman baru', createdAt: '2024-02-20T08:00:00Z' },
  { id: '2', userId: '2', userName: 'Budi Santoso', action: 'Membuat tugas baru: Latihan Soal Perkalian', createdAt: '2024-02-10T08:00:00Z' },
  { id: '3', userId: '4', userName: 'Andi Pratama', action: 'Mengumpulkan tugas: Latihan Soal Perkalian', createdAt: '2024-02-28T10:00:00Z' },
  { id: '4', userId: '3', userName: 'Siti Rahayu', action: 'Membuat jadwal ujian UH Bahasa Indonesia', createdAt: '2024-03-01T00:00:00Z' },
  { id: '5', userId: '5', userName: 'Dewi Lestari', action: 'Mengerjakan ujian UH 1 Matematika', createdAt: '2024-03-01T08:50:00Z' },
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
export function getUsers(): User[] { return getFromStorage('lms_users', defaultUsers); }
export function getUserById(id: string): User | undefined { return getUsers().find((u) => u.id === id); }
export function getUserByEmail(email: string): User | undefined { return getUsers().find((u) => u.email === email); }
export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers();
  const newUser: User = { ...user, id: Date.now().toString(), createdAt: new Date().toISOString() };
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


// Kelas CRUD
export function getKelas(): Kelas[] { return getFromStorage('lms_kelas', defaultKelas); }
export function getKelasById(id: string): Kelas | undefined { return getKelas().find((k) => k.id === id); }
export function createKelas(kelas: Omit<Kelas, 'id' | 'createdAt'>): Kelas {
  const items = getKelas();
  const newItem: Kelas = { ...kelas, id: Date.now().toString(), createdAt: new Date().toISOString() };
  items.push(newItem);
  saveToStorage('lms_kelas', items);
  return newItem;
}
export function updateKelas(id: string, data: Partial<Kelas>): Kelas | undefined {
  const items = getKelas();
  const index = items.findIndex((k) => k.id === id);
  if (index === -1) return undefined;
  items[index] = { ...items[index], ...data };
  saveToStorage('lms_kelas', items);
  return items[index];
}
export function deleteKelas(id: string): boolean {
  const items = getKelas();
  const filtered = items.filter((k) => k.id !== id);
  if (filtered.length === items.length) return false;
  saveToStorage('lms_kelas', filtered);
  return true;
}


// JadwalPelajaran CRUD
export function getJadwalPelajaran(): JadwalPelajaran[] { return getFromStorage('lms_jadwal', defaultJadwalPelajaran); }
export function getJadwalByKelas(kelasId: string): JadwalPelajaran[] { return getJadwalPelajaran().filter((j) => j.kelasId === kelasId); }
export function getJadwalByGuru(guruId: string): JadwalPelajaran[] { return getJadwalPelajaran().filter((j) => j.guruId === guruId); }
export function createJadwalPelajaran(jadwal: Omit<JadwalPelajaran, 'id'>): JadwalPelajaran {
  const items = getJadwalPelajaran();
  const newItem: JadwalPelajaran = { ...jadwal, id: Date.now().toString() };
  items.push(newItem);
  saveToStorage('lms_jadwal', items);
  return newItem;
}
export function deleteJadwalPelajaran(id: string): boolean {
  const items = getJadwalPelajaran();
  const filtered = items.filter((j) => j.id !== id);
  if (filtered.length === items.length) return false;
  saveToStorage('lms_jadwal', filtered);
  return true;
}

// Courses CRUD
export function getCourses(): Course[] { return getFromStorage('lms_courses', defaultCourses); }
export function getCourseById(id: string): Course | undefined { return getCourses().find((c) => c.id === id); }
export function getCoursesByGuru(guruId: string): Course[] { return getCourses().filter((c) => c.guruId === guruId); }
export function createCourse(course: Omit<Course, 'id' | 'createdAt'>): Course {
  const courses = getCourses();
  const newCourse: Course = { ...course, id: Date.now().toString(), createdAt: new Date().toISOString() };
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
  return true;
}


// Materials CRUD
export function getMaterials(): Material[] { return getFromStorage('lms_materials', defaultMaterials); }
export function getMaterialById(id: string): Material | undefined { return getMaterials().find((m) => m.id === id); }
export function getMaterialsByCourse(courseId: string): Material[] { return getMaterials().filter((m) => m.courseId === courseId); }
export function createMaterial(material: Omit<Material, 'id' | 'createdAt'>): Material {
  const materials = getMaterials();
  const newMaterial: Material = { ...material, id: Date.now().toString(), createdAt: new Date().toISOString() };
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
export function getEnrollments(): Enrollment[] { return getFromStorage('lms_enrollments', defaultEnrollments); }
export function getEnrollmentsBySiswa(siswaId: string): Enrollment[] { return getEnrollments().filter((e) => e.siswaId === siswaId); }
export function getEnrollmentsByCourse(courseId: string): Enrollment[] { return getEnrollments().filter((e) => e.courseId === courseId); }
export function enrollSiswa(siswaId: string, courseId: string): Enrollment {
  const enrollments = getEnrollments();
  const existing = enrollments.find((e) => e.siswaId === siswaId && e.courseId === courseId);
  if (existing) return existing;
  const newEnrollment: Enrollment = { id: Date.now().toString(), siswaId, courseId, enrolledAt: new Date().toISOString(), progress: 0 };
  enrollments.push(newEnrollment);
  saveToStorage('lms_enrollments', enrollments);
  return newEnrollment;
}
export function updateEnrollmentProgress(siswaId: string, courseId: string, progress: number): void {
  const enrollments = getEnrollments();
  const index = enrollments.findIndex((e) => e.siswaId === siswaId && e.courseId === courseId);
  if (index !== -1) { enrollments[index].progress = progress; saveToStorage('lms_enrollments', enrollments); }
}
export function unenrollSiswa(siswaId: string, courseId: string): boolean {
  const enrollments = getEnrollments();
  const filtered = enrollments.filter((e) => !(e.siswaId === siswaId && e.courseId === courseId));
  if (filtered.length === enrollments.length) return false;
  saveToStorage('lms_enrollments', filtered);
  return true;
}


// Announcements CRUD
export function getAnnouncements(): Announcement[] { return getFromStorage('lms_announcements', defaultAnnouncements); }
export function createAnnouncement(a: Omit<Announcement, 'id' | 'createdAt'>): Announcement {
  const items = getAnnouncements();
  const newItem: Announcement = { ...a, id: Date.now().toString(), createdAt: new Date().toISOString() };
  items.push(newItem);
  saveToStorage('lms_announcements', items);
  return newItem;
}
export function deleteAnnouncement(id: string): boolean {
  const items = getAnnouncements();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveToStorage('lms_announcements', filtered);
  return true;
}

// Attendance CRUD
export function getAttendance(): Attendance[] { return getFromStorage('lms_attendance', defaultAttendance); }
export function getAttendanceByCourse(courseId: string): Attendance[] { return getAttendance().filter((a) => a.courseId === courseId); }
export function getAttendanceBySiswa(siswaId: string): Attendance[] { return getAttendance().filter((a) => a.siswaId === siswaId); }
export function getAttendanceByMonth(courseId: string, kelasId: string, month: number, year: number): Attendance[] {
  return getAttendance().filter((a) => a.courseId === courseId && a.kelasId === kelasId && a.month === month && a.year === year);
}
export function getAttendanceByKelasMonth(kelasId: string, month: number, year: number): Attendance[] {
  return getAttendance().filter((a) => a.kelasId === kelasId && a.month === month && a.year === year);
}
export function createAttendance(a: Omit<Attendance, 'id'>): Attendance {
  const items = getAttendance();
  const newItem: Attendance = { ...a, id: Date.now().toString() };
  items.push(newItem);
  saveToStorage('lms_attendance', items);
  return newItem;
}
export function updateAttendance(id: string, data: Partial<Attendance>): Attendance | undefined {
  const items = getAttendance();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return undefined;
  items[index] = { ...items[index], ...data };
  saveToStorage('lms_attendance', items);
  return items[index];
}


// ForumTask CRUD
export function getForumTasks(): ForumTask[] { return getFromStorage('lms_forum_tasks', defaultForumTasks); }
export function getForumTasksByCourse(courseId: string): ForumTask[] { return getForumTasks().filter((t) => t.courseId === courseId); }
export function getForumTasksByGuru(guruId: string): ForumTask[] { return getForumTasks().filter((t) => t.guruId === guruId); }
export function createForumTask(t: Omit<ForumTask, 'id' | 'createdAt'>): ForumTask {
  const items = getForumTasks();
  const newItem: ForumTask = { ...t, id: Date.now().toString(), createdAt: new Date().toISOString() };
  items.push(newItem);
  saveToStorage('lms_forum_tasks', items);
  return newItem;
}
export function deleteForumTask(id: string): boolean {
  const items = getForumTasks();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveToStorage('lms_forum_tasks', filtered);
  return true;
}

// TaskSubmission CRUD
export function getTaskSubmissions(): TaskSubmission[] { return getFromStorage('lms_task_submissions', defaultTaskSubmissions); }
export function getSubmissionsByTask(taskId: string): TaskSubmission[] { return getTaskSubmissions().filter((s) => s.taskId === taskId); }
export function getSubmissionsBySiswa(siswaId: string): TaskSubmission[] { return getTaskSubmissions().filter((s) => s.siswaId === siswaId); }
export function createTaskSubmission(s: Omit<TaskSubmission, 'id' | 'submittedAt'>): TaskSubmission {
  const items = getTaskSubmissions();
  const newItem: TaskSubmission = { ...s, id: Date.now().toString(), submittedAt: new Date().toISOString() };
  items.push(newItem);
  saveToStorage('lms_task_submissions', items);
  return newItem;
}
export function gradeSubmission(id: string, grade: number): TaskSubmission | undefined {
  const items = getTaskSubmissions();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return undefined;
  items[index].grade = grade;
  saveToStorage('lms_task_submissions', items);
  return items[index];
}


// BankSoal CRUD
export function getBankSoal(): BankSoal[] { return getFromStorage('lms_bank_soal', defaultBankSoal); }
export function getBankSoalByCourse(courseId: string): BankSoal[] { return getBankSoal().filter((b) => b.courseId === courseId); }
export function createBankSoal(b: Omit<BankSoal, 'id' | 'createdAt'>): BankSoal {
  const items = getBankSoal();
  const newItem: BankSoal = { ...b, id: Date.now().toString(), createdAt: new Date().toISOString() };
  items.push(newItem);
  saveToStorage('lms_bank_soal', items);
  return newItem;
}
export function updateBankSoal(id: string, data: Partial<BankSoal>): BankSoal | undefined {
  const items = getBankSoal();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return undefined;
  items[index] = { ...items[index], ...data };
  saveToStorage('lms_bank_soal', items);
  return items[index];
}
export function deleteBankSoal(id: string): boolean {
  const items = getBankSoal();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveToStorage('lms_bank_soal', filtered);
  return true;
}

// Exam CRUD
export function getExams(): Exam[] { return getFromStorage('lms_exams', defaultExams); }
export function getExamById(id: string): Exam | undefined { return getExams().find((e) => e.id === id); }
export function getExamsByGuru(guruId: string): Exam[] { return getExams().filter((e) => e.guruId === guruId); }
export function getExamsByCourse(courseId: string): Exam[] { return getExams().filter((e) => e.courseId === courseId); }
export function createExam(e: Omit<Exam, 'id' | 'createdAt'>): Exam {
  const items = getExams();
  const newItem: Exam = { ...e, id: Date.now().toString(), createdAt: new Date().toISOString() };
  items.push(newItem);
  saveToStorage('lms_exams', items);
  return newItem;
}
export function deleteExam(id: string): boolean {
  const items = getExams();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveToStorage('lms_exams', filtered);
  return true;
}


// ExamResult CRUD
export function getExamResults(): ExamResult[] { return getFromStorage('lms_exam_results', defaultExamResults); }
export function getExamResultsByExam(examId: string): ExamResult[] { return getExamResults().filter((r) => r.examId === examId); }
export function getExamResultsBySiswa(siswaId: string): ExamResult[] { return getExamResults().filter((r) => r.siswaId === siswaId); }
export function createExamResult(r: Omit<ExamResult, 'id' | 'submittedAt'>): ExamResult {
  const items = getExamResults();
  const newItem: ExamResult = { ...r, id: Date.now().toString(), submittedAt: new Date().toISOString() };
  items.push(newItem);
  saveToStorage('lms_exam_results', items);
  return newItem;
}

// ActivityLog CRUD
export function getActivityLogs(): ActivityLog[] { return getFromStorage('lms_activity_logs', defaultActivityLogs); }
export function addActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt'>): ActivityLog {
  const items = getActivityLogs();
  const newItem: ActivityLog = { ...log, id: Date.now().toString(), createdAt: new Date().toISOString() };
  items.push(newItem);
  saveToStorage('lms_activity_logs', items);
  return newItem;
}
