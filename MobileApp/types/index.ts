export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  gpa: number;
  major: string;
  permitType: "green" | "red" | "blue" | null;
}

export interface PDFDocument {
  id: string;
  title: string;
  uploadedAt: Date;
  pageCount: number;
  hasFlashcards: boolean;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  documentId: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  permitType: "green" | "red" | "blue";
  fullness: "low" | "medium" | "high";
  latitude: number;
  longitude: number;
  spots: number;
  availableSpots: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: number;
  lastMessage: string;
  lastMessageTime: Date;
  isStudyRoom: boolean;
  subject?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

export interface ClassInfo {
  id: string;
  name: string;
  location: string;
  building: string;
  room: string;
  time: string;
  professor: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin?: string;
    portfolio?: string;
  };
  education: {
    school: string;
    degree: string;
    major: string;
    gpa: string;
    graduationDate: string;
  };
}


export interface StudyPartner {
  id: string;
  name: string;
  avatar?: string;
  major?: string;
  sharedClasses?: number;
  matchScore?: number;
}

export type ResumeGenerated = {
  header: {
    fullName: string;
    email?: string; // "email • phone"
    phone?: string; // "linkedin • github"
    linkedin?: string;
    github?: string;
  };
  summary?: string;

  education: Array<{
    school: string;
    date?: string;
    degree?: string;
    major?: string;
    gpa?: string; // "GPA: 4.0 • Dean’s List..."
    bullets?: string[];
  }>;

  experience: Array<{
    title: string;
    date?: string;
    companyLine?: string; // "Company, City, ST"
    bullets: string[];
  }>;

  projects?: Array<{
    title: string;
    date?: string;
    bullets: string[];
  }>;

  skills?: Array<{
    category: string; // "Languages", "Frameworks", "Tools"
    items: string;    // "Python, JS, ..."
  }>;
};
