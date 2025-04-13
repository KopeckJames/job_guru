import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { authAPI } from '../lib/api';
import { toast } from 'react-toastify';
import { useAuth } from '../lib/authContext';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { logout, user } = useAuth();

  // Use user data from auth context
  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName || 'John');
      setValue('lastName', user.lastName || 'Doe');
      setValue('email', user.email || 'john@example.com');
      setValue('phone', user.phone || '(123) 456-7890');
      setValue('location', user.location || 'San Francisco, CA');
      setValue('jobTitle', user.jobTitle || 'Software Engineer');
      setValue('company', user.company || 'Tech Company');
      setValue('bio', user.bio || 'Experienced software engineer with a passion for building user-friendly applications.');
      setValue('linkedinUrl', user.linkedinUrl || 'https://linkedin.com/in/johndoe');
      setValue('githubUrl', user.githubUrl || 'https://github.com/johndoe');
      setValue('websiteUrl', user.websiteUrl || 'https://johndoe.com');

      setIsLoading(false);
    } else {
      // If no user, use mock data
      setTimeout(() => {
        setValue('firstName', 'John');
        setValue('lastName', 'Doe');
        setValue('email', 'john@example.com');
        setValue('phone', '(123) 456-7890');
        setValue('location', 'San Francisco, CA');
        setValue('jobTitle', 'Software Engineer');
        setValue('company', 'Tech Company');
        setValue('bio', 'Experienced software engineer with a passion for building user-friendly applications.');
        setValue('linkedinUrl', 'https://linkedin.com/in/johndoe');
        setValue('githubUrl', 'https://github.com/johndoe');
        setValue('websiteUrl', 'https://johndoe.com');

        setIsLoading(false);
      }, 500);
    }
  }, [setValue, user]);

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);

      // In a real implementation, this would call the API
      // await authAPI.updateProfile({
      //   first_name: data.firstName,
      //   last_name: data.lastName,
      //   phone_number: data.phone,
      //   location: data.location,
      //   job_title: data.jobTitle,
      //   company: data.company,
      //   bio: data.bio,
      //   linkedin_url: data.linkedinUrl,
      //   github_url: data.githubUrl,
      //   website_url: data.websiteUrl
      // });

      // Mock successful update
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Profile updated successfully!');
      setIsSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    // Use logout function from auth context
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <Layout>
      <Head>
        <title>Profile | Job Guru</title>
        <meta name="description" content="Manage your profile settings" />
      </Head>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-4 font-medium ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`px-6 py-4 font-medium ${
                activeTab === 'account'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
            <button
              className={`px-6 py-4 font-medium ${
                activeTab === 'preferences'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="p-6">
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex items-center mb-8">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mr-6">
                      <span className="text-3xl font-semibold text-gray-500">JD</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">John Doe</h2>
                      <p className="text-gray-600">john@example.com</p>
                      <button
                        type="button"
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Change profile picture
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="input-field"
                        {...register('firstName', { required: 'First name is required' })}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className="input-field"
                        {...register('lastName', { required: 'Last name is required' })}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="input-field bg-gray-100"
                        disabled
                        {...register('email')}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Email cannot be changed. Contact support for assistance.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="input-field"
                        {...register('phone')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      className="input-field"
                      placeholder="City, State, Country"
                      {...register('location')}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        id="jobTitle"
                        className="input-field"
                        {...register('jobTitle')}
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        className="input-field"
                        {...register('company')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      className="input-field"
                      placeholder="Tell us about yourself..."
                      {...register('bio')}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Social Links</h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          id="linkedinUrl"
                          className="input-field"
                          placeholder="https://linkedin.com/in/username"
                          {...register('linkedinUrl')}
                        />
                      </div>

                      <div>
                        <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-1">
                          GitHub URL
                        </label>
                        <input
                          type="url"
                          id="githubUrl"
                          className="input-field"
                          placeholder="https://github.com/username"
                          {...register('githubUrl')}
                        />
                      </div>

                      <div>
                        <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                          Personal Website
                        </label>
                        <input
                          type="url"
                          id="websiteUrl"
                          className="input-field"
                          placeholder="https://yourwebsite.com"
                          {...register('websiteUrl')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>

                    <form className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="input-field"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Account Actions</h3>

                    <div className="space-y-4">
                      <button
                        onClick={handleLogout}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Log Out
                      </button>

                      <button
                        className="px-6 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Preferences</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-700">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive emails about your account activity</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-700">Interview Reminders</h4>
                          <p className="text-sm text-gray-500">Receive reminders about upcoming interviews</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-700">Job Recommendations</h4>
                          <p className="text-sm text-gray-500">Receive personalized job recommendations</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-700">Marketing Emails</h4>
                          <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Display Preferences</h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                          Theme
                        </label>
                        <select id="theme" className="input-field">
                          <option value="system">System Default</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                          Language
                        </label>
                        <select id="language" className="input-field">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="zh">Chinese</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
    </Layout>
  );
}
