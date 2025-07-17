// src\hooks\useTeams.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamsApi } from '../api/apis/teams-api';
import { TeamMembership } from '../api/models/team-membership';
import { TeamInvitation } from '../api/models/team-invitation';
import { Team } from '../api/models/team';
import customAxios from "../lib/customAxios";

const teamsApi = new TeamsApi(undefined, undefined, customAxios);

// Team CRUD operations
// Only list teams where the user is a member
export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await teamsApi.teamsList();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (team: Omit<Team, 'id'>) => teamsApi.teamsCreate(team as Team),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...team }: Team) => {
      if (id === undefined) {
        throw new Error("Team ID is required for update");
      }
      // Use teamsPartialUpdate for PATCH with data
      return teamsApi.teamsPartialUpdate(id.toString(), { data: team });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.id] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teamsApi.teamsDelete(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

// Team Members operations
export function useTeamMembers(teamId: number) {
  return useQuery<TeamMembership[]>({
    queryKey: ['teams', teamId, 'members'],
    queryFn: async () => {
      const response = await teamsApi.teamsMembersList(teamId.toString());
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeamMemberDetails(teamId: number, memberId: number) {
  return useQuery<TeamMembership>({
    queryKey: ['teams', teamId, 'members', memberId],
    queryFn: async () => {
      const response = await teamsApi.teamsMembersRead(teamId.toString(), memberId.toString());
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, ...data }: { teamId: number } & TeamMembership) => {
      return teamsApi.teamsMembersCreate(teamId.toString(), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, id, ...data }: { teamId: number, id: number } & TeamMembership) => {
      return teamsApi.teamsMembersUpdate(teamId.toString(), id.toString(), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members', variables.id] });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, id }: { teamId: number, id: number }) => {
      return teamsApi.teamsMembersDelete(teamId.toString(), id.toString());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
    },
  });
}

export function useUserMembershipDetails(teamId: number, memberId: number) {
  return useQuery<TeamMembership>({
    queryKey: ['memberships', memberId],
    queryFn: async () => {
      const response = await teamsApi.teamsMembersRead(teamId.toString(), memberId.toString());
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateUserMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, id, ...data }: { teamId: number, id: number } & TeamMembership) => {
      return teamsApi.teamsMembersUpdate(teamId.toString(), id.toString(), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members', variables.id] });
    },
  });
}

export function useLeaveTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, id }: { teamId: number, id: number }) => {
      return teamsApi.teamsMembersDelete(teamId.toString(), id.toString());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
    },
  });
}

// Team Invitations operations
export function useTeamInvitations(teamId: number) {
  return useQuery<TeamInvitation[]>({
    queryKey: ['teams', teamId, 'invitations'],
    queryFn: async () => {
      const response = await teamsApi.teamsInvitationsList(teamId.toString());
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTeamInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, ...data }: { teamId: number } & TeamInvitation) => {
      return teamsApi.teamsInvitationsCreate(teamId.toString(), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'invitations'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
    },
  });
}

export function useUpdateTeamInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, id, ...data }: { teamId: number, id: number } & TeamInvitation) => {
      return teamsApi.teamsInvitationsUpdate(teamId.toString(), id.toString(), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'invitations'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'invitations', variables.id] });
    },
  });
}

export function usePartialUpdateTeamInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, id, ...data }: { teamId: number, id: number } & TeamInvitation) => {
      return teamsApi.teamsInvitationsPartialUpdate(teamId.toString(), id.toString(), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'invitations'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'invitations', variables.id] });
    },
  });
}

export function useDeleteTeamInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, id }: { teamId: number, id: number }) => {
      return teamsApi.teamsInvitationsDelete(teamId.toString(), id.toString());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId, 'invitations'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] });
    },
  });
}

export function useTeamInvitationDetails(teamId: number, id: number) {
  return useQuery<TeamInvitation>({
    queryKey: ['teams', teamId, 'invitations', id],
    queryFn: async () => {
      const response = await teamsApi.teamsInvitationsRead(teamId.toString(), id.toString());
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}