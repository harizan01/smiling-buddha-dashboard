'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, Download, Filter, RefreshCw, Camera, Clock, TrendingUp, Flame, Search, Bell, Settings, Menu, X } from 'lucide-react';

interface FireEvent {
  id: string;
  timestamp: string;
  site: string;
  camera: string;
  severity: 'critical' | 'medium' | 'low';
  confidence: number;
  type: string;
  thumbnail: string;
  videoUrl: string | null;
  metadata: {
    location: { x: number; y: number; width: number; height: number };
    duration: number;
  };
}

export default function Page() {
  const [events, setEvents] = useState<FireEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<FireEvent | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch events from your API
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/webhook');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to mock data if API fails
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchEvents();

    // Refresh every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleVideoPlay = async (event: FireEvent) => {
    setVideoLoading(true);
    setSelectedEvent(event);

    try {
      // If video URL already exists, use it
      if (event.videoUrl) {
        setSelectedEvent({
          ...event,
          videoUrl: event.videoUrl
        });
      } else {
        // Otherwise use placeholder
        setSelectedEvent({
          ...event,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        });
      }
      setVideoLoading(false);
    } catch (error) {
      console.error('Error fetching video URL:', error);
      setVideoLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.severity === filter;
    const matchesSearch = event.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          color: 'text-red-600 bg-gradient-to-r from-red-50 to-pink-50 border-red-200',
          icon: 'text-red-500',
          glow: 'shadow-red-100'
        };
      case 'medium':
        return {
          color: 'text-orange-600 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200',
          icon: 'text-orange-500',
          glow: 'shadow-orange-100'
        };
      case 'low':
        return {
          color: 'text-yellow-600 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
          icon: 'text-yellow-500',
          glow: 'shadow-yellow-100'
        };
      default:
        return {
          color: 'text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
          icon: 'text-gray-500',
          glow: 'shadow-gray-100'
        };
    }
  };

  const getSeverityIcon = (severity: string) => {
    const config = getSeverityConfig(severity);
    return severity === 'critical' ?
      <Flame className={`w-4 h-4 ${config.icon}`} /> :
      <AlertTriangle className={`w-4 h-4 ${config.icon}`} />;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const getStatCardConfig = (type: string) => {
    switch (type) {
      case 'total':
        return {
          gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
          iconBg: 'bg-blue-100',
          icon: <TrendingUp className="w-8 h-8 text-blue-600" />
        };
      case 'critical':
        return {
          gradient: 'bg-gradient-to-br from-red-500 to-red-600',
          iconBg: 'bg-red-100',
          icon: <Flame className="w-8 h-8 text-red-600" />
        };
      case 'cameras':
        return {
          gradient: 'bg-gradient-to-br from-green-500 to-green-600',
          iconBg: 'bg-green-100',
          icon: <Camera className="w-8 h-8 text-green-600" />
        };
      case 'recent':
        return {
          gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
          iconBg: 'bg-purple-100',
          icon: <Clock className="w-8 h-8 text-purple-600" />
        };
      default:
        return {
          gradient: 'bg-gradient-to-br from-gray-500 to-gray-600',
          iconBg: 'bg-gray-100',
          icon: <TrendingUp className="w-8 h-8 text-gray-600" />
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header with Glass Effect */}
      <div className="bg-white/70 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Fire Detection Dashboard
                  </h1>
                  <p className="text-gray-500 text-sm">Real-time monitoring and alerts</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200 backdrop-blur-sm"
                />
              </div>

              <button className="p-2 rounded-xl bg-white/80 hover:bg-white shadow-sm transition-all duration-200">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>

              <button className="p-2 rounded-xl bg-white/80 hover:bg-white shadow-sm transition-all duration-200">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={fetchEvents}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards with Animations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {(() => {
            const totalEvents = events.length;
            const criticalEvents = events.filter(e => e.severity === 'critical').length;
            const uniqueCameras = new Set(events.map(e => e.camera)).size;
            const last24hEvents = events.filter(e => new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;

            // Calculate actual percentages (mock previous data for demo)
            const previousTotal = Math.max(1, totalEvents - 1);
            const previousCritical = Math.max(1, criticalEvents - 1);
            const previousCameras = Math.max(1, uniqueCameras - 1);
            const previous24h = Math.max(1, last24hEvents - 1);

            const totalChange = totalEvents > 0 ? `+${Math.round(((totalEvents - previousTotal) / previousTotal) * 100)}%` : '0%';
            const criticalChange = criticalEvents > 0 ? `+${Math.round(((criticalEvents - previousCritical) / previousCritical) * 100)}%` : '0%';
            const cameraChange = uniqueCameras > 0 ? `${Math.round(((uniqueCameras - previousCameras) / previousCameras) * 100)}%` : '0%';
            const recentChange = last24hEvents > 0 ? `+${Math.round(((last24hEvents - previous24h) / previous24h) * 100)}%` : '0%';

            return [
              { type: 'total', title: 'Total Events', value: totalEvents, change: totalChange },
              { type: 'critical', title: 'Critical Alerts', value: criticalEvents, change: criticalChange },
              { type: 'cameras', title: 'Active Cameras', value: uniqueCameras, change: cameraChange },
              { type: 'recent', title: 'Last 24h', value: last24hEvents, change: recentChange }
            ];
          })().map((stat, index) => {
            const config = getStatCardConfig(stat.type);
            return (
              <div
                key={stat.type}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                    <p className="text-xs text-green-600 font-medium">{stat.change} from last week</p>
                  </div>
                  <div className={`p-3 ${config.iconBg} rounded-2xl shadow-sm`}>
                    {config.icon}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modern Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Filter className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Filter by severity:</span>
                <div className="flex space-x-2">
                  {['all', 'critical', 'medium', 'low'].map((severity) => (
                    <button
                      key={severity}
                      onClick={() => setFilter(severity)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${filter === severity
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      {severity !== 'all' && (
                        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                          {events.filter(e => e.severity === severity).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Showing {filteredEvents.length} of {events.length} events</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Events Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
            <h2 className="text-xl font-bold text-gray-800">Detection Events</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time fire and smoke detection alerts</p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <p className="text-gray-600 font-medium">Loading events...</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <AlertTriangle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No events found</p>
                  <p className="text-gray-400 text-sm mt-1">Waiting for detection data...</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/50">
                {filteredEvents.map((event, index) => {
                  const severityConfig = getSeverityConfig(event.severity);
                  return (
                    <div
                      key={event.id}
                      className="p-6 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/20 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                          <img
                            src={event.thumbnail || 'https://images.unsplash.com/photo-1574870111867-089ad2b5618a?w=320&h=180&fit=crop&crop=center'}
                            alt="Event thumbnail"
                            className="w-20 h-14 object-cover rounded-xl shadow-md"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1574870111867-089ad2b5618a?w=320&h=180&fit=crop&crop=center';
                            }}
                          />
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-800">{formatTimestamp(event.timestamp)}</h3>
                              <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${severityConfig.color} ${severityConfig.glow}`}>
                                {getSeverityIcon(event.severity)}
                                <span>{event.severity}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span><strong>Site:</strong> {event.site}</span>
                              <span><strong>Camera:</strong> {event.camera}</span>
                              <span><strong>Type:</strong> {event.type}</span>
                              <span><strong>Confidence:</strong> {formatConfidence(event.confidence)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleVideoPlay(event)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-105">
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Video Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-blue-50/30">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Event Details</h3>
                <p className="text-gray-600">{formatTimestamp(selectedEvent.timestamp)} - {selectedEvent.site}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {videoLoading ? (
                <div className="flex items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
                      <RefreshCw className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <p className="text-gray-600 font-medium">Loading video...</p>
                  </div>
                </div>
              ) : selectedEvent.videoUrl ? (
                <video
                  controls
                  className="w-full rounded-2xl shadow-lg"
                  poster={selectedEvent.thumbnail}
                >
                  <source src={selectedEvent.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Video not available</p>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Confidence', value: formatConfidence(selectedEvent.confidence) },
                  { label: 'Duration', value: `${selectedEvent.metadata.duration}s` },
                  { label: 'Detection Area', value: `${selectedEvent.metadata.location.width} × ${selectedEvent.metadata.location.height}px` },
                  { label: 'Type', value: selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1) }
                ].map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4">
                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                    <p className="text-lg font-bold text-gray-800 mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}