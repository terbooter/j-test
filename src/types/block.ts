const blockTypes = ['idea', 'article', 'checklist'] as const;
const ideaContentTemplates = ['left', 'top', 'bottom', 'text'] as const;

type TBlockType = (typeof blockTypes)[number];

type TIdeaContent = {
  image?: string | null;
  template: (typeof ideaContentTemplates)[number];
  body: string;
};

type TArticleContent = {
  title: string;
  image?: string | null;
  body: string;
};

type TChecklistContentItem = {
  text: string;
  completed: boolean;
};

type TChecklistContent = {
  title: string;
  items: Array<TChecklistContentItem>;
};

type TBlockContentType = TIdeaContent | TArticleContent | TChecklistContent;

export { blockTypes, ideaContentTemplates };
export type {
  TArticleContent,
  TBlockContentType,
  TBlockType,
  TChecklistContent,
  TIdeaContent,
};
