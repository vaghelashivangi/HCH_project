import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Lock, Plus, Search, Pencil, Trash2, Users } from 'lucide-react';
import { supabase } from './lib/supabase';
import { CredentialForm } from './components/CredentialForm';
import { EditCredentialForm } from './components/EditCredentialForm';
import { SignupForm } from './components/SignupForm';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ProfileMenu } from './components/ProfileMenu';
import { EditProfileModal } from './components/EditProfileModal';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { FeatureRequestModal } from './components/FeatureRequestModal';
import { encryptData, decryptData } from './lib/encryption';
import type { Credential, User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [showMasterKeyPrompt, setShowMasterKeyPrompt] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showMasterKeyError, setShowMasterKeyError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [editingCredential, setEditingCredential] = useState<(Credential & { password: string }) | null>(null);
  const [deletingCredential, setDeletingCredential] = useState<Credential | null>(null);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showFeatureRequest, setShowFeatureRequest] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!
        });
        checkMasterKey(session.user.id);
      }
      setIsInitializing(false);
      setIsAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!
        });
        checkMasterKey(session.user.id);
      } else {
        setUser(null);
        setCredentials([]);
        setMasterKey('');
        setIsNewUser(false);
        setShowMasterKeyPrompt(false);
      }
      setIsInitializing(false);
      setIsAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkMasterKey = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('master_keys')
        .select('encrypted_key')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      setIsNewUser(!data);
      setShowMasterKeyPrompt(true);
      if (!data) {
        toast.success('Welcome! Please set up your master key.');
      }
    } catch (error) {
      console.error('Error checking master key:', error);
      setShowMasterKeyPrompt(true);
      setIsNewUser(true);
    }
  };

  const verifyMasterKey = async (key: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('master_keys')
        .select('encrypted_key')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        try {
          const decryptedStoredKey = decryptData(data.encrypted_key, key);
          return decryptedStoredKey === key;
        } catch {
          return false;
        }
      }
      return true; // New user, no verification needed
    } catch {
      return false;
    }
  };

  const saveMasterKey = async (key: string, userId: string) => {
    try {
      const encryptedKey = encryptData(key, key);
      
      // First try to update existing record
      const { data: existingKey, error: fetchError } = await supabase
        .from('master_keys')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingKey) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('master_keys')
          .update({ encrypted_key: encryptedKey })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('master_keys')
          .insert([{ user_id: userId, encrypted_key: encryptedKey }]);

        if (insertError) throw insertError;
      }

      return true;
    } catch (error) {
      console.error('Error saving master key:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user && masterKey) {
      fetchCredentials();
    }
  }, [user, masterKey]);

  const fetchCredentials = async () => {
    if (!user || !masterKey) return;
    
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const decryptedCredentials = data.map(cred => ({
        ...cred,
        password: decryptData(cred.encrypted_password, masterKey)
      }));

      setCredentials(decryptedCredentials);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Failed to fetch credentials');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
    }
  };

  const handleSignup = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      setShowSignupForm(false);
      toast.success('Account created! Please set up your master key.');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to sign up. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setMasterKey('');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleAddCredential = async (data: {
    name: string;
    username: string;
    password: string;
    description?: string;
    url?: string;
  }) => {
    if (!user || !masterKey) {
      toast.error('Please set your master key first');
      return;
    }
    
    setIsLoading(true);
    try {
      const encryptedPassword = encryptData(data.password, masterKey);
      
      const { error } = await supabase
        .from('credentials')
        .insert([{
          user_id: user.id,
          name: data.name,
          username: data.username,
          encrypted_password: encryptedPassword,
          description: data.description || null,
          url: data.url || null
        }]);

      if (error) throw error;

      toast.success('Credential saved successfully');
      setShowAddForm(false);
      fetchCredentials();
    } catch (error) {
      console.error('Error adding credential:', error);
      toast.error('Failed to save credential');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCredential = async (data: {
    id: string;
    name: string;
    username: string;
    password: string;
    description?: string;
    url?: string;
  }) => {
    if (!user || !masterKey) {
      toast.error('Please set your master key first');
      return;
    }
    
    setIsLoading(true);
    try {
      const encryptedPassword = encryptData(data.password, masterKey);
      
      const { error } = await supabase
        .from('credentials')
        .update({
          name: data.name,
          username: data.username,
          encrypted_password: encryptedPassword,
          description: data.description || null,
          url: data.url || null
        })
        .eq('id', data.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Credential updated successfully');
      setEditingCredential(null);
      fetchCredentials();
    } catch (error) {
      console.error('Error updating credential:', error);
      toast.error('Failed to update credential');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Credential deleted successfully');
      setDeletingCredential(null);
      fetchCredentials();
    } catch (error) {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credential');
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password
      });

      if (signInError) {
        toast.error('Invalid password');
        return;
      }

      if (user) {
        // Delete all user data first
        const { error: deleteCredentialsError } = await supabase
          .from('credentials')
          .delete()
          .eq('user_id', user.id);

        if (deleteCredentialsError) throw deleteCredentialsError;

        const { error: deleteMasterKeyError } = await supabase
          .from('master_keys')
          .delete()
          .eq('user_id', user.id);

        if (deleteMasterKeyError) throw deleteMasterKeyError;

        const { error: deleteFeatureRequestsError } = await supabase
          .from('feature_requests')
          .delete()
          .eq('user_id', user.id);

        if (deleteFeatureRequestsError) throw deleteFeatureRequestsError;

        // Try to delete the user using RPC
        const { error: selfDeleteError } = await supabase.rpc('delete_user');
        if (selfDeleteError) throw selfDeleteError;

        toast.success('Account deleted successfully');
        handleLogout();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setShowDeleteAccount(false);
    }
  };

  const handleFeatureRequest = async () => {
    setShowFeatureRequest(false);
  };

  const filteredCredentials = credentials.filter(cred =>
    cred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cred.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isInitializing || isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <img 
              src="https://raw.githubusercontent.com/yatricloud/yatri-images/5a903583d7a035e55b9dcbc71b87413760a30bff/Logo/YATRI%20CLOUD%20-%20BW%20-%20LOGO.svg"
              alt="Yatri Cloud Logo"
              className="h-16 w-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Secure Crediential Web Application
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your secure password manager
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleLogin(
                formData.get('email') as string,
                formData.get('password') as string
              );
            }}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Sign in
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowSignupForm(true)}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Create new account
                </button>
              </div>
            </div>
          </div>
        </div>

        {showSignupForm && (
          <SignupForm
            onSubmit={handleSignup}
            onCancel={() => setShowSignupForm(false)}
          />
        )}
      </div>
    );
  }

  if (showMasterKeyPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Toaster position="top-right" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Lock className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isNewUser ? 'Set Master Key' : 'Enter Master Key'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isNewUser 
              ? 'Create a master key to encrypt your passwords. Remember this key as it cannot be recovered!'
              : 'Enter your master key to access your passwords'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (masterKey.length < 8) {
                toast.error('Master key must be at least 8 characters long');
                return;
              }

              if (!isNewUser) {
                const isValid = await verifyMasterKey(masterKey, user.id);
                if (!isValid) {
                  setShowMasterKeyError(true);
                  toast.error('Invalid master key');
                  return;
                }
              }

              const saved = await saveMasterKey(masterKey, user.id);
              if (!saved) {
                toast.error('Failed to save master key');
                return;
              }

              setShowMasterKeyPrompt(false);
              setShowMasterKeyError(false);
              if (isNewUser) {
                toast.success('Master key set successfully');
              }
            }} className="space-y-6">
              <div>
                <label htmlFor="masterKey" className="block text-sm font-medium text-gray-700">
                  Master Key
                </label>
                <div className="mt-1">
                  <input
                    id="masterKey"
                    type="password"
                    required
                    minLength={8}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      showMasterKeyError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                    value={masterKey}
                    onChange={(e) => {
                      setMasterKey(e.target.value);
                      setShowMasterKeyError(false);
                    }}
                  />
                </div>
                {showMasterKeyError && (
                  <p className="mt-2 text-sm text-red-600">
                    Incorrect master key. Please try again.
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img 
                src="https://raw.githubusercontent.com/yatricloud/yatri-images/5a903583d7a035e55b9dcbc71b87413760a30bff/Logo/YATRI%20CLOUD%20-%20BW%20-%20LOGO.svg"
                alt="Yatri Cloud Logo"
                className="h-8 w-auto"
              />
              <h1 className="ml-2 text-2xl font-bold">Secure Crediential Web Application</h1>
            </div>
            {user && (
              <div className="flex items-center">
                <a
                  href="https://www.linkedin.com/in/shivangi-vaghela/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Contact
                </a>
                <ProfileMenu
                  email={user.email}
                  onEditProfile={() => setShowEditProfile(true)}
                  onLogout={handleLogout}
                  onDeleteAccount={() => setShowDeleteAccount(true)}
                  onRequestFeature={() => setShowFeatureRequest(true)}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                placeholder="Search credentials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New
            </button>
          </div>

          {showAddForm && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-lg font-medium mb-4">Add New Credential</h2>
                <CredentialForm
                  onSubmit={handleAddCredential}
                  isLoading={isLoading}
                />
                <button
                  onClick={() => setShowAddForm(false)}
                  className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {editingCredential && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-lg font-medium mb-4">Edit Credential</h2>
                <EditCredentialForm
                  credential={editingCredential}
                  onSubmit={handleEditCredential}
                  onCancel={() => setEditingCredential(null)}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {deletingCredential && (
            <DeleteConfirmationModal
              name={deletingCredential.name}
              onConfirm={() => handleDeleteCredential(deletingCredential.id)}
              onCancel={() => setDeletingCredential(null)}
            />
          )}

          {showEditProfile && user && (
            <EditProfileModal
              email={user.email}
              onClose={() => setShowEditProfile(false)}
            />
          )}

          {showDeleteAccount && (
            <DeleteAccountModal
              onConfirm={handleDeleteAccount}
              onCancel={() => setShowDeleteAccount(false)}
            />
          )}

          {showFeatureRequest && (
            <FeatureRequestModal
              onCancel={() => setShowFeatureRequest(false)}
            />
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredCredentials.map((credential) => (
                <li key={credential.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {credential.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {credential.username}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(credential.password);
                            toast.success('Password copied to clipboard');
                            setTimeout(() => {
                              navigator.clipboard.writeText('');
                            }, 30000);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Copy Password
                        </button>
                        <button
                          onClick={() => setEditingCredential(credential)}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCredential(credential)}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {credential.description && (
                      <p className="mt-2 text-sm text-gray-500">
                        {credential.description}
                      </p>
                    )}
                    {credential.url && (
                      <a
                        href={credential.url}
                        target="_blank"
                        rel _rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-gray-600 hover:text-gray-900"
                      >
                        {credential.url}
                      </a>
                    )}
                  </div>
                </li>
              ))}
              {filteredCredentials.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">
                  No credentials found. Add your first one!
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
     
    </div>
  );
}

export default App;