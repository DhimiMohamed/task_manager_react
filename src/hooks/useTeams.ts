// src/hooks/useTeams.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamsApi } from '../api/apis/teams-api';
import { TeamMembership } from '../api/models/team-membership';
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

export function useTeamDetails(id: number) {
  return useQuery<Team>({
    queryKey: ['teams', id],
    queryFn: async () => {
      const response = await teamsApi.teamsRead(id.toString());
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
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
      return teamsApi.teamsUpdate(id.toString(), team);
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

// Membership-specific operations (for the current user)
export function useUserMembershipDetails(membershipId: number) {
  return useQuery<TeamMembership>({
    queryKey: ['memberships', membershipId],
    queryFn: async () => {
      const response = await teamsApi.teamsMembershipsRead(membershipId.toString());
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateUserMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & TeamMembership) => {
      return teamsApi.teamsMembershipsUpdate(id.toString(), data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships', variables.id] });
      // Also invalidate any team member queries that might include this membership
      queryClient.invalidateQueries({ queryKey: ['teams', variables.team, 'members'] });
    },
  });
}

export function useLeaveTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: number) => {
      return teamsApi.teamsMembershipsDelete(membershipId.toString());
    },
    onSuccess: (_, ) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}