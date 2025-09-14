"use server";

import { YouTubeSearchResponseSchema, YouTubeVideo, YouTubeVideoListResponseSchema } from "./youtube-types";

interface SearchResult {
  videos: YouTubeVideo[] | null;
  nextPageToken: string | null;
  error: string | null;
}

/**
 * YouTube APIを叩いて動画を検索する関数
 * @param type 通常動画 or ショート動画
 * @param pageToken 次のページを取得するためのトークン
 * @returns 検索結果またはエラー情報
 */
export async function searchVideos(
  type: "normal" | "shorts" = "normal",
  pageToken?: string
): Promise<SearchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    const error = "YouTube APIキーが設定されていません。.env.localファイルを確認してください。";
    console.error(error);
    return { videos: null, nextPageToken: null, error };
  }

  const query = type === "shorts" ? "Beat Saber #shorts" : "Beat Saber";
  const maxResults = 20;
  let searchEndpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`;

  if (pageToken) {
    searchEndpoint += `&pageToken=${pageToken}`;
  }

  try {
    // 1. 検索APIを呼び出し、動画IDのリストを取得
    const searchRes = await fetch(searchEndpoint);
    const searchData = await searchRes.json();

    if (searchData.error) {
      const errorMessage = searchData.error.message || "不明なAPIエラー";
      console.error("YouTube Search API Error:", errorMessage);
      return { videos: null, nextPageToken: null, error: `APIエラー: ${errorMessage}` };
    }

    const parsedSearch = YouTubeSearchResponseSchema.safeParse(searchData);

    if (!parsedSearch.success) {
      console.error("Failed to parse YouTube Search API response:", parsedSearch.error.format());
      return { videos: null, nextPageToken: null, error: "検索APIレスポンスの形式が不正です。" };
    }

    // 検索結果から動画以外のもの（チャンネルなど）を除外する
    const videoItems = parsedSearch.data.items.filter((item: any) => item.id && item.id.kind === 'youtube#video' && item.id.videoId);

    if (videoItems.length === 0) {
      return { videos: [], nextPageToken: null, error: null };
    }

    // 2. 取得した動画IDを使って、動画統計情報を取得
    const videoIds = videoItems.map(item => item.id.videoId).join(',');
    const videosEndpoint = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`;

    const videosRes = await fetch(videosEndpoint);
    const videosData = await videosRes.json();

    if (videosData.error) {
      const errorMessage = videosData.error.message || "不明なAPIエラー";
      console.error("YouTube Videos API Error:", errorMessage);
      return { videos: null, nextPageToken: null, error: `APIエラー: ${errorMessage}` };
    }

    const parsedVideos = YouTubeVideoListResponseSchema.safeParse(videosData);

    if (!parsedVideos.success) {
      console.error("Failed to parse YouTube Videos API response:", parsedVideos.error.format());
      return { videos: null, nextPageToken: null, error: "動画統計APIレスポンスの形式が不正です。" };
    }

    // 3. 検索結果と統計情報をマージ
    const videosWithStats: YouTubeVideo[] = videoItems.map(searchItem => {
      const stats = parsedVideos.data.items.find(videoItem => videoItem.id === searchItem.id.videoId);
      return {
        ...searchItem,
        statistics: stats?.statistics,
      };
    });

    return { 
      videos: videosWithStats,
      nextPageToken: parsedSearch.data.nextPageToken || null,
      error: null 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました。";
    console.error("An error occurred while fetching YouTube videos:", errorMessage);
    return { videos: null, nextPageToken: null, error: errorMessage };
  }
}