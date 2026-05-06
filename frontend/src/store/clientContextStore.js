import { create } from "zustand";

const KEY = "sms_selected_student_id";

function loadSelectedStudentId() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

function saveSelectedStudentId(value) {
  try {
    if (!value) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  } catch {
    // ignore
  }
}

export const useClientContextStore = create((set) => ({
  selectedStudentId: loadSelectedStudentId(),
  setSelectedStudentId: (id) => {
    const value = String(id || "");
    saveSelectedStudentId(value);
    set({ selectedStudentId: value });
  },
}));

