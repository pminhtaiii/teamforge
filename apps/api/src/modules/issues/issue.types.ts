export type IssueStatus = | "todo" | "in_progress" | "done";

export interface Issue {
    id: string;
    title: string;
    description: string | null;
    status: IssueStatus;
    createdAt: Date;
}

export interface CreateIssueInput {
    title: string;
    description?: string;
}