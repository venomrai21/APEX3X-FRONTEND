import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Eye, MousePointer, Target, MapPin, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { MarketingOverview } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export const MarketingView: React.FC = () => {
  const { setConnectDrawerOpen, refreshKey } = useApp();
  const [data, setData] = useState<MarketingOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketing = async () => {
    try {
      setLoading(true);
      const res = await api.getMarketingOverview();
      setData(res);
    } catch (err) {
      console.error('Failed fetching marketing overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketing();
  }, [refreshKey]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const { googleAds, metaAds, googleBusinessProfile, channelAttribution } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif-display font-bold text-zinc-100">
              Growth & Ad Intelligence
            </h2>
            <Badge variant="gold" size="sm">
              Cross-Channel Attribution
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time ROAS evaluation across connected Google Ads, Meta Ads, and Google Business Profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setConnectDrawerOpen(true)}
          >
            Manage Ad Credentials
          </Button>
        </div>
      </div>

      {/* Primary Ad Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Google Ads Card */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Google Search Ads</h3>
            </div>
            <Badge variant="emerald" size="sm">
              Connected
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#07070b] border border-white/[0.05]">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Monthly Spend</span>
              <div className="text-base font-mono font-bold text-zinc-200 mt-0.5">
                ${googleAds.monthlySpend.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Conversions</span>
              <div className="text-base font-mono font-bold text-amber-300 mt-0.5">
                {googleAds.conversions} Leads
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-zinc-300">Campaign Health</span>
            {googleAds.campaigns.map((camp, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                  camp.status === 'leaking'
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-[#0a0a10] border-white/[0.06]'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-medium text-zinc-200 truncate">{camp.name}</p>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Spend: ${camp.spend.toLocaleString()} &middot; ROAS: {camp.roas}x
                  </span>
                </div>
                {camp.status === 'leaking' ? (
                  <Badge variant="rose" size="sm">
                    Leak: $0 Return
                  </Badge>
                ) : (
                  <Badge variant="emerald" size="sm">
                    {camp.conversions} conv
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Meta Ads Card */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Meta B2B Ads</h3>
            </div>
            <Badge variant="emerald" size="sm">
              Connected
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#07070b] border border-white/[0.05]">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Monthly Spend</span>
              <div className="text-base font-mono font-bold text-zinc-200 mt-0.5">
                ${metaAds.monthlySpend.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Leads Generated</span>
              <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                {metaAds.leadsGenerated} Leads
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0a0a10] border border-white/[0.06] space-y-1.5 text-xs">
            <div className="text-zinc-400">Cost Per Lead (CPL):</div>
            <div className="text-sm font-mono font-bold text-zinc-100">
              ${metaAds.costPerLead.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-500 pt-1">
              Top Creative: <span className="text-zinc-300">{metaAds.topCreative}</span>
            </div>
          </div>
        </Card>

        {/* Google Business Profile */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Google Business Profile</h3>
            </div>
            <Badge variant="emerald" size="sm">
              Verified
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#07070b] border border-white/[0.05]">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Search Views</span>
              <div className="text-base font-mono font-bold text-zinc-200 mt-0.5">
                {googleBusinessProfile.searchViews.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Direct Calls</span>
              <div className="text-base font-mono font-bold text-amber-300 mt-0.5">
                {googleBusinessProfile.directCalls} Calls
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0a0a10] border border-white/[0.06] flex items-center justify-between text-xs">
            <div>
              <div className="text-xs font-medium text-zinc-200">{googleBusinessProfile.locationName}</div>
              <div className="flex items-center gap-1 text-amber-400 text-[11px] mt-0.5">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{googleBusinessProfile.rating} Rating ({googleBusinessProfile.reviewsCount} verified reviews)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Multi-channel Revenue Attribution Table */}
      <Card variant="elevated" padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-white/[0.08] bg-[#09090d] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Closed-Loop Multi-Channel Revenue Attribution
          </h3>
          <span className="text-xs text-zinc-500">Connected to CRM contracts</span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {channelAttribution.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
              <div>
                <span className="text-sm font-semibold text-zinc-100">{item.channel}</span>
                <div className="text-xs text-zinc-500 mt-0.5 font-mono">
                  Monthly Spend: ${item.spend.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-8 text-right">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Attributed Revenue</span>
                  <div className="text-sm font-mono font-bold text-amber-300">
                    ${item.revenue.toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">ROAS</span>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    {item.roas}x
                  </div>
                </div>

                <Badge variant={item.leakRisk === 'medium' ? 'amber' : 'emerald'} size="sm">
                  {item.leakRisk === 'medium' ? 'Auditing ROAS' : 'Healthy Velocity'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
