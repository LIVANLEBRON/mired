import React, { useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import UserListItem from './UserListItem'; // We'll create this next

interface FoundUser {
  id: string;
  displayName: string;
  // Add other relevant fields like photoURL if available
}

const UserSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<FoundUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const db = getFirestore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const usersRef = collection(db, 'profiles'); // Assuming profiles are stored in 'profiles' collection
      // Simple search by displayName - case-sensitive. 
      // For case-insensitive or more complex search, consider backend functions or third-party search services.
      const q = query(usersRef, where('displayName', '>=', searchTerm), where('displayName', '<=', searchTerm + '\uf8ff'));
      
      const querySnapshot = await getDocs(q);
      const foundUsers: FoundUser[] = [];
      querySnapshot.forEach((doc) => {
        // Exclude searching for oneself if needed (add check against auth.currentUser.uid)
        foundUsers.push({ id: doc.id, ...(doc.data() as { displayName: string }) });
      });
      setResults(foundUsers);
    } catch (err: any) {
      setError('Error al buscar usuarios: ' + err.message);
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Buscar Usuarios</h2>
      <form onSubmit={handleSearch} className="flex mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-r hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading && !results.length && <p>Buscando...</p>}

      {!loading && searchTerm && results.length === 0 && (
        <p>No se encontraron usuarios.</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;