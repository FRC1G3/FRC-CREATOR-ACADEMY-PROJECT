import { z } from "zod";
import { validImageSource } from "./image-source";

const count = z.string().regex(/^\d{1,19}$/).refine(value => BigInt(value) <= BigInt("9223372036854775807")).optional();
const thumbnail = z.object({ url: z.string().max(2000).refine(value => value.startsWith("https://") && Boolean(validImageSource(value))) }).optional();
const channelSchema = z.object({
  id: z.string().regex(/^UC[\w-]{22}$/),
  snippet: z.object({ title: z.string().trim().min(1).max(500), customUrl: z.string().max(300).optional(), thumbnails: z.object({ default: thumbnail, medium: thumbnail, high: thumbnail }).optional() }),
  statistics: z.object({ subscriberCount: count, hiddenSubscriberCount: z.boolean().optional(), videoCount: count, viewCount: count }),
});
export const channelResponseSchema = z.object({ items: z.array(channelSchema).max(50), nextPageToken: z.string().optional() });
export type YouTubeChannelData = {
  channelId: string; channelTitle: string; thumbnailUrl: string | null; customUrl: string | null;
  subscriberCount: string | null; videoCount: string | null; viewCount: string | null; hiddenSubscriberCount: boolean;
};
export type ConnectedChannel = YouTubeChannelData & { connectedAt: string; lastSyncedAt: string | null };
export function parseChannels(value: unknown): YouTubeChannelData[] {
  const result = channelResponseSchema.parse(value);
  if (result.nextPageToken) throw new Error("Authorize a specific channel.");
  return result.items.map(channel => ({
    channelId: channel.id, channelTitle: channel.snippet.title,
    customUrl: channel.snippet.customUrl ?? null,
    thumbnailUrl: (channel.snippet.thumbnails?.high ?? channel.snippet.thumbnails?.medium ?? channel.snippet.thumbnails?.default)?.url ?? null,
    hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount ?? false,
    subscriberCount: channel.statistics.hiddenSubscriberCount ? null : channel.statistics.subscriberCount ?? null,
    videoCount: channel.statistics.videoCount ?? null, viewCount: channel.statistics.viewCount ?? null,
  }));
}
export function channelUrl(id: string) { return `https://www.youtube.com/channel/${encodeURIComponent(id)}`; }
export function channelCount(value: string | null) {
  return value === null ? "Unavailable" : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(BigInt(value));
}
