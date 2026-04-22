export const ViewMode = {
  KANBAN: "kanban",
  LIST: "list",
} as const;

export type ViewModeType = (typeof ViewMode)[keyof typeof ViewMode];
