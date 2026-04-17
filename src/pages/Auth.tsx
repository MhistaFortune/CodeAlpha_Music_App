import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, User, Lock, Plus, Camera, Eye, EyeOff } from 'lucide-react';

export function Auth() {
  const { login, register } = useAuthStore();
  
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // Stores Base64
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (isLogin) {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed.');
      }
    } else {
      if (!username.trim()) {
        setError('Username is required for registration.');
        return;
      }
      const result = register(email, username, avatarUrl, password);
      if (!result.success) {
        setError(result.error || 'Registration failed.');
      }
    }
  };

  const handleReset = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
    setAvatarUrl('');
  };

  return (
    <div className="min-h-screen bg-[#050a15] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101d36] rounded-2xl shadow-2xl overflow-hidden border border-[#1e3357]">
        <div className="p-8 text-center bg-[#152542] border-b border-[#1e3357]">
          <h1 className="text-3xl font-bold tracking-tight mb-2">SoundScape</h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Welcome back! Log in to your account.' : 'Join us and discover new music.'}
          </p>
        </div>

        <div className="p-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {!isLogin && (
              // Sign Up Only: Profile Picture
              <div className="flex flex-col items-center justify-center mb-6">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <div 
                  className="w-24 h-24 rounded-full bg-[#050a15] border-2 border-dashed border-[#3b82f6] flex items-center justify-center cursor-pointer group relative overflow-hidden transition-all hover:border-solid shadow-lg"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUrl ? (
                    <>
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Camera className="w-6 h-6 drop-shadow-md" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-[#3b82f6] group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Photo</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isLogin && (
              // Sign Up Only: Username
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-300 ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="How should we call you?"
                    className="w-full bg-[#050a15] border border-[#1e3357] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Email (Login + Sign Up) */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-300 ml-1">Email (Gmail)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  className="w-full bg-[#050a15] border border-[#1e3357] text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password (Login + Sign Up) */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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

            {error && <p className="text-red-400 text-sm font-medium bg-red-400/10 py-2.5 px-3 rounded-lg border border-red-500/20">{error}</p>}

            <button
              type="submit"
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-[#050a15] font-bold py-3.5 rounded-xl transition shadow-lg hover:shadow-xl mt-4 text-lg"
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-[#1e3357] pt-6">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={handleReset}
                className="ml-2 text-[#3b82f6] hover:text-white font-bold transition hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
