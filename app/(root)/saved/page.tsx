import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserSidebarWrapper from "@/components/UserSidebarWrapper";

export default async function SavedPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                🔖 Saved
              </h1>
              <p className="text-gray-600 text-lg">
                Access content that has been bookmarked for later viewing.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Startups</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">AI</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">AI-Powered Analytics Platform</h3>
                        <p className="text-sm text-gray-600 mb-2">Revolutionary analytics tool that uses AI to provide insights</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>By @techfounder</span>
                          <span>•</span>
                          <span>Saved 2 days ago</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-colors">
                        Remove
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">ECO</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Eco-Friendly Delivery Service</h3>
                        <p className="text-sm text-gray-600 mb-2">Sustainable delivery solutions for modern businesses</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>By @greenstartup</span>
                          <span>•</span>
                          <span>Saved 1 week ago</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-colors">
                        Remove
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">FIT</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Fitness Tracking App</h3>
                        <p className="text-sm text-gray-600 mb-2">Personalized workout plans and progress tracking</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>By @greenstartup</span>
                          <span>•</span>
                          <span>Saved 2 weeks ago</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Users</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">J</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">John Doe</h3>
                        <p className="text-sm text-gray-600">Serial entrepreneur with 5 successful exits</p>
                      </div>
                      <button className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-colors">
                        Remove
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">S</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Sarah Wilson</h3>
                        <p className="text-sm text-gray-600">Tech innovator and startup mentor</p>
                      </div>
                      <button className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserSidebarWrapper 
        userId={session.user.id} 
        isOwnProfile={true} 
      />
    </div>
  );
}

