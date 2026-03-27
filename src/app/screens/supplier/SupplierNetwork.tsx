import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import { ThumbsUp, MessageCircle, Share2, Bookmark, Users, Filter, Plus, CheckCircle2 } from 'lucide-react';
import { SupplierNetworkPost, NetworkPostType } from '../../types';

export default function SupplierNetwork() {
  const navigate = useNavigate();
  const { user, networkPosts, togglePostLike, togglePostBookmark } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'directory' | 'saved'>('feed');
  const [filterType, setFilterType] = useState<NetworkPostType | 'all'>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);

  if (!user || user.role === 'traveler') {
    navigate('/');
    return null;
  }

  const filteredPosts = networkPosts.filter((post) => {
    if (filterType !== 'all' && post.type !== filterType) return false;
    return true;
  });

  const savedPosts = networkPosts.filter((post) => post.isBookmarked);
  const unreadNotifications = 3;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Supplier Network"
        showMenu
        onMenuClick={() => setSidebarOpen(true)}
        showNotifications
        notificationCount={unreadNotifications}
        action={
          <button
            onClick={() => setShowCreatePost(true)}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={user.role}
        userName={user.name}
        userAvatar={user.avatar}
        userRating={user.rating}
      />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Network Stats Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">🤝 Professional Network</h2>
          <p className="mb-4 opacity-90">
            Connect, collaborate, and grow with fellow tourism professionals
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">1,247+ Active Suppliers</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
          {[
            { value: 'feed', label: 'Feed' },
            { value: 'directory', label: 'Directory' },
            { value: 'saved', label: 'Saved' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {[
                { value: 'all', label: 'All', color: 'gray' },
                { value: 'collaboration', label: 'Collaboration', color: 'purple' },
                { value: 'overflow', label: 'Overflow', color: 'blue' },
                { value: 'help_needed', label: 'Help', color: 'orange' },
                { value: 'news', label: 'News', color: 'red' },
                { value: 'pro_tip', label: 'Pro Tips', color: 'green' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value as any)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                    filterType === filter.value
                      ? `bg-${filter.color}-600 text-white`
                      : 'bg-white text-gray-700 border border-gray-200'
                  }`}
                  style={
                    filterType === filter.value
                      ? {
                          backgroundColor:
                            filter.color === 'purple' ? '#9333ea' :
                            filter.color === 'orange' ? '#ea580c' :
                            filter.color === 'red' ? '#dc2626' :
                            filter.color === 'green' ? '#16a34a' :
                            filter.color === 'blue' ? '#2563eb' :
                            '#6b7280',
                        }
                      : {}
                  }
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <NetworkPostCard
                  key={post.id}
                  post={post}
                  onLike={() => togglePostLike(post.id, true)}
                  onBookmark={() => togglePostBookmark(post.id, true)}
                />
              ))}
            </div>
          </>
        )}

        {/* Directory Tab */}
        {activeTab === 'directory' && <SupplierDirectory />}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedPosts.length > 0 ? (
              savedPosts.map((post) => (
                <NetworkPostCard
                  key={post.id}
                  post={post}
                  onLike={() => togglePostLike(post.id, true)}
                  onBookmark={() => togglePostBookmark(post.id, true)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No saved posts yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavigation role={user.role} />

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreateNetworkPostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
}

function NetworkPostCard({
  post,
  onLike,
  onBookmark,
}: {
  post: SupplierNetworkPost;
  onLike: () => void;
  onBookmark: () => void;
}) {
  const typeConfig = {
    collaboration: { color: 'purple', icon: '🤝', label: 'Collaboration' },
    overflow: { color: 'blue', icon: '📤', label: 'Overflow' },
    help_needed: { color: 'orange', icon: '🆘', label: 'Help Needed' },
    news: { color: 'red', icon: '📰', label: 'News' },
    pro_tip: { color: 'green', icon: '💡', label: 'Pro Tip' },
    update: { color: 'gray', icon: '📝', label: 'Update' },
  };

  const config = typeConfig[post.type];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={post.supplierAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt={post.supplierName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{post.supplierName}</h3>
              {post.supplierVerified && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="capitalize">{post.supplierRole}</span>
              <span>•</span>
              <span>⭐ {post.supplierRating.toFixed(1)}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <span>{post.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Type Badge */}
        <div className="mb-3">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{
              backgroundColor:
                config.color === 'purple' ? '#9333ea' :
                config.color === 'orange' ? '#ea580c' :
                config.color === 'red' ? '#dc2626' :
                config.color === 'green' ? '#16a34a' :
                config.color === 'blue' ? '#2563eb' :
                '#6b7280',
            }}
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </span>
        </div>

        {/* Content */}
        <h4 className="font-bold text-gray-900 mb-2">{post.title}</h4>
        <p className="text-gray-700 mb-3">{post.description}</p>

        {/* Referral Percentage */}
        {post.referralPercentage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-900 font-semibold">
              💰 {post.referralPercentage}% Referral Commission
            </p>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-4">
        <button
          onClick={onLike}
          className={`flex items-center gap-2 transition-colors ${
            post.isLiked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <ThumbsUp className={`w-5 h-5 ${post.isLiked ? 'fill-blue-600' : ''}`} />
          <span className="font-semibold">{post.likes}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">{post.comments}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={onBookmark}
          className={`ml-auto transition-colors ${
            post.isBookmarked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-blue-600' : ''}`} />
        </button>
      </div>

      {/* Time */}
      <div className="px-4 pb-4">
        <p className="text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}

function SupplierDirectory() {
  const mockSuppliers = [
    { id: 's1', name: 'Ahmad Hassan', role: 'driver', rating: 4.8, trips: 287, location: 'Kuala Lumpur', specialties: ['Airport Transfer', 'City Tours'], verified: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 's2', name: 'Rashid Ahmad', role: 'guide', rating: 4.9, trips: 156, location: 'Kuala Lumpur', specialties: ['Cultural Tours', 'Heritage Sites'], verified: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 's3', name: 'Siti Aminah', role: 'driver', rating: 4.9, trips: 201, location: 'Penang', specialties: ['Family Tours', 'Food Tours'], verified: true, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Active Suppliers</h3>
        <span className="text-sm text-gray-500">{mockSuppliers.length} results</span>
      </div>

      {mockSuppliers.map((supplier) => (
        <div key={supplier.id} className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <img
              src={supplier.avatar}
              alt={supplier.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900">{supplier.name}</h4>
                {supplier.verified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <p className="text-sm text-gray-500 capitalize mb-2">{supplier.role} • {supplier.location}</p>
              <div className="flex items-center gap-3 text-sm mb-3">
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">{supplier.rating}</span>
                </span>
                <span className="text-gray-500">{supplier.trips} trips</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {supplier.specialties.map((specialty, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Message
            </button>
            <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateNetworkPostModal({ onClose }: { onClose: () => void }) {
  const { createNetworkPost, user } = useApp();
  const [postType, setPostType] = useState<NetworkPostType>('collaboration');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [referralPercentage, setReferralPercentage] = useState('');

  const handleSubmit = () => {
    if (!title || !description) {
      alert('Please fill in all required fields');
      return;
    }

    createNetworkPost({
      supplierId: user?.id || '',
      supplierName: user?.name || '',
      supplierAvatar: user?.avatar,
      supplierRole: user?.role || 'driver',
      supplierRating: user?.rating || 0,
      supplierVerified: user?.verificationStatus === 'verified',
      type: postType,
      title,
      description,
      referralPercentage: referralPercentage ? parseInt(referralPercentage) : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Create Network Post</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Post Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Post Type</label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as NetworkPostType)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="collaboration">🤝 Collaboration</option>
              <option value="overflow">📤 Overflow (Looking for backup)</option>
              <option value="help_needed">🆘 Help Needed</option>
              <option value="news">📰 News</option>
              <option value="pro_tip">💡 Pro Tip</option>
              <option value="update">📝 Update</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              placeholder="e.g., Looking for driver partner..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              placeholder="Provide details about your request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Referral Percentage */}
          {(postType === 'collaboration' || postType === 'overflow') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Referral Commission (%)
              </label>
              <input
                type="number"
                placeholder="e.g., 25"
                value={referralPercentage}
                onChange={(e) => setReferralPercentage(e.target.value)}
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
