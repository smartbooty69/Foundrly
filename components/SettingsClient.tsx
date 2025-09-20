'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import ProfileEditModal from "@/components/ProfileEditModal";
import StreamChatPushNotificationSettings from "@/components/StreamChatPushNotificationSettings";
import NotificationTestPanel from "@/components/NotificationTestPanel";
import NotificationDiagnostics from "@/components/NotificationDiagnostics";
import NotificationTestButton from "@/components/NotificationTestButton";
import StartupCardNotificationTest from "@/components/StartupCardNotificationTest";
import StartupCardNotificationTestMock from "@/components/StartupCardNotificationTestMock";
import SimpleNotificationTest from "@/components/SimpleNotificationTest";
import NotificationDeliveryTest from "@/components/NotificationDeliveryTest";

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

          {/* Push Notification Testing */}
          {/* Simple Notification Test */}
          <div className="bg-white rounded-[22px] shadow-200 border-[5px] border-black p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Simple Notification Test</h2>
            <SimpleNotificationTest />
          </div>

          <div className="bg-white rounded-[22px] shadow-200 border-[5px] border-black p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test All Notification Types</h2>
            <NotificationTestPanel />
          </div>

          {/* Real Component Notifications */}
          <div className="bg-white rounded-[22px] shadow-200 border-[5px] border-black p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Real Component Notifications</h2>
            <p className="text-sm text-gray-600 mb-4">
              These buttons simulate real component interactions (like liking a startup, commenting, etc.)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <NotificationTestButton
                type="like"
                title="New Like"
                message="John Doe liked your startup 'Amazing App'"
                metadata={{ startupTitle: 'Amazing App', likerName: 'John Doe' }}
              />
              <NotificationTestButton
                type="dislike"
                title="New Dislike"
                message="Jane Smith disliked your startup 'Cool Product'"
                metadata={{ startupTitle: 'Cool Product', dislikerName: 'Jane Smith' }}
              />
              <NotificationTestButton
                type="comment"
                title="New Comment"
                message="Mike Johnson commented on your startup 'Great Idea'"
                metadata={{ startupTitle: 'Great Idea', commenterName: 'Mike Johnson' }}
              />
              <NotificationTestButton
                type="reply"
                title="New Reply"
                message="Sarah Wilson replied to your comment on 'Awesome Startup'"
                metadata={{ startupTitle: 'Awesome Startup', replierName: 'Sarah Wilson' }}
              />
              <NotificationTestButton
                type="interested"
                title="New Interest"
                message="Alex Brown is interested in your startup 'Innovative Solution'"
                metadata={{ startupTitle: 'Innovative Solution', interestedUserName: 'Alex Brown' }}
              />
              <NotificationTestButton
                type="follow"
                title="New Follower"
                message="Emma Davis started following you"
                metadata={{ followerName: 'Emma Davis' }}
              />
            </div>
          </div>

          {/* Direct Notification Testing */}
          <div className="bg-white rounded-[22px] shadow-200 border-[5px] border-black p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Direct Notification Testing</h2>
            <StartupCardNotificationTestMock />
          </div>

          {/* StartupCard with Notifications */}
          <div className="bg-white rounded-[22px] shadow-200 border-[5px] border-black p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">StartupCard Component with Notifications</h2>
            <StartupCardNotificationTest />
          </div>

          {/* Notification Delivery Test */}
          <div className="bg-white rounded-[22px] shadow-200 border-[5px] border-black p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Delivery Test</h2>
            <NotificationDeliveryTest />
          </div>

          {/* Notification Diagnostics */}
          <div className="bg-white rounded-[22px] shadow-200 border-[5px] border-black p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Diagnostics</h2>
            <NotificationDiagnostics />
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
