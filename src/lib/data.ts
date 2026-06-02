import { User, Course, Material, Enrollment, ClassRoom, ReadingProgress, Assignment, AssignmentSubmission, ClassNote } from '@/types';

// Default seed data
const defaultClassRooms: ClassRoom[] = [
  { id: '1', name: 'Kelas 1A', grade: 1, section: 'A', guruId: '2', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Kelas 1B', grade: 1, section: 'B', guruId: '3', createdAt: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'Kelas 2A', grade: 2, section: 'A', guruId: '2', createdAt: '2024-01-01T00:00:00Z' },
  { id: '4', name: 'Kelas 2B', grade: 2, section: 'B', guruId: '3', createdAt: '2024-01-01T00:00:00Z' },
];

const defaultUsers: User[] = [
  { id: '1', name: 'Administrator', email: 'admin@lms.com', password: 'admin123', role: 'admin', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Budi Santoso', email: 'budi@lms.com', password: 'guru123', role: 'guru', createdAt: '2024-01-02T00:00:00Z' },
  { id: '3', name: 'Siti Rahayu', email: 'siti@lms.com', password: 'guru123', role: 'guru', createdAt: '2024-01-03T00:00:00Z' },
  { id: '4', name: 'Andi Pratama', email: 'andi@lms.com', password: 'siswa123', role: 'siswa', classId: '1', createdAt: '2024-01-04T00:00:00Z' },
  { id: '5', name: 'Dewi Lestari', email: 'dewi@lms.com', password: 'siswa123', role: 'siswa', classId: '1', createdAt: '2024-01-05T00:00:00Z' },
  { id: '6', name: 'Rudi Hermawan', email: 'rudi@lms.com', password: 'siswa123', role: 'siswa', classId: '2', createdAt: '2024-01-06T00:00:00Z' },
  { id: '7', name: 'Maya Sari', email: 'maya@lms.com', password: 'siswa123', role: 'siswa', classId: '2', createdAt: '2024-01-07T00:00:00Z' },
  { id: '8', name: 'Faisal Ahmad', email: 'faisal@lms.com', password: 'siswa123', role: 'siswa', classId: '3', createdAt: '2024-01-08T00:00:00Z' },
  { id: '9', name: 'Putri Wulandari', email: 'putri@lms.com', password: 'siswa123', role: 'siswa', classId: '4', createdAt: '2024-01-09T00:00:00Z' },
];


const defaultCourses: Course[] = [
  { id: '1', title: 'Matematika Dasar', description: 'Pelajaran matematika untuk tingkat dasar meliputi aritmatika, geometri, dan aljabar sederhana.', guruId: '2', guruName: 'Budi Santoso', category: 'Matematika', createdAt: '2024-01-10T00:00:00Z' },
  { id: '2', title: 'Bahasa Indonesia', description: 'Pelajaran bahasa Indonesia meliputi tata bahasa, menulis, dan membaca.', guruId: '3', guruName: 'Siti Rahayu', category: 'Bahasa', createdAt: '2024-01-11T00:00:00Z' },
  { id: '3', title: 'IPA Terpadu', description: 'Ilmu Pengetahuan Alam mencakup biologi, fisika, dan kimia dasar.', guruId: '2', guruName: 'Budi Santoso', category: 'Sains', createdAt: '2024-01-12T00:00:00Z' },
];

const defaultMaterials: Material[] = [
  { id: '1', courseId: '1', title: 'Pengenalan Bilangan', content: 'Bilangan adalah konsep dasar dalam matematika. Kita mengenal bilangan bulat, bilangan pecahan, dan bilangan desimal.\n\nBilangan bulat terdiri dari bilangan positif, negatif, dan nol. Contoh bilangan bulat positif: 1, 2, 3, 4, 5. Contoh bilangan bulat negatif: -1, -2, -3, -4, -5.\n\nBilangan pecahan adalah bilangan yang menyatakan bagian dari keseluruhan. Contoh: 1/2, 1/3, 2/5.\n\nBilangan desimal adalah cara lain untuk menuliskan bilangan pecahan. Contoh: 0.5, 0.33, 0.4.', type: 'text', order: 1, createdAt: '2024-01-15T00:00:00Z' },
  { id: '2', courseId: '1', title: 'Operasi Hitung Dasar', content: 'Operasi hitung dasar meliputi penjumlahan, pengurangan, perkalian, dan pembagian.\n\n1. PENJUMLAHAN (+)\nPenjumlahan adalah menggabungkan dua bilangan. Contoh: 3 + 5 = 8\n\n2. PENGURANGAN (-)\nPengurangan adalah mengambil sebagian dari suatu bilangan. Contoh: 10 - 4 = 6\n\n3. PERKALIAN (×)\nPerkalian adalah penjumlahan berulang. Contoh: 3 × 4 = 12 (artinya 3+3+3+3)\n\n4. PEMBAGIAN (÷)\nPembagian adalah kebalikan dari perkalian. Contoh: 12 ÷ 3 = 4', type: 'text', order: 2, createdAt: '2024-01-16T00:00:00Z' },
  { id: '3', courseId: '1', title: 'Video: Menghitung Cepat', content: 'Video pembelajaran tentang teknik menghitung cepat untuk operasi penjumlahan dan perkalian.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example1', order: 3, createdAt: '2024-01-17T00:00:00Z' },
  { id: '4', courseId: '2', title: 'Tata Bahasa Indonesia', content: 'Tata bahasa Indonesia meliputi fonologi, morfologi, dan sintaksis.\n\nFONOLOGI\nFonologi mempelajari bunyi-bunyi bahasa. Dalam bahasa Indonesia terdapat vokal (a, i, u, e, o) dan konsonan.\n\nMORFOLOGI\nMorfologi mempelajari bentuk kata dan perubahannya. Contoh: berjalan (ber- + jalan), memakan (me- + makan).\n\nSINTAKSIS\nSintaksis mempelajari susunan kata dalam kalimat. Kalimat minimal terdiri dari subjek dan predikat.', type: 'text', order: 1, createdAt: '2024-01-18T00:00:00Z' },
  { id: '5', courseId: '2', title: 'Menulis Paragraf', content: 'Paragraf adalah kumpulan kalimat yang membahas satu gagasan pokok.\n\nStruktur paragraf:\n1. Kalimat utama - berisi gagasan pokok\n2. Kalimat penjelas - mendukung gagasan pokok\n3. Kalimat penutup - menyimpulkan isi paragraf\n\nJenis paragraf:\n- Deduktif: gagasan pokok di awal\n- Induktif: gagasan pokok di akhir\n- Campuran: gagasan pokok di awal dan akhir', type: 'text', order: 2, createdAt: '2024-01-19T00:00:00Z' },
  { id: '6', courseId: '2', title: 'RPP Bahasa Indonesia Semester 1', content: 'Rencana Pelaksanaan Pembelajaran (RPP) Bahasa Indonesia untuk semester 1 mencakup materi tata bahasa, menulis paragraf, dan membaca pemahaman.', type: 'rpp', fileUrl: '/files/rpp-bahasa-indonesia.pdf', fileName: 'RPP_Bahasa_Indonesia_Sem1.pdf', order: 3, createdAt: '2024-01-20T00:00:00Z' },
  { id: '7', courseId: '3', title: 'Pengenalan Sistem Tata Surya', content: 'Tata surya kita terdiri dari Matahari sebagai pusat dan delapan planet yang mengelilinginya.\n\nPlanet-planet dalam tata surya (dari yang terdekat ke Matahari):\n1. Merkurius - planet terkecil dan terdekat\n2. Venus - planet terpanas\n3. Bumi - planet kita, satu-satunya yang dihuni makhluk hidup\n4. Mars - planet merah\n5. Jupiter - planet terbesar\n6. Saturnus - planet bercincin\n7. Uranus - planet yang berotasi miring\n8. Neptunus - planet terjauh\n\nSelain planet, tata surya juga memiliki asteroid, komet, dan planet kerdil seperti Pluto.', type: 'text', order: 1, createdAt: '2024-01-21T00:00:00Z' },
  { id: '8', courseId: '3', title: 'Video: Keajaiban Tata Surya', content: 'Video dokumenter tentang keajaiban tata surya dan fenomena-fenomena luar angkasa.', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=example2', order: 2, createdAt: '2024-01-22T00:00:00Z' },
];


const defaultEnrollments: Enrollment[] = [
  { id: '1', siswaId: '4', courseId: '1', enrolledAt: '2024-02-01T00:00:00Z', progress: 50 },
  { id: '2', siswaId: '4', courseId: '2', enrolledAt: '2024-02-02T00:00:00Z', progress: 30 },
  { id: '3', siswaId: '5', courseId: '1', enrolledAt: '2024-02-03T00:00:00Z', progress: 75 },
  { id: '4', siswaId: '5', courseId: '3', enrolledAt: '2024-02-04T00:00:00Z', progress: 20 },
  { id: '5', siswaId: '6', courseId: '2', enrolledAt: '2024-02-05T00:00:00Z', progress: 60 },
  { id: '6', siswaId: '7', courseId: '1', enrolledAt: '2024-02-06T00:00:00Z', progress: 40 },
  { id: '7', siswaId: '8', courseId: '3', enrolledAt: '2024-02-07T00:00:00Z', progress: 10 },
  { id: '8', siswaId: '9', courseId: '2', enrolledAt: '2024-02-08T00:00:00Z', progress: 90 },
];

const defaultReadingProgress: ReadingProgress[] = [
  { id: '1', siswaId: '4', materialId: '1', courseId: '1', completed: true, completedAt: '2024-02-10T00:00:00Z' },
  { id: '2', siswaId: '5', materialId: '1', courseId: '1', completed: true, completedAt: '2024-02-11T00:00:00Z' },
  { id: '3', siswaId: '5', materialId: '2', courseId: '1', completed: true, completedAt: '2024-02-12T00:00:00Z' },
];

const defaultAssignments: Assignment[] = [
  { id: '1', courseId: '1', guruId: '2', title: 'Tugas Penjumlahan & Pengurangan', description: 'Kerjakan soal-soal penjumlahan dan pengurangan pada foto berikut. Tulis jawaban di buku tulis, lalu foto dan upload.', imageUrl: '', dueDate: '2024-03-01T00:00:00Z', createdAt: '2024-02-15T00:00:00Z' },
  { id: '2', courseId: '2', guruId: '3', title: 'Menulis Paragraf Deskriptif', description: 'Tulislah satu paragraf deskriptif tentang lingkungan sekolahmu. Foto hasil tulisan dan upload.', imageUrl: '', dueDate: '2024-03-05T00:00:00Z', createdAt: '2024-02-16T00:00:00Z' },
];

const defaultAssignmentSubmissions: AssignmentSubmission[] = [
  { id: '1', assignmentId: '1', siswaId: '4', imageUrl: '', submittedAt: '2024-02-20T00:00:00Z', grade: 85, feedback: 'Bagus, tapi perhatikan penulisan angka.' },
];

const defaultClassNotes: ClassNote[] = [
  { id: '1', classId: '1', guruId: '2', title: 'Catatan Kelas 1A - Minggu 1', content: 'Siswa kelas 1A perlu lebih banyak latihan membaca. Perhatikan Andi yang masih kesulitan dengan huruf R.', createdAt: '2024-02-10T00:00:00Z' },
  { id: '2', classId: '2', guruId: '3', title: 'Catatan Kelas 1B - Minggu 1', content: 'Kelas 1B cukup aktif dalam diskusi. Maya perlu bimbingan tambahan untuk matematika.', createdAt: '2024-02-10T00:00:00Z' },
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

// ClassRooms CRUD
export function getClassRooms(): ClassRoom[] {
  return getFromStorage('lms_classrooms', defaultClassRooms);
}

export function getClassRoomById(id: string): ClassRoom | undefined {
  return getClassRooms().find((c) => c.id === id);
}

export function createClassRoom(classRoom: Omit<ClassRoom, 'id' | 'createdAt'>): ClassRoom {
  const classRooms = getClassRooms();
  const newClassRoom: ClassRoom = { ...classRoom, id: Date.now().toString(), createdAt: new Date().toISOString() };
  classRooms.push(newClassRoom);
  saveToStorage('lms_classrooms', classRooms);
  return newClassRoom;
}

export function updateClassRoom(id: string, data: Partial<ClassRoom>): ClassRoom | undefined {
  const classRooms = getClassRooms();
  const index = classRooms.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  classRooms[index] = { ...classRooms[index], ...data };
  saveToStorage('lms_classrooms', classRooms);
  return classRooms[index];
}

export function deleteClassRoom(id: string): boolean {
  const classRooms = getClassRooms();
  const filtered = classRooms.filter((c) => c.id !== id);
  if (filtered.length === classRooms.length) return false;
  saveToStorage('lms_classrooms', filtered);
  return true;
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

export function getUsersByClass(classId: string): User[] {
  return getUsers().filter((u) => u.role === 'siswa' && u.classId === classId && !u.isAlumni);
}

export function getAlumniUsers(): User[] {
  return getUsers().filter((u) => u.role === 'siswa' && u.isAlumni === true);
}

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
  return getMaterials().filter((m) => m.courseId === courseId).sort((a, b) => a.order - b.order);
}

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
  const newEnrollment: Enrollment = { id: Date.now().toString(), siswaId, courseId, enrolledAt: new Date().toISOString(), progress: 0 };
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


// Reading Progress CRUD
export function getReadingProgress(): ReadingProgress[] {
  return getFromStorage('lms_reading_progress', defaultReadingProgress);
}

export function getReadingProgressBySiswa(siswaId: string): ReadingProgress[] {
  return getReadingProgress().filter((r) => r.siswaId === siswaId);
}

export function getReadingProgressBySiswaAndCourse(siswaId: string, courseId: string): ReadingProgress[] {
  return getReadingProgress().filter((r) => r.siswaId === siswaId && r.courseId === courseId);
}

export function markMaterialAsRead(siswaId: string, materialId: string, courseId: string): ReadingProgress {
  const progress = getReadingProgress();
  const existing = progress.find((r) => r.siswaId === siswaId && r.materialId === materialId);
  if (existing) return existing;
  const newProgress: ReadingProgress = {
    id: Date.now().toString(), siswaId, materialId, courseId, completed: true, completedAt: new Date().toISOString()
  };
  progress.push(newProgress);
  saveToStorage('lms_reading_progress', progress);
  return newProgress;
}

export function hasCompletedAllMaterials(siswaId: string, courseId: string): boolean {
  const materials = getMaterialsByCourse(courseId);
  const readProgress = getReadingProgressBySiswaAndCourse(siswaId, courseId);
  return materials.length > 0 && materials.every((m) => readProgress.some((r) => r.materialId === m.id && r.completed));
}


// Assignments CRUD
export function getAssignments(): Assignment[] {
  return getFromStorage('lms_assignments', defaultAssignments);
}

export function getAssignmentsByCourse(courseId: string): Assignment[] {
  return getAssignments().filter((a) => a.courseId === courseId);
}

export function getAssignmentsByGuru(guruId: string): Assignment[] {
  return getAssignments().filter((a) => a.guruId === guruId);
}

export function createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Assignment {
  const assignments = getAssignments();
  const newAssignment: Assignment = { ...assignment, id: Date.now().toString(), createdAt: new Date().toISOString() };
  assignments.push(newAssignment);
  saveToStorage('lms_assignments', assignments);
  return newAssignment;
}

export function updateAssignment(id: string, data: Partial<Assignment>): Assignment | undefined {
  const assignments = getAssignments();
  const index = assignments.findIndex((a) => a.id === id);
  if (index === -1) return undefined;
  assignments[index] = { ...assignments[index], ...data };
  saveToStorage('lms_assignments', assignments);
  return assignments[index];
}

export function deleteAssignment(id: string): boolean {
  const assignments = getAssignments();
  const filtered = assignments.filter((a) => a.id !== id);
  if (filtered.length === assignments.length) return false;
  saveToStorage('lms_assignments', filtered);
  return true;
}


// Assignment Submissions CRUD
export function getAssignmentSubmissions(): AssignmentSubmission[] {
  return getFromStorage('lms_submissions', defaultAssignmentSubmissions);
}

export function getSubmissionsByAssignment(assignmentId: string): AssignmentSubmission[] {
  return getAssignmentSubmissions().filter((s) => s.assignmentId === assignmentId);
}

export function getSubmissionsBySiswa(siswaId: string): AssignmentSubmission[] {
  return getAssignmentSubmissions().filter((s) => s.siswaId === siswaId);
}

export function createSubmission(submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>): AssignmentSubmission {
  const submissions = getAssignmentSubmissions();
  const newSubmission: AssignmentSubmission = { ...submission, id: Date.now().toString(), submittedAt: new Date().toISOString() };
  submissions.push(newSubmission);
  saveToStorage('lms_submissions', submissions);
  return newSubmission;
}

export function gradeSubmission(id: string, grade: number, feedback: string): AssignmentSubmission | undefined {
  const submissions = getAssignmentSubmissions();
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) return undefined;
  submissions[index] = { ...submissions[index], grade, feedback };
  saveToStorage('lms_submissions', submissions);
  return submissions[index];
}

// Class Notes CRUD
export function getClassNotes(): ClassNote[] {
  return getFromStorage('lms_class_notes', defaultClassNotes);
}

export function getClassNotesByClass(classId: string): ClassNote[] {
  return getClassNotes().filter((n) => n.classId === classId);
}

export function getClassNotesByGuru(guruId: string): ClassNote[] {
  return getClassNotes().filter((n) => n.guruId === guruId);
}

export function createClassNote(note: Omit<ClassNote, 'id' | 'createdAt'>): ClassNote {
  const notes = getClassNotes();
  const newNote: ClassNote = { ...note, id: Date.now().toString(), createdAt: new Date().toISOString() };
  notes.push(newNote);
  saveToStorage('lms_class_notes', notes);
  return newNote;
}

export function updateClassNote(id: string, data: Partial<ClassNote>): ClassNote | undefined {
  const notes = getClassNotes();
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return undefined;
  notes[index] = { ...notes[index], ...data };
  saveToStorage('lms_class_notes', notes);
  return notes[index];
}

export function deleteClassNote(id: string): boolean {
  const notes = getClassNotes();
  const filtered = notes.filter((n) => n.id !== id);
  if (filtered.length === notes.length) return false;
  saveToStorage('lms_class_notes', filtered);
  return true;
}



// Class Promotion (Kenaikan Kelas)
export function promoteClass(classId: string): { promoted: number; graduated: number } {
  const classRoom = getClassRoomById(classId);
  if (!classRoom) return { promoted: 0, graduated: 0 };

  const students = getUsersByClass(classId);
  const users = getUsers();
  let promoted = 0;
  let graduated = 0;

  if (classRoom.grade >= 6) {
    // Kelas 6 → Alumni
    students.forEach((student) => {
      const index = users.findIndex((u) => u.id === student.id);
      if (index !== -1) {
        users[index] = { ...users[index], isAlumni: true, classId: classId };
        graduated++;
      }
    });
  } else {
    // Find target class (same section, next grade)
    const classRooms = getClassRooms();
    const targetClass = classRooms.find(
      (c) => c.grade === classRoom.grade + 1 && c.section === classRoom.section
    );

    if (targetClass) {
      students.forEach((student) => {
        const index = users.findIndex((u) => u.id === student.id);
        if (index !== -1) {
          users[index] = { ...users[index], classId: targetClass.id };
          promoted++;
        }
      });
    } else {
      // If no matching class exists, create one
      const newClassName = `Kelas ${classRoom.grade + 1}${classRoom.section}`;
      const newClass = createClassRoom({ name: newClassName, grade: classRoom.grade + 1, section: classRoom.section });
      students.forEach((student) => {
        const index = users.findIndex((u) => u.id === student.id);
        if (index !== -1) {
          users[index] = { ...users[index], classId: newClass.id };
          promoted++;
        }
      });
    }
  }

  saveToStorage('lms_users', users);
  return { promoted, graduated };
}

// Promote all classes at once (kenaikan kelas massal)
export function promoteAllClasses(): { totalPromoted: number; totalGraduated: number } {
  const classRooms = getClassRooms();
  let totalPromoted = 0;
  let totalGraduated = 0;

  // Process from highest grade to lowest to avoid conflicts
  const sortedClasses = [...classRooms].sort((a, b) => b.grade - a.grade);
  
  sortedClasses.forEach((room) => {
    const { promoted, graduated } = promoteClass(room.id);
    totalPromoted += promoted;
    totalGraduated += graduated;
  });

  return { totalPromoted, totalGraduated };
}
