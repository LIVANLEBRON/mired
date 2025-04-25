import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // To link to user profiles later
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

interface FoundUser {
  id: string;
  displayName: string;
  // Add photoURL etc. if needed
}

interface UserListItemProps {
  user: FoundUser;
}

const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;
  useEffect(() => {
    const checkIfFollowing = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const currentUserProfileRef = doc(db, 'profiles', currentUser.uid);
        const currentUserProfileSnap = await getDoc(currentUserProfileRef);
        if (currentUserProfileSnap.exists()) {
          const followingList = currentUserProfileSnap.data()?.following || [];
          setIsFollowing(followingList.includes(user.id));
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkIfFollowing();
  }, [currentUser, user.id, db]);

  const handleFollowToggle = async () => {
    if (!currentUser || loading) return;

    setLoading(true);
    const currentUserProfileRef = doc(db, 'profiles', currentUser.uid);
    const targetUserProfileRef = doc(db, 'profiles', user.id);

    try {
      if (isFollowing) {
        // Unfollow
        await updateDoc(currentUserProfileRef, {
          following: arrayRemove(user.id)
        });
        await updateDoc(targetUserProfileRef, {
          followers: arrayRemove(currentUser.uid)
        });
        setIsFollowing(false);
      } else {
        // Follow
        await updateDoc(currentUserProfileRef, {
          following: arrayUnion(user.id)
        });
        await updateDoc(targetUserProfileRef, {
          followers: arrayUnion(currentUser.uid)
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      // Optionally show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100">
      <div>
        {/* Link to user profile page (e.g., /profile/{user.id}) - implement route later */}
        <Link to={`/profile/${user.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
          {user.displayName}
        </Link>
        {/* Optionally display other info like username or bio snippet */}
      </div>
      {currentUser && currentUser.uid !== user.id && ( // Don't show button for self
        <button
          onClick={handleFollowToggle}
          disabled={loading || !currentUser}
          className={`px-3 py-1 text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${isFollowing ? 'bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'}`}
        >
          {loading ? '...' : (isFollowing ? 'Dejar de Seguir' : 'Seguir')}
        </button>
      )}
    </div>
  );
};

export default UserListItem;