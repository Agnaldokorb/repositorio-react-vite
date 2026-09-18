import { useEffect, useState } from "react";
import { getProjects } from "@/services/projectsService";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      try {
        const data = await getProjects(controller.signal);

        if (!controller.signal.aborted) {
          setProjects(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "Não foi possível carregar os projetos. Atualize a página para tentar novamente.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      controller.abort();
    };
  }, []);

  return { projects, loading, error };
}