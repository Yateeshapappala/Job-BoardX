
import axiosInstance from './axiosInstance';

export const getJobs = async () => {
  const response = await axiosInstance.get('/api/jobs');
  return response.data;
};

export const getJobById = async (id: string) => {
  const response = await axiosInstance.get(`/api/jobs/${id}`);
  return response.data;
};
