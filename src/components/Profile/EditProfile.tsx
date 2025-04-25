import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface UserProfileData {
  displayName?: string;
  bio?: string;
  // Add other profile fields as needed
}

const EditProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileData>({ displayName: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setError('Usuario no autenticado.');
        setLoading(false);
        return;
      }

      try {
        const profileDocRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileDocRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfileData);
        } else {
          // Initialize with default values if profile doesn't exist
          setProfile({ displayName: user.displayName || '', bio: '' });
        }
      } catch (err: any) {
        setError('Error al cargar el perfil: ' + err.message);
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, db]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Usuario no autenticado.');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const profileDocRef = doc(db, 'profiles', user.uid);
      await setDoc(profileDocRef, profile, { merge: true }); // Use merge: true to update existing fields or create if not exists
      setSaving(false);
      navigate('/profile'); // Redirect to profile page after saving
    } catch (err: any) {
      setError('Error al guardar el perfil: ' + err.message);
      console.error('Error saving profile:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Cargando editor de perfil...</div>;
  }

  if (error && !saving) { // Don't show loading error if a save error occurs
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-semibold mb-4">Editar Perfil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={profile.displayName || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biografía</label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={profile.bio || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {/* Add fields for other profile information here */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end space-x-2">
           <button
            type="button"
            onClick={() => navigate('/profile')} // Button to cancel and go back
            className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;