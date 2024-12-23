export const PAGES: { name: string; link: string }[] = [
  { name: "Posts", link: "/posts" },
  { name: "Templates", link: "/templates" },
];

export const PROFILE_PHOTOS = [0, 1, 2];

export const LANGUAGES = {
  c: "C",
  cpp: "C++",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
  "c#": "C#",
  ruby: "Ruby",
  bash: "Bash",
  perl: "Perl",
  php: "PHP",
};
export interface PostFormat {
  contentID: number;
  title: string;
  description: string;
  creationTime: string;
  authorUsername: string;
  authorID: number;
  upvotes: number;
  downvotes: number;
  reports?: number;
  tags: string[];
  comment_counts: number;
  isHidden?: boolean;
  postID: number;
}

export interface TemplateFormat {
  title: string;
  explanation: string;
  language: string;
  creationTime: string;
  id: string;
  tags: string[];
  author?: {
    username: string;
  };
  forkID: number | null;
}

export interface Template {
  id: number;
  code: string;
  title: string;
  explanation: string;
  language: string;
  authorID: number;
  forkID: number | null;
  tags: string[];
  author: {
    username: string;
  };
}

export interface CommentFormat {
  commentID: number;
  contentID: number;
  text: string;
  creationTime: string;
  authorUsername: string;
  isHidden: boolean;
  upvotes: number;
  downvotes: number;
  postID: number;
  reply_counts: number;
  replies: CommentFormat[];
  reports?: ReportFormat[]; // This might need to change
  report_counts?: number;
}

export interface PostFiltersFormat {
  title?: string;
  content?: string;
  tags?: string[];
  templates?: string[];
  showHidden?: boolean;
}

export interface ReportFormat {
  reporterUsername: string;
  reason: string;
}
