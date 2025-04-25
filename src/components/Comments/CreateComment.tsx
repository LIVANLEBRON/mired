import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, arrayUnion, increment, serverTimestamp } from 'firebase/firestore';

interface CreateCommentProps {
  postId: string;
  onCommentAdded?: () => void; // Optional callback after adding comment
}

const CreateComment: React.FC<CreateCommentProps> = ({ postId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Debes iniciar sesión para comentar.');
      return;
    }
    if (!commentText.trim()) {
      setError('El comentario no puede estar vacío.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const commentData = {
      userId: user.uid,
      authorName: user.displayName || 'Usuario Anónimo',
      text: commentText,
      createdAt: serverTimestamp(),
    };

    try {
      const postRef = doc(db, 'posts', postId);
      // Add comment to the 'comments' array and increment 'commentsCount'
      await updateDoc(postRef, {
        comments: arrayUnion(commentData), // Add comment to array
        commentsCount: increment(1),      // Increment counter
      });

      setCommentText(''); // Clear input
      if (onCommentAdded) {
        onCommentAdded(); // Call callback if provided
      }
      console.log('Comment added successfully');
    } catch (err: any) {
      setError('Error al añadir el comentario: ' + err.message);
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Escribe un comentario..."
        rows={2}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        disabled={submitting || !user}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={submitting || !commentText.trim() || !user}
        >
          {submitting ? 'Comentando...' : 'Comentar'}
        </button>
      </div>
    </form>
  );
};

export default CreateComment;