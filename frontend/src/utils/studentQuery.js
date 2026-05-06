export function withStudentId(path, studentId) {
  if (!studentId) return path;
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}studentId=${encodeURIComponent(studentId)}`;
}

