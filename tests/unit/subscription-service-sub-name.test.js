import { describe, expect, it, vi, afterEach } from 'vitest';
import { generateCombinedNodeList } from '../../functions/services/subscription-service.js';

const nodeLine = 'ss://YWVzLTEyOC1nY206cGFzcw@1.2.3.4:8388#HK节点';

const makeStorage = () => ({
  get: async () => null,
  put: async () => {},
  list: async () => ({ keys: [] })
});

const makeConfig = () => ({
  defaultOperators: [
    {
      type: 'rename',
      enabled: true,
      params: { template: { enabled: true, template: '{sub} - {server}:{port}' } }
    }
  ],
  defaultPrefixSettings: {
    enableManualNodes: true,
    enableSubscriptions: true,
    manualNodePrefix: '手动节点',
    subscriptionPrefix: '',
    prependGroupName: false
  },
  enableFlagEmoji: false,
  enableTrafficNode: false,
  UpdateInterval: 86400
});

describe('generateCombinedNodeList {sub} integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renames nodes with their source subscription name instead of the profile name', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(Buffer.from(nodeLine, 'utf-8').toString('base64')));

    const misubs = [{ id: 'a', name: '机场A', url: 'https://a.example.com/sub', enabled: true }];
    const context = { storage: makeStorage(), waitUntil: () => {} };

    const result = await generateCombinedNodeList(
      context,
      makeConfig(),
      'v2rayN/7.23',
      misubs,
      '',
      { name: '汇聚订阅', enableSubscriptions: true, enableManualNodes: true }
    );

    expect(decodeURIComponent(result)).toContain('#机场A - 1.2.3.4:8388');
  });
});
