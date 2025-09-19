'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import ProfileEditModal from "@/components/ProfileEditModal";
import StreamChatPushNotificationSettings from "@/components/StreamChatPushNotificationSettings";

interface SettingsClientProps {
  currentUser: {
    _id: string;
    name?: string;
    username?: string;
    email?: string;
    image?: string;
    bio?: string;
  };
}

export default function SettingsClient({ currentUser }: SettingsClientProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userData, setUserData] = useState(currentUser);

  // Transform user data for the modal
  const currentProfile = {
    name: userData.name || '',
    bio: userData.bio || '',
    image: userData.image || '/default-avatar.png'
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    // Update the local state with the new profile data
    setUserData(prev => ({
      ...prev,
      name: updatedProfile.name,
      bio: updatedProfile.bio,
      image: updatedProfile.image
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ⚙️ Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account preferences and configurations.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-[22px] shadow-200 border-[5px] border-black p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[22px] border-[3px] border-gray-300">
                    <div>
                      <h3 className="font-medium text-gray-900">Profile Information</h3>
                      <p className="text-sm text-gray-500">Update your name, bio, and profile picture</p>
                    </div>
                    <Button 
                      variant="default" 
                      className="w-24"
                      onClick={() => setIsProfileModalOpen(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[22px] border-[3px] border-gray-300">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Preferences</h3>
                      <p className="text-sm text-gray-500">Manage notification and email settings</p>
                    </div>
                    <Button variant="default" className="w-24">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messaging & Push Notifications */}
          <div className="bg-white rounded-[22px] shadow-200 border-[5px] border-black p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Messaging & Push Notifications</h2>
            <StreamChatPushNotificationSettings />
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={currentProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}
