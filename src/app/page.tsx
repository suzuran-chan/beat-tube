'use client';

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { searchVideos } from "@/lib/youtube";
import { YouTubeVideo } from "@/lib/youtube-types";
import { VideoGrid } from "@/components/VideoGrid";

export default function Home() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [videoType, setVideoType] = useState<"normal" | "shorts">("normal");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async (type: "normal" | "shorts", pageToken?: string) => {
    // 新規読み込みか、追加読み込みかでローディング状態を分ける
    if (pageToken) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setVideos([]); // 新規読み込み時は動画リストをリセット
    }
    setError(null);
    
    const result = await searchVideos(type, pageToken);

    if (result.error) {
      setError(result.error);
      setVideos([]);
    } else {
      // 既存のリストに新しい動画を追加する
      setVideos(prevVideos => [...prevVideos, ...(result.videos || [])]);
      setNextPageToken(result.nextPageToken || null);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  // 初回読み込みとタブ切り替え時のデータ取得
  useEffect(() => {
    fetchVideos(videoType);
  }, [videoType, fetchVideos]);

  const handleTabChange = (value: string) => {
    setVideoType(value as "normal" | "shorts");
  };

  const handleLoadMore = () => {
    if (nextPageToken) {
      fetchVideos(videoType, nextPageToken);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center">読み込み中...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500">エラー: {error}</p>;
    }
    return (
      <>
        <VideoGrid videos={videos} />
        {nextPageToken && (
          <div className="flex justify-center mt-8">
            <Button onClick={handleLoadMore} disabled={isLoadingMore}>
              {isLoadingMore ? "読み込み中..." : "さらに読み込む"}
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <main className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center">Beat Tube</h1>
        <p className="text-muted-foreground text-center mt-2">
          A Beat Saber video explorer.
        </p>
      </header>

      <Tabs defaultValue="normal" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="normal">通常動画</TabsTrigger>
          <TabsTrigger value="shorts">ショート動画</TabsTrigger>
        </TabsList>
        <TabsContent value="normal" className="mt-4">{renderContent()}</TabsContent>
        <TabsContent value="shorts" className="mt-4">{renderContent()}</TabsContent>
      </Tabs>
    </main>
  );
}
