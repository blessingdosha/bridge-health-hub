export const hospitals = [
  { id: "1", name: "Lagos University Teaching Hospital", address: "Idi-Araba, Surulere, Lagos", contact: "+234 801 234 5678", distance: "2.3 km", type: "hospital" as const, equipment: 45 },
  { id: "2", name: "National Hospital Abuja", address: "Central District, Abuja", contact: "+234 802 345 6789", distance: "5.1 km", type: "hospital" as const, equipment: 38 },
  { id: "3", name: "UCH Ibadan", address: "Queen Elizabeth Rd, Ibadan", contact: "+234 803 456 7890", distance: "8.7 km", type: "hospital" as const, equipment: 52 },
  { id: "4", name: "LASUTH Ikeja", address: "Oba Akinjobi Way, Ikeja", contact: "+234 804 567 8901", distance: "3.6 km", type: "hospital" as const, equipment: 29 },
  { id: "5", name: "PathCare Laboratories", address: "Victoria Island, Lagos", contact: "+234 805 678 9012", distance: "1.8 km", type: "lab" as const, equipment: 18 },
  { id: "6", name: "Clina Lancet Laboratories", address: "Ikoyi, Lagos", contact: "+234 806 789 0123", distance: "4.2 km", type: "lab" as const, equipment: 22 },
];

export const equipmentList = [
  { id: "1", name: "MRI Scanner", hospital: "Lagos University Teaching Hospital", quantity: 2, status: "available" as const },
  { id: "2", name: "CT Scanner", hospital: "National Hospital Abuja", quantity: 1, status: "in-use" as const },
  { id: "3", name: "X-Ray Machine", hospital: "UCH Ibadan", quantity: 3, status: "available" as const },
  { id: "4", name: "Ultrasound Machine", hospital: "LASUTH Ikeja", quantity: 4, status: "available" as const },
  { id: "5", name: "Ventilator", hospital: "Lagos University Teaching Hospital", quantity: 6, status: "maintenance" as const },
  { id: "6", name: "Defibrillator", hospital: "National Hospital Abuja", quantity: 2, status: "available" as const },
  { id: "7", name: "ECG Machine", hospital: "PathCare Laboratories", quantity: 3, status: "in-use" as const },
  { id: "8", name: "Dialysis Machine", hospital: "Clina Lancet Laboratories", quantity: 1, status: "available" as const },
];

export const requests = [
  { id: "REQ-001", equipment: "MRI Scanner", from: "LASUTH Ikeja", to: "Lagos University Teaching Hospital", status: "pending" as const, date: "2026-03-28", quantity: 1 },
  { id: "REQ-002", equipment: "Ventilator", from: "National Hospital Abuja", to: "UCH Ibadan", status: "approved" as const, date: "2026-03-27", quantity: 2 },
  { id: "REQ-003", equipment: "CT Scanner", from: "PathCare Laboratories", to: "National Hospital Abuja", status: "rejected" as const, date: "2026-03-26", quantity: 1 },
  { id: "REQ-004", equipment: "Ultrasound Machine", from: "Clina Lancet Laboratories", to: "LASUTH Ikeja", status: "approved" as const, date: "2026-03-25", quantity: 1 },
  { id: "REQ-005", equipment: "Defibrillator", from: "UCH Ibadan", to: "Lagos University Teaching Hospital", status: "pending" as const, date: "2026-03-29", quantity: 3 },
];

export const recommendations = [
  {
    id: "1",
    hospital: "Lagos University Teaching Hospital",
    distance: "2.3 km",
    equipmentAvailable: 45,
    reason: "Closest facility with available MRI scanner and experienced radiology department. High patient satisfaction ratings.",
    matchScore: 96,
  },
  {
    id: "2",
    hospital: "UCH Ibadan",
    distance: "8.7 km",
    equipmentAvailable: 52,
    reason: "Largest equipment inventory in the region. Specializes in cardiac care with 24/7 emergency support.",
    matchScore: 89,
  },
  {
    id: "3",
    hospital: "National Hospital Abuja",
    distance: "5.1 km",
    equipmentAvailable: 38,
    reason: "Government-funded facility with subsidized rates. Recently upgraded diagnostic imaging equipment.",
    matchScore: 82,
  },
];
