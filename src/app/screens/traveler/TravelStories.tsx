import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { Header, BottomNavigation, Sidebar } from '../../components/design-system/Navigation';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Star, Search, Users, Plus } from 'lucide-react';
import { SocialPost } from '../../types';

export default function TravelStories() {
  const navigate = useNavigate();
  const { user, socialPosts, togglePostLike, togglePostBookmark } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'experience' | 'tripmate' | 'recommendation'>('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  if (!user) return null;

  const filteredPosts = socialPosts.filter((post) => {
    if (filter !== 'all' && post.postType !== filter) return false;
    if (searchLocation && !post.location.toLowerCase().includes(searchLocation.toLowerCase())) return false;
    return true;
  });

  const unreadNotifications = 2;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Travel Stories"
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
        {/* Trending Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">🌟 Share Your Journey</h2>
          <p className="mb-4 opacity-90">
            Inspire others with your travel experiences, find tripmates, and discover hidden gems!
          </p>
        </div>

        {/* Search by Location */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Search by Location</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Where do you want to explore?"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'All Stories', icon: '📖' },
            { value: 'experience', label: 'Experiences', icon: '✨' },
            { value: 'tripmate', label: 'Find Tripmates', icon: '🤝' },
            { value: 'recommendation', label: 'Recommendations', icon: '⭐' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                filter === item.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Post List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => togglePostLike(post.id, false)}
              onBookmark={() => togglePostBookmark(post.id, false)}
            />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No stories found</p>
            <button
              onClick={() => {
                setFilter('all');
                setSearchLocation('');
              }}
              className="text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <BottomNavigation role={user.role} />

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
}

function PostCard({
  post,
  onLike,
  onBookmark,
}: {
  post: SocialPost;
  onLike: () => void;
  onBookmark: () => void;
}) {
  const isTripmate = post.postType === 'tripmate';

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <img
          src={post.userAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
          alt={post.userName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{post.userName}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{post.userLocation || 'Traveler'}</span>
          </div>
        </div>
        {isTripmate && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            🤝 TRIPMATE
          </span>
        )}
      </div>

      {/* Image */}
      {post.images && post.images.length > 0 && (
        <img
          src={post.images[0]}
          alt={post.location}
          className="w-full h-64 object-cover"
        />
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-gray-900">{post.location}</span>
          {post.rating && (
            <div className="flex items-center gap-1 ml-auto">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-900">{post.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-gray-700 mb-3">{post.caption}</p>

        {/* Tripmate Details */}
        {isTripmate && post.tripmateDetails && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Trip Details
            </h4>
            <div className="space-y-1 text-sm text-green-800">
              <p>📍 {post.tripmateDetails.destination}</p>
              <p>📅 {post.tripmateDetails.startDate} - {post.tripmateDetails.endDate}</p>
              {post.tripmateDetails.budget && (
                <p>💰 Budget: RM {post.tripmateDetails.budget}/day</p>
              )}
              <p className="mt-2 font-medium">{post.tripmateDetails.lookingFor}</p>
            </div>
            <button className="mt-3 w-full py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
              I'm Interested!
            </button>
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

        {/* Supplier Attribution */}
        {post.supplierName && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
            Experienced with: <span className="font-semibold text-blue-600">@{post.supplierName}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-4">
        <button
          onClick={onLike}
          className={`flex items-center gap-2 transition-colors ${
            post.isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-red-600' : ''}`} />
          <span className="font-semibold">{post.likes}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">{post.comments}</span>
        </button>
        {post.shares !== undefined && (
          <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="font-semibold">{post.shares}</span>
          </button>
        )}
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

function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { createSocialPost, user } = useApp();
  const [postType, setPostType] = useState<'experience' | 'tripmate' | 'recommendation'>('experience');
  const [location, setLocation] = useState('');
  const [caption, setCaption] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = () => {
    if (!location || !caption) {
      alert('Please fill in all required fields');
      return;
    }

    createSocialPost({
      userId: user?.id || '',
      userName: user?.name || '',
      userAvatar: user?.avatar,
      userLocation: user?.location,
      location,
      caption,
      images: [],
      rating: postType === 'experience' ? rating : undefined,
      postType,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Create Post</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Post Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Post Type</label>
            <div className="flex gap-2">
              {[
                { value: 'experience', label: '✨ Experience' },
                { value: 'tripmate', label: '🤝 Find Tripmate' },
                { value: 'recommendation', label: '⭐ Recommendation' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setPostType(type.value as any)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                    postType === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              placeholder="e.g., Batu Caves, Kuala Lumpur"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Rating (for experience) */}
          {postType === 'experience' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Caption *</label>
            <textarea
              placeholder="Share your experience, tips, or what you're looking for..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
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
