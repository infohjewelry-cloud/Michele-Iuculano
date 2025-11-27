
import React, { useState } from 'react';
import { InstallerProfile, Review } from '../types';

interface InstallerCardProps {
  installer: InstallerProfile;
  onLeaveReview: (installerId: string, review: Omit<Review, 'id' | 'date' | 'authorId'>) => void;
  onEditReview?: (installerId: string, reviewId: string, newRating: number, newComment: string) => void;
  onBook?: (installer: InstallerProfile) => void;
  isCustomer: boolean;
  currentUserId?: string;
}

const InstallerCard: React.FC<InstallerCardProps> = ({ 
  installer, 
  onLeaveReview, 
  onEditReview, 
  onBook, 
  isCustomer,
  currentUserId 
}) => {
  const [showReviews, setShowReviews] = useState(false);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isConfirmingReview, setIsConfirmingReview] = useState(false);

  // Edit Review State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);

  const averageRating = installer.reviews.length > 0
    ? (installer.reviews.reduce((acc, curr) => acc + curr.rating, 0) / installer.reviews.length).toFixed(1)
    : 'N/A';

  const handlePreSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    setIsConfirmingReview(true);
  };

  const handleConfirmReview = () => {
    onLeaveReview(installer.id, {
      authorName: "Cliente Verificato", // Will be overwritten by App logic usually, but kept for interface consistency
      rating: newReviewRating,
      comment: newReviewComment
    });
    setNewReviewComment('');
    setNewReviewRating(5);
    setIsConfirmingReview(false);
    alert('Recensione inviata!');
  };

  const handleCancelReview = () => {
    setIsConfirmingReview(false);
  };

  // Check if review is editable (within 24 hours)
  const canEditReview = (reviewDate: string, authorId: string) => {
    if (authorId !== currentUserId) return false;
    
    const now = new Date();
    const reviewTime = new Date(reviewDate);
    const diffInMs = now.getTime() - reviewTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    return diffInHours < 24;
  };

  const startEditing = (review: Review) => {
    setEditingReviewId(review.id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditComment('');
    setEditRating(5);
  };

  const saveEditedReview = (reviewId: string) => {
    if (onEditReview) {
      onEditReview(installer.id, reviewId, editRating, editComment);
      setEditingReviewId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 transition-all hover:shadow-lg flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <img src={installer.avatarUrl} alt={installer.name} className="w-16 h-16 rounded-full object-cover bg-gray-200 shadow-sm" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{installer.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 mt-1">
                <span className="font-medium text-blue-600 uppercase tracking-wide text-xs bg-blue-50 px-2 py-0.5 rounded">{installer.type}</span>
              </div>
              <div className="flex items-center text-slate-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {installer.location}
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${installer.isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {installer.isAvailable ? 'DISPONIBILE' : 'NON DISPONIBILE'}
          </div>
        </div>

        <div className="flex items-center text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg inline-flex">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold text-slate-700">{averageRating}</span>
            <span className="mx-1">•</span>
            <span>{installer.reviews.length} recensioni</span>
        </div>

        <p className="text-slate-600 text-sm italic border-l-4 border-slate-300 pl-3 mb-6 min-h-[3rem]">
          "{installer.bio}"
        </p>

        <div className="mb-6">
          <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">Prezzi Indicativi</h4>
          <ul className="space-y-2">
            {installer.services.slice(0, 3).map((service) => (
              <li key={service.id} className="flex justify-between text-sm items-center">
                <span className="text-slate-600 flex items-center gap-2">
                  {service.icon && <span className="text-base">{service.icon}</span>}
                  {service.name}
                </span>
                <span className="font-medium text-slate-900">{service.price.toFixed(2)} €</span>
              </li>
            ))}
            {installer.services.length > 3 && (
                <li className="text-xs text-blue-500 italic">+ altri {installer.services.length - 3} servizi</li>
            )}
            {installer.services.length === 0 && <li className="text-xs text-gray-400">Nessun servizio listato.</li>}
          </ul>
        </div>

        {isCustomer && installer.isAvailable && (
          <button 
            onClick={() => onBook && onBook(installer)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg shadow transition transform hover:scale-[1.02] flex items-center justify-center gap-2 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Prenota Intervento
          </button>
        )}

        <button 
          onClick={() => setShowReviews(!showReviews)}
          className="w-full text-center text-blue-600 text-sm font-medium hover:underline border-t border-slate-100 pt-3"
        >
          {showReviews ? 'Nascondi Recensioni' : 'Leggi Recensioni'}
        </button>

        {showReviews && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn bg-slate-50 -mx-6 -mb-6 p-6">
             {/* Existing Reviews */}
            <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
              {installer.reviews.map((rev) => (
                <div key={rev.id} className={`bg-white p-3 rounded-lg text-sm shadow-sm border ${editingReviewId === rev.id ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-100'}`}>
                  
                  {editingReviewId === rev.id ? (
                    // Edit Mode
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-800">Modifica Recensione</span>
                      </div>
                      <select 
                        value={editRating} 
                        onChange={(e) => setEditRating(Number(e.target.value))}
                        className="w-full rounded border-gray-300 p-1.5 text-xs mb-2"
                      >
                        <option value="5">5 ★★★★★</option>
                        <option value="4">4 ★★★★</option>
                        <option value="3">3 ★★★</option>
                        <option value="2">2 ★★</option>
                        <option value="1">1 ★</option>
                      </select>
                      <textarea 
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full rounded border-gray-300 p-2 text-sm mb-2"
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={cancelEditing} className="text-slate-500 text-xs px-2 py-1 hover:bg-slate-100 rounded">Annulla</button>
                        <button onClick={() => saveEditedReview(rev.id)} className="bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-700">Salva Modifiche</button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="font-bold text-slate-800">{rev.authorName}</span>
                          <span className="text-xs text-slate-400 block">{new Date(rev.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-yellow-500 font-bold text-xs">{rev.rating} ★</span>
                          
                          {/* Edit Button Logic */}
                          {currentUserId && canEditReview(rev.date, rev.authorId) && (
                            <button 
                              onClick={() => startEditing(rev)}
                              className="text-xs text-blue-500 hover:underline mt-1"
                            >
                              Modifica
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-600">{rev.comment}</p>
                    </div>
                  )}
                </div>
              ))}
              {installer.reviews.length === 0 && <p className="text-sm text-gray-500 text-center">Nessuna recensione ancora.</p>}
            </div>

            {/* Add Review Form */}
            {isCustomer && !editingReviewId && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 transition-all">
                {isConfirmingReview ? (
                   <div className="text-center animate-fadeIn">
                      <p className="text-slate-800 font-bold mb-2 text-sm">Confermi di voler pubblicare questa recensione?</p>
                      <p className="text-slate-600 text-xs italic mb-4">"{newReviewComment}"</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleCancelReview}
                          className="flex-1 bg-white text-slate-600 border border-slate-300 py-1.5 rounded text-sm font-medium hover:bg-slate-50"
                        >
                          Modifica
                        </button>
                        <button 
                          onClick={handleConfirmReview}
                          className="flex-1 bg-green-600 text-white py-1.5 rounded text-sm font-bold hover:bg-green-700 shadow-sm"
                        >
                          Conferma
                        </button>
                      </div>
                   </div>
                ) : (
                  <form onSubmit={handlePreSubmitReview}>
                    <h5 className="font-semibold text-sm mb-2 text-blue-800">Scrivi recensione</h5>
                    <div className="mb-2">
                      <select 
                        value={newReviewRating} 
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="w-full rounded border-gray-300 p-1.5 text-sm"
                      >
                        <option value="5">5 ★★★★★ Eccellente</option>
                        <option value="4">4 ★★★★ Molto buono</option>
                        <option value="3">3 ★★★ Normale</option>
                        <option value="2">2 ★★ Scarso</option>
                        <option value="1">1 ★ Pessimo</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <textarea 
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        required
                        rows={2}
                        className="w-full rounded border-gray-300 p-2 text-sm"
                        placeholder="Descrivi la tua esperienza..."
                      />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700 transition font-medium">
                      Pubblica
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallerCard;
