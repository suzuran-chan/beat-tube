import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { YouTubeVideo } from "@/lib/youtube-types";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ThumbsUp } from "lucide-react";

interface VideoGridProps {
  videos: YouTubeVideo[];
}

// ヘルパー関数：数値をKやM形式にフォーマット
const formatCount = (count: string | undefined): string => {
  if (!count) return "0";
  const num = parseInt(count);
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

export function VideoGrid({ videos }: VideoGridProps) {
  if (videos.length === 0) {
    return <p>動画が見つかりませんでした。</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => {
        const publishedAt = new Date(video.snippet.publishedAt);
        const relativeTime = formatDistanceToNow(publishedAt, { addSuffix: true, locale: ja });

        return (
          <a
            key={video.id.videoId}
            href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:scale-105 transition-transform duration-200"
          >
            <Card className="flex flex-col h-full">
              <CardHeader className="p-0">
                <div className="aspect-video relative">
                  <Image
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <CardTitle className="text-base font-semibold line-clamp-2">
                  {video.snippet.title}
                </CardTitle>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="w-full flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground truncate">{video.snippet.channelTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">{relativeTime}</p>
                  </div>
                  {video.statistics?.likeCount && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {formatCount(video.statistics.likeCount)}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          </a>
        )
      })}
    </div>
  );
}
