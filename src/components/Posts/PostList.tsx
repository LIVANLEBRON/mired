import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';

import { getAuth } from 'firebase/auth'; // Import getAuth
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore'; // Import Firestore update functions
import CreateComment from '../Comments/CreateComment'; // Import CreateComment

interface CommentData {
  userId: string;
  authorName: string;
  text: string;
  createdAt: any; // Firestore timestamp object
}

interface PostData {
  id: string;
  userId: string;
  content: string;
  createdAt: any; // Firestore timestamp object
  authorName: string;
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  comments: CommentData[];
}

const PostList: React.FC = () => {
  const auth = getAuth(); // Get auth instance
  const [posts, setPosts] = useState<PostData[]>([]);
  const [visibleComments, setVisibleComments] = useState<Record<string, boolean>>({}); // State to track visible comment sections
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = getFirestore();

  const handleLike = async (postId: string, likedBy: string[]) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not logged in to like posts');
      // Optionally: show an error message to the user
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const userId = user.uid;
    const alreadyLiked = likedBy.includes(userId);

    try {
      if (alreadyLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likedBy: arrayRemove(userId),
          likesCount: increment(-1),
        });
      } else {
        // Like the post
        await updateDoc(postRef, {
          likedBy: arrayUnion(userId),
          likesCount: increment(1),
        });
      }
    } catch (error) {
      console.error('Error updating like status:', error);
      setError('Error al actualizar el estado de Me Gusta.');
    }
  };

  const toggleComments = (postId: string) => {
    setVisibleComments(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc')); // Order by creation time, newest first

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsData: PostData[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as PostData);
      });
      setPosts(postsData);
      setLoading(false);
    }, (err) => {
      setError('Error al cargar las publicaciones: ' + err.message);
      console.error('Error fetching posts:', err);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [db]);

  if (loading) {
    return <div>Cargando publicaciones...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xl font-semibold mb-4">Publicaciones Recientes</h3>
      {posts.length === 0 ? (
        <p>No hay publicaciones todavía. ¡Sé el primero!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="p-4 bg-white shadow-md rounded-lg">
            <p className="text-gray-800 mb-2">{post.content}</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Publicado por {post.authorName} el {post.createdAt?.toDate().toLocaleString() || 'Fecha desconocida'}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleLike(post.id, post.likedBy)}
                  className={`text-gray-500 hover:text-indigo-600 disabled:opacity-50 ${auth.currentUser && post.likedBy.includes(auth.currentUser.uid) ? 'text-red-500' : ''}`}
                  disabled={!auth.currentUser}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={auth.currentUser && post.likedBy.includes(auth.currentUser.uid) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
                <span className="text-sm text-gray-600">{post.likesCount || 0}</span>
              </div>
            </div>
            {/* Comment Section */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button 
                onClick={() => toggleComments(post.id)}
                className="text-sm text-indigo-600 hover:text-indigo-800 mr-4"
              >
                {visibleComments[post.id] ? 'Ocultar' : 'Mostrar'} Comentarios ({post.commentsCount || 0})
              </button>
              {visibleComments[post.id] && (
                <div className="mt-2 space-y-2">
                  {/* Display existing comments */}
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded">
                        <p className="text-sm"><span className="font-semibold">{comment.authorName}:</span> {comment.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{comment.createdAt?.toDate().toLocaleString() || ''}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No hay comentarios aún.</p>
                  )}
                  {/* Add Comment Form */}
                  {auth.currentUser && <CreateComment postId={post.id} />}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PostList;