import {
  User,
  PDFDocument,
  Flashcard,
  ParkingLot,
  ChatRoom,
  ClassInfo,
  StudyPartner,
} from "@/types";

export const mockUser: User = {
  id: "1",
  name: "Jordan Mitchell",
  email: "jm2k@mtmail.mtsu.edu",
  gpa: 3.75,
  major: "Computer Science",
  permitType: "blue",
};

export const mockPDFs: PDFDocument[] = [
  {
    id: "1",
    title: "Data Structures Notes",
    uploadedAt: new Date("2024-01-15"),
    pageCount: 45,
    hasFlashcards: true,
  },
  {
    id: "2",
    title: "Calculus II Study Guide",
    uploadedAt: new Date("2024-01-20"),
    pageCount: 32,
    hasFlashcards: false,
  },
  {
    id: "3",
    title: "Psychology 101 Textbook",
    uploadedAt: new Date("2024-01-22"),
    pageCount: 128,
    hasFlashcards: true,
  },
  {
    id: "4",
    title: "Organic Chemistry Ch 5-8",
    uploadedAt: new Date("2024-01-25"),
    pageCount: 67,
    hasFlashcards: false,
  },
];

export const mockFlashcards: Flashcard[] = [
  {
    id: "1",
    question: "What is the time complexity of binary search?",
    answer: "O(log n)",
    documentId: "1",
  },
  {
    id: "2",
    question: "Define a hash table",
    answer:
      "A data structure that implements an associative array, mapping keys to values using a hash function",
    documentId: "1",
  },
  {
    id: "3",
    question: "What is the difference between a stack and a queue?",
    answer:
      "Stack is LIFO (Last In, First Out), Queue is FIFO (First In, First Out)",
    documentId: "1",
  },
  {
    id: "4",
    question: "What is Big O notation?",
    answer:
      "A mathematical notation describing the upper bound of algorithm complexity",
    documentId: "1",
  },
  {
    id: "5",
    question: "Define recursion",
    answer:
      "A function that calls itself to solve smaller instances of the same problem",
    documentId: "1",
  },
];

export const mockParkingLots: ParkingLot[] = [
  {
    id: "1",
    name: "Greenland Drive Lot",
    permitType: "green",
    fullness: "high",
    latitude: 35.8497,
    longitude: -86.3684,
    spots: 450,
    availableSpots: 23,
  },
  {
    id: "2",
    name: "Mass Comm Lot",
    permitType: "blue",
    fullness: "medium",
    latitude: 35.8512,
    longitude: -86.3701,
    spots: 320,
    availableSpots: 89,
  },
  {
    id: "3",
    name: "Recreation Center",
    permitType: "red",
    fullness: "low",
    latitude: 35.8478,
    longitude: -86.3656,
    spots: 280,
    availableSpots: 156,
  },
  {
    id: "4",
    name: "Floyd Stadium",
    permitType: "green",
    fullness: "low",
    latitude: 35.8465,
    longitude: -86.3712,
    spots: 800,
    availableSpots: 534,
  },
  {
    id: "5",
    name: "Library Lot",
    permitType: "blue",
    fullness: "high",
    latitude: 35.8501,
    longitude: -86.3678,
    spots: 200,
    availableSpots: 12,
  },
];

export const mockChatRooms: ChatRoom[] = [
  {
    id: "1",
    name: "CS 2336 Study Group",
    participants: 8,
    lastMessage: "Anyone understand the BST problem?",
    lastMessageTime: new Date(),
    isStudyRoom: true,
    subject: "Data Structures",
  },
  {
    id: "2",
    name: "CALC II Finals Prep",
    participants: 12,
    lastMessage: "Meeting at library 6pm",
    lastMessageTime: new Date(),
    isStudyRoom: true,
    subject: "Calculus",
  },
  {
    id: "3",
    name: "Senior Project Team",
    participants: 4,
    lastMessage: "Updated the repo",
    lastMessageTime: new Date(),
    isStudyRoom: false,
  },
  {
    id: "4",
    name: "Bio Lab Partners",
    participants: 3,
    lastMessage: "Don't forget the lab report!",
    lastMessageTime: new Date(),
    isStudyRoom: true,
    subject: "Biology",
  },
];

export const mockNextClass: ClassInfo = {
  id: "1",
  name: "Data Structures",
  location: "KOM 320",
  building: "Kirksey Old Main",
  room: "320",
  time: "2:00 PM",
  professor: "Dr. Smith",
};

export const mockStudyPartners: StudyPartner[] = [
  {
    id: "1",
    name: "Alex Chen",
    major: "Computer Science",
    sharedClasses: 3,
    matchScore: 92,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    major: "Computer Science",
    sharedClasses: 2,
    matchScore: 85,
  },
  {
    id: "3",
    name: "Mike Williams",
    major: "Information Systems",
    sharedClasses: 2,
    matchScore: 78,
  },
];
