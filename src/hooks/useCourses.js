import { useEffect, useState } from "react";
import { getCourses } from "@/services/coursesService";

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      try {
        const data = await getCourses(controller.signal);

        if (!controller.signal.aborted) {
          setCourses(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "Não foi possível carregar minha formação. Tente novamente mais tarde.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadCourses();

    return () => {
      controller.abort();
    };
  }, []);

  return { courses, loading, error };
}
