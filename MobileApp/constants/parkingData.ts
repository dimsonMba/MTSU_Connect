export type PermitType =
  | "student"
  | "facultyStaff"
  | "handicap"
  | "maintenance";

export interface ParkingLot {
  id: string;
  name: string;
  permitType: PermitType;
  latitude: number;
  longitude: number;
  spaces: number;
  available: number;
  description: string;
}

export const MTSU_CENTER = {
  latitude: 35.8489,
  longitude: -86.369,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export const PARKING_LOTS: ParkingLot[] = [
  {
    id: "greenland",
    name: "Greenland Lot",
    permitType: "student",
    latitude: 35.852,
    longitude: -86.365,
    spaces: 450,
    available: 127,
    description: "Large student parking area near Greenland Drive",
  },
  {
    id: "rutherford",
    name: "Rutherford Lot",
    permitType: "student",
    latitude: 35.8475,
    longitude: -86.372,
    spaces: 380,
    available: 89,
    description: "Student parking on Rutherford Boulevard",
  },
  {
    id: "bragg",
    name: "Bragg Lot",
    permitType: "student",
    latitude: 35.851,
    longitude: -86.371,
    spaces: 520,
    available: 203,
    description: "Popular student lot near Mass Comm building",
  },
  {
    id: "honors",
    name: "Honors Lot",
    permitType: "facultyStaff",
    latitude: 35.8485,
    longitude: -86.3665,
    spaces: 120,
    available: 34,
    description: "Faculty/Staff parking near Honors College",
  },
  {
    id: "davis-science",
    name: "Davis Science Lot",
    permitType: "facultyStaff",
    latitude: 35.8465,
    longitude: -86.368,
    spaces: 95,
    available: 22,
    description: "Faculty/Staff lot by Science Building",
  },
  {
    id: "handicap-central",
    name: "Central Accessible",
    permitType: "handicap",
    latitude: 35.849,
    longitude: -86.3685,
    spaces: 25,
    available: 8,
    description: "Accessible parking near student center",
  },
  {
    id: "handicap-library",
    name: "Library Accessible",
    permitType: "handicap",
    latitude: 35.8478,
    longitude: -86.3695,
    spaces: 15,
    available: 5,
    description: "Accessible spaces near Walker Library",
  },
  {
    id: "maintenance-north",
    name: "Maintenance North",
    permitType: "maintenance",
    latitude: 35.853,
    longitude: -86.3675,
    spaces: 30,
    available: 12,
    description: "Service vehicles only - Restricted",
  },
  {
    id: "maintenance-south",
    name: "Maintenance South",
    permitType: "maintenance",
    latitude: 35.8455,
    longitude: -86.37,
    spaces: 25,
    available: 9,
    description: "Service vehicles only - Restricted",
  },
];

export const PERMIT_LABELS: Record<PermitType, string> = {
  student: "Student",
  facultyStaff: "Faculty/Staff",
  handicap: "Accessible",
  maintenance: "Service",
};

export const PERMIT_COLORS: Record<PermitType, string> = {
  student: "#22C55E",
  facultyStaff: "#FFFFFF",
  handicap: "#3B82F6",
  maintenance: "#EAB308",
};
