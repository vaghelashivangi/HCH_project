import React, { useState, useRef, useEffect } from 'react';
import { UserCircle, Settings, LogOut, Trash2, MessageSquarePlus } from 'lucide-react';

interface ProfileMenuProps {
  email: string;
  onEditProfile: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onRequestFeature: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  email,
  onEditProfile,
  onLogout,
  onDeleteAccount,
  onRequestFeature,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 rounded-full p-2 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
        aria-label="Profile menu"
      >
        <UserCircle className="h-8 w-8 text-gray-700" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
          <div className="px-4 py-4">
            <p className="text-sm font-medium text-gray-900">Signed in as</p>
            <p className="text-sm text-gray-600 truncate mt-1">{email}</p>
          </div>
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onEditProfile();
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <Settings className="h-5 w-5 mr-3 text-gray-500" />
              Edit Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onRequestFeature();
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <MessageSquarePlus className="h-5 w-5 mr-3 text-gray-500" />
              Request Feature
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              Logout
            </button>
          </div>
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onDeleteAccount();
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <Trash2 className="h-5 w-5 mr-3 text-red-500" />
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};