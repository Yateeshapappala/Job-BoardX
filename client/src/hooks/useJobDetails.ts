import { useEffect, useState } from 'react';
import axios from 'axios';

export const useJobDetails = (jobId: string | undefined) => {
  const [job, setJob] = useState<any>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobAndCheckApplication = async () => {
      if (!jobId) return;

      try {
        const token = localStorage.getItem('token');

        // Fetch job details first
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
        setJob(jobResponse.data);

        // Then check if the user has applied
        if (token) {
          const appResponse = await axios.get('http://localhost:5000/api/applications/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const hasApplied = appResponse.data.some(
            (app: any) => app.job && app.job._id?.toString() === jobId.toString()
          );

          setIsApplied(hasApplied);
        }
      } catch (err) {
        console.error('Error fetching job or checking application status:', err);
      }
    };

    fetchJobAndCheckApplication();
  }, [jobId]);

  return {
    job,
    isApplied,
    loading,
    setIsApplied,
    setLoading,
  };
};
