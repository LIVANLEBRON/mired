import React, { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Link, useParams } from 'react-router-dom'; // Import Link and useParams

interface UserProfileData {
  displayName?: string;
  bio?: string;
  followers?: string[]; // Add followers array
  following?: string[]; // Add following array
  // Add other profile fields as needed
}

const UserProfile: React.FC = () => {
  const { userId: paramUserId } = useParams<{ userId?: string }>(); // Get userId from URL params
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const profileUserId = paramUserId || user?.uid; // Use paramUserId if available, otherwise current user's UID
  const isCurrentUserProfile = !paramUserId || paramUserId === user?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileUserId) { // Check if we have a profileUserId to fetch
        setError('No se pudo determinar el perfil a cargar.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const profileDocRef = doc(db, 'profiles', profileUserId);
        const profileSnap = await getDoc(profileDocRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfileData);
        } else {
          // Handle case where profile doesn't exist yet
          setError('Este perfil no existe.');
          setProfile(null); // Set profile to null if not found
        }
      } catch (err: any) {
        setError('Error al cargar el perfil: ' + err.message);
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileUserId, db]); // Depend on profileUserId instead of user

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!profile) {
    return <div>No se encontró el perfil.</div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-semibold mb-4">Perfil de Usuario</h2>
      <div className="mb-4">
        <p className="text-gray-700"><span className="font-medium">Nombre:</span> {profile.displayName || 'No especificado'}</p>
      </div>
      <div className="mb-4">
        <p className="text-gray-700"><span className="font-medium">Biografía:</span> {profile.bio || 'No especificada'}</p>
      </div>
      {/* Add display for other profile fields here */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <span className="text-gray-600 mr-4">Seguidores: {profile.followers?.length || 0}</span>
          <span className="text-gray-600">Siguiendo: {profile.following?.length || 0}</span>
        </div>
        {isCurrentUserProfile && (
          <Link 
            to="/edit-profile"
            className="px-4 py-2 font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Editar Perfil
          </Link>
        )}
        {/* Add Follow/Unfollow button for other users' profiles here if needed */}
      </div>
    </div>
  );
};

export default UserProfile;