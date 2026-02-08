'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats, getReplies, DashboardStats, Reply } from '@/lib/data'
import { StatCard } from '@/components/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, TrendingUp, Users, Mail, Building2, MessageSquare, Eye } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentReplies, setRecentReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, repliesData] = await Promise.all([
          getDashboardStats(),
          getReplies({ page: 1, perPage: 5 })
        ])
        setStats(statsData)
        setRecentReplies(repliesData.items)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your outreach performance.</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Leads"
            value={stats.totalLeads}
            icon={Users}
            description={`${stats.activeLeads} active`}
          />
          <StatCard
            title="Companies"
            value={stats.companies}
            icon={Building2}
            description="Tracked accounts"
          />
          <StatCard
            title="Response Rate"
            value={`${stats.responseRate}%`}
            icon={TrendingUp}
            description="Overall performance"
            trend={{ value: 12, direction: 'up' }}
          />
          <StatCard
            title="Pending Replies"
            value={stats.pendingReplies}
            icon={MessageSquare}
            description="Unread messages"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Activity */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Email Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Total Emails Sent', value: stats?.totalEmails || 0 },
                { label: 'Average Engagement', value: `${stats?.avgEngagement || 0}%` },
                { label: 'Active Campaigns', value: stats?.activeCampaigns ?? 0 },
                { label: 'Last 7 Days Performance', value: `${stats?.last7DaysPerformance ?? 0}%` }
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center pb-3 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-accent" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-accent font-semibold">Hot Lead Alert</p>
                <p className="text-muted-foreground text-xs mt-1">
                  John Smith just opened your email
                </p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-accent font-semibold">High Engagement</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Digital Solutions has 82% engagement rate
                </p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-accent font-semibold">Follow-up Needed</p>
                <p className="text-muted-foreground text-xs mt-1">
                  5 leads need follow-up emails
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Replies */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-accent" />
            Recent Replies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReplies.length > 0 ? (
              recentReplies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-4 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    reply.sentiment === 'positive' ? 'bg-accent' :
                    reply.sentiment === 'negative' ? 'bg-destructive' :
                    'bg-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{reply.leadName}</p>
                    <p className="text-sm text-muted-foreground truncate">{reply.preview}</p>
                    <p className="text-xs text-muted-foreground mt-1">{reply.timestamp}</p>
                  </div>
                  {reply.status === 'unread' && (
                    <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No replies yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
