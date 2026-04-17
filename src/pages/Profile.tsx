import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User, Lock, Camera, Check, Eye, EyeOff } from 'lucide-react';

interface ProfileProps {
  onSave?: () => void;
}

export function Profile({ onSave }: ProfileProps) {
  const { user, updateProfile } = useAuthStore();
  
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!user) return;
    
    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }

    const result = updateProfile(user.email, username, avatarUrl, password);
    if (!result.success) {
      setError(result.error || 'Failed to update profile.');
    } else {
      setPassword(''); // Clear password field mentally
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        if (onSave) onSave();
      }, 1500); // 1.5 seconds later, revert view
    }
  };

  if (!user) return null;

  return (
    <div className="pb-16 pt-4 text-white max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 tracking-tight">Profile Settings</h2>

      <div className="bg-[#101d36] border border-[#1e3357] rounded-2xl shadow-xl overflow-hidden p-8">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="flex flex-col items-center justify-center mb-8">
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <div 
              className="w-32 h-32 rounded-full bg-[#050a15] border-4 border-[#3b82f6] flex items-center justify-center cursor-pointer group relative overflow-hidden transition-all shadow-2xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white backdrop-blur-sm">
                <Camera className="w-8 h-8 mb-1 drop-shadow-md" />
                <span className="text-xs font-bold uppercase tracking-wider">Change</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4">{user.email}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Your username"
                className="w-full bg-[#050a15] border border-[#1e3357] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Change Password (Optional)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Leave blank to keep current password"
                className="w-full bg-[#050a15] border border-[#1e3357] text-white pl-10 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition focus:outline-none p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm font-medium bg-red-400/10 py-3 px-4 rounded-xl border border-red-500/20">{error}</p>}
          
          {successMsg && (
            <div className="flex items-center text-[#1db954] text-sm font-medium bg-[#1db954]/10 py-3 px-4 rounded-xl border border-[#1db954]/20">
              <Check className="w-5 h-5 mr-2" />
              {successMsg}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-[#050a15] font-bold py-3.5 rounded-xl transition shadow-lg hover:shadow-xl text-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
