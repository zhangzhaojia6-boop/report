import type { PublisherAdapter, PublishInput, PublishResult } from "../types";
import { publisherRegistry } from "../registry";

// 真实平台一个一个接：x / youtube / tiktok / douyin / bilibili / xhs / weixin_channel / instagram
function makeMock(name: any): PublisherAdapter {
  return {
    name,
    async publish(input: PublishInput): Promise<PublishResult> {
      return {
        platform: input.platform,
        account: input.account,
        remoteId: `mock_${name}_${Date.now()}`,
        url: `https://example.com/${name}/${Date.now()}`
      };
    },
    async fetchMetrics() {
      return { views: 0, likes: 0, comments: 0, shares: 0 };
    },
    async replyComment() { /* no-op */ }
  };
}

["x", "youtube", "tiktok", "douyin", "bilibili", "xhs", "weixin_channel", "instagram"].forEach((p) => {
  publisherRegistry.register(makeMock(p));
});
