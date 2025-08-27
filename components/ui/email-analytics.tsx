'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, TrendingUp, Users, Clock, CheckCircle, XCircle, BarChart3, PieChart, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailAnalyticsData {
  totalSent: number;
  responsesReceived: number;
  responseRate: number;
  averageResponseTime: number; // in days
  successfulConnections: number;
  topPerformingProfessors: Array<{
    name: string;
    university: string;
    responseRate: number;
    emailsSent: number;
  }>;
  monthlyStats: Array<{
    month: string;
    sent: number;
    responses: number;
    successRate: number;
  }>;
  researchAreas: Array<{
    area: string;
    sent: number;
    responseRate: number;
  }>;
}

interface EmailAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function EmailAnalytics({ isOpen, onClose, className }: EmailAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<EmailAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadAnalyticsData();
    }
  }, [isOpen]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // In a real app, this would come from your analytics API
      // For now, we'll use mock data
      const mockData: EmailAnalyticsData = {
        totalSent: 47,
        responsesReceived: 12,
        responseRate: 25.5,
        averageResponseTime: 7.2,
        successfulConnections: 8,
        topPerformingProfessors: [
          { name: "Dr. Sarah Chen", university: "MIT", responseRate: 60, emailsSent: 5 },
          { name: "Prof. Michael Torres", university: "Stanford", responseRate: 40, emailsSent: 3 },
          { name: "Dr. Emily Rodriguez", university: "Harvard", responseRate: 33, emailsSent: 6 },
        ],
        monthlyStats: [
          { month: "Jan", sent: 12, responses: 3, successRate: 25 },
          { month: "Feb", sent: 15, responses: 4, successRate: 27 },
          { month: "Mar", sent: 20, responses: 5, successRate: 25 },
        ],
        researchAreas: [
          { area: "Machine Learning", sent: 15, responseRate: 33 },
          { area: "Computer Vision", sent: 12, responseRate: 25 },
          { area: "Natural Language Processing", sent: 8, responseRate: 12 },
          { area: "Robotics", sent: 12, responseRate: 17 },
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = "blue"
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: { value: number; isPositive: boolean };
    color?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border rounded-xl p-6 backdrop-blur-sm",
        color === "blue" && "border-blue-500/20 from-blue-500/5 to-blue-500/5",
        color === "green" && "border-green-500/20 from-green-500/5 to-green-500/5",
        color === "purple" && "border-purple-500/20 from-purple-500/5 to-purple-500/5"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          "p-2 rounded-lg",
          color === "blue" && "bg-blue-500/20 text-blue-400",
          color === "green" && "bg-green-500/20 text-green-400",
          color === "purple" && "bg-purple-500/20 text-purple-400"
        )}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm",
            trend.isPositive ? "text-green-400" : "text-red-400"
          )}>
            <TrendingUp className="w-3 h-3" />
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-white/60">{title}</div>
      {subtitle && <div className="text-xs text-white/40 mt-1">{subtitle}</div>}
    </motion.div>
  );

  const ProfessorPerformanceCard = ({ professor }: { professor: EmailAnalyticsData['topPerformingProfessors'][0] }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
    >
      <div className="flex-1">
        <div className="font-medium text-white">{professor.name}</div>
        <div className="text-sm text-white/60">{professor.university}</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-green-400">{professor.responseRate}%</div>
        <div className="text-xs text-white/40">{professor.emailsSent} emails</div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "bg-[#1a1a1a] border border-white/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-[#0CF2A0]" />
              Email Analytics
            </h2>
            <p className="text-white/60 text-sm mt-1">Track your outreach success and optimize your strategy</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <XCircle className="w-6 h-6 text-white/60 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#0CF2A0] border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-white">Loading analytics...</span>
            </div>
          ) : analyticsData ? (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Emails Sent"
                  value={analyticsData.totalSent}
                  subtitle="Total outreach"
                  icon={<Mail className="w-5 h-5" />}
                  color="blue"
                  trend={{ value: 12, isPositive: true }}
                />
                <MetricCard
                  title="Response Rate"
                  value={`${analyticsData.responseRate}%`}
                  subtitle={`${analyticsData.responsesReceived} responses`}
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="green"
                  trend={{ value: 5.2, isPositive: true }}
                />
                <MetricCard
                  title="Avg. Response Time"
                  value={`${analyticsData.averageResponseTime}d`}
                  subtitle="Days to reply"
                  icon={<Clock className="w-5 h-5" />}
                  color="purple"
                />
                <MetricCard
                  title="Successful Connections"
                  value={analyticsData.successfulConnections}
                  subtitle="Meaningful exchanges"
                  icon={<Users className="w-5 h-5" />}
                  color="blue"
                />
              </div>

              {/* Top Performing Professors */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#0CF2A0]" />
                  Top Performing Professors
                </h3>
                <div className="space-y-2">
                  {analyticsData.topPerformingProfessors.map((professor, index) => (
                    <ProfessorPerformanceCard key={index} professor={professor} />
                  ))}
                </div>
              </div>

              {/* Research Areas Performance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#0CF2A0]" />
                  Performance by Research Area
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analyticsData.researchAreas.map((area, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{area.area}</span>
                        <span className="text-[#0CF2A0] font-bold">{area.responseRate}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-[#0CF2A0] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${area.responseRate}%` }}
                        />
                      </div>
                      <div className="text-xs text-white/60 mt-1">{area.sent} emails sent</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0CF2A0]" />
                  Monthly Performance
                </h3>
                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                  <div className="space-y-3">
                    {analyticsData.monthlyStats.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 text-center text-white/60 font-medium">{month.month}</div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(month.sent / 20) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/60 w-8">{month.sent}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-medium">{month.responses} responses</div>
                          <div className="text-xs text-white/60">{month.successRate}% rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-gradient-to-r from-[#0CF2A0]/10 to-blue-500/10 border border-[#0CF2A0]/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">💡 Insights & Recommendations</h3>
                <div className="space-y-3 text-sm text-white/80">
                  <p>• <strong>Machine Learning</strong> has the highest response rate (33%). Consider focusing more outreach in this area.</p>
                  <p>• <strong>MIT professors</strong> show the best engagement. Their average response time is 5.2 days.</p>
                  <p>• Your response rate improved by 5.2% this month. Great progress!</p>
                  <p>• Try reaching out to more professors in <strong>Computer Vision</strong> - it has potential for higher engagement.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No analytics data available yet.</p>
              <p className="text-white/40 text-sm mt-1">Start sending emails to see your performance metrics!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
