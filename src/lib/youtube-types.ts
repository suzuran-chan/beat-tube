import { z } from "zod";

// YouTube APIの検索結果アイテムのスキーマ
export const YouTubeSearchItemSchema = z.object({
  id: z.object({
    kind: z.string(),
    videoId: z.string(),
  }),
  snippet: z.object({
    publishedAt: z.string(),
    channelId: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnails: z.object({
      default: z.object({ url: z.string(), width: z.number(), height: z.number() }),
      medium: z.object({ url: z.string(), width: z.number(), height: z.number() }),
      high: z.object({ url: z.string(), width: z.number(), height: z.number() }),
    }),
    channelTitle: z.string(),
  }),
});

// YouTube APIの検索結果全体のスキーマ
export const YouTubeSearchResponseSchema = z.object({
  nextPageToken: z.string().optional(),
  prevPageToken: z.string().optional(),
  pageInfo: z.object({
    totalResults: z.number(),
    resultsPerPage: z.number(),
  }),
  items: z.array(YouTubeSearchItemSchema),
});

// YouTube APIの動画統計情報のスキーマ
export const YouTubeVideoStatisticsSchema = z.object({
  viewCount: z.string().optional(),
  likeCount: z.string().optional(),
  favoriteCount: z.string().optional(),
  commentCount: z.string().optional(),
});

// YouTube APIの動画リストアイテムのスキーマ (statisticsを含む)
export const YouTubeVideoItemSchema = z.object({
  id: z.string(), // videos endpoint returns just the video ID as a string
  statistics: YouTubeVideoStatisticsSchema,
});

// YouTube APIの動画リスト全体のスキーマ
export const YouTubeVideoListResponseSchema = z.object({
  items: z.array(YouTubeVideoItemSchema),
});

// スキーマからTypeScriptの型を生成
export type YouTubeVideo = z.infer<typeof YouTubeSearchItemSchema> & {
  statistics?: z.infer<typeof YouTubeVideoStatisticsSchema>;
};