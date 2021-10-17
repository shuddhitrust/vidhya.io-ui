export type unreadCountType = {
  announcements: number;
  assignments: number;
};

export interface DashboardStateModel {
  unreadAnnouncements: number;
  unreadAssignments: number;
}

export const defaultDashboardState: DashboardStateModel = {
  unreadAnnouncements: null,
  unreadAssignments: null,
};
