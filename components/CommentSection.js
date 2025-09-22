import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

// Komponen CommentSection untuk menampilkan dan menambah komentar
const CommentSection = ({ roomId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('');

  // Mengambil komentar dari Firestore secara real-time
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'comments'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = [];
      snapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() });
      });
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [roomId]);

  // Fungsi untuk menambah komentar baru
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !username.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        roomId,
        username: username.trim(),
        text: newComment.trim(),
        timestamp: serverTimestamp()
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment: ', error);
      alert('Gagal menambah komentar. Silakan coba lagi.');
    }
  };

  // Format timestamp untuk ditampilkan
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="comment-section mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Komentar</h2>
      
      <form onSubmit={handleAddComment} className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nama Anda"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tambahkan komentar..."
            className="flex-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
          >
            Kirim
          </button>
        </div>
      </form>
      
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada komentar. Jadilah yang pertama!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="comment-username">{comment.username}</span>
                  <p className="text-gray-700 mt-1">{comment.text}</p>
                </div>
                <span className="comment-time ml-2 whitespace-nowrap">{formatTime(comment.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
