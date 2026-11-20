export type IssueStatus = | "todo" | "in_progress" | "done";

export interface Issue {
    id: string;
    title: string;
    description: string | null;
    status: IssueStatus;
    createdAt: Date;
}

export type CreateIssueInput = Pick<Issue, "title" | "description">