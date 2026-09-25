import Swal from "sweetalert2";

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function sortAnalysesOldestFirst(items) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function showAlert(title, text, icon) {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    text,
    showConfirmButton: false,
    timer: 4500,
    timerProgressBar: true,
    heightAuto: false,
    customClass: {
      popup: 'swal2-toast'
    }
  });
}