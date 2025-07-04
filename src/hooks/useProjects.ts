// src/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectsApi } from '../api/apis/projects-api';
import { Project, ProjectStatusEnum } from '../api/models/project';
import customAxios from "../lib/customAxios";

const projectsApi = new ProjectsApi(undefined, undefined, customAxios);

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.projectsList();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTeamProjects(teamId: number) {
  return useQuery<Project[]>({
    queryKey: ['projects', 'team', teamId],
    queryFn: async () => {
      const response = await projectsApi.projectsTeamsProjectsList(teamId.toString());
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useProjectDetails(id: number) {
  return useQuery<Project>({
    queryKey: ['projects', id],
    queryFn: async () => {
      const response = await projectsApi.projectsRead(id.toString());
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (project: Omit<Project, 'id'>) => projectsApi.projectsCreate(project as Project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...project }: Project) => {
      if (id === undefined) {
        throw new Error("Project ID is required for update");
      }
      return projectsApi.projectsUpdate(id.toString(), project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.projectsDelete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useProjectsByStatus(status: ProjectStatusEnum) {
  return useQuery<Project[]>({
    queryKey: ['projects', status],
    queryFn: async () => {
      const response = await projectsApi.projectsList();
      return response.data.filter(project => project.status === status);
    },
    staleTime: 1000 * 60 * 5,
  });
}