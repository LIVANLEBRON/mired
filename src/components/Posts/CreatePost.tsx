import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Debes iniciar sesión para publicar.');
      return;
    }
    if (!content.trim()) {
      setError('La publicación no puede estar vacía.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        content: content,
        createdAt: serverTimestamp(),
        authorName: user.displayName || 'Usuario Anónimo', // Store display name
        likesCount: 0, // Initialize likes count
        likedBy: [], // Initialize likedBy array
        commentsCount: 0, // Initialize comments count
        comments: [], // Initialize comments array
        // Add other post fields later
      });
      setContent(''); // Clear the input field
      console.log('Post created successfully');
      // Optionally: trigger a refresh of the post list
    } catch (err: any) {
      setError('Error al crear la publicación: ' + err.message);
      console.error('Error creating post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 mb-6 bg-white shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Crear Nueva Publicación</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="¿Qué estás pensando?"
          rows={3}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={submitting}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="px-4 py-2 font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={submitting || !content.trim()}
          >
            {submitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;