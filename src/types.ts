export type ContentCategory = 'artikel' | 'materi' | 'berita' | 'arsip' | 'info_komunitas';

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  category: ContentCategory;
  image_url: string | null;
  likes: number;
  views: number;
  created_at: string;
}

export interface CommentItem {
  id: string;
  content_id: string;
  author: string;
  comment_text: string;
  created_at: string;
}
