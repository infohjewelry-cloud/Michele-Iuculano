
import React, { useState, useEffect } from 'react';
import { User, UserRole, InstallerProfile, SUBSCRIPTION_PRICES, Review, ServicePrice, Booking, BookingStatus, AppNotification, Post, Comment, BigOpportunity, Supplier, InstallerType, PlatformReview } from './types';
import InstallerCard from './components/InstallerCard';
import { generateProfessionalBio } from './services/geminiService';

// --- Constants ---
const SERVICE_ICONS = ['🔧', '💧', '⚡', '🔨', '🚿', '🔌', '🏠', '🛁', '❄️', '🔥', '💡', '🚽', '🧹', '📏'];

// --- Components defined within App to share state easily for this demo ---

// 0. Notification Toast Component
const NotificationToast: React.FC<{
  notification: AppNotification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto dismiss after 5s
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  let bgColor = 'bg-blue-600';
  let icon = 'ℹ️';

  if (notification.type === 'success') {
    bgColor = 'bg-green-600';
    icon = '✅';
  } else if (notification.type === 'alert') {
    bgColor = 'bg-orange-500';
    icon = '🔔';
  }

  return (
    <div className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 z-[100] ${bgColor} text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 transform transition-all duration-500 animate-bounce-in`}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <h4 className="font-bold text-sm uppercase tracking-wider opacity-90">Nuova Notifica</h4>
        <p className="text-sm font-medium mt-1">{notification.message}</p>
      </div>
      <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
    </div>
  );
};

// 0.1 Admin Login Modal (Security Layer)
const AdminLoginModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Idroproject06!') {
      onSuccess();
    } else {
      setError('Password errata. Accesso negato.');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-700">
        <div className="bg-slate-900 p-6 text-center border-b border-slate-800">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl border border-slate-700">
            🔐
          </div>
          <h3 className="text-white font-bold text-lg">Area Riservata Admin</h3>
          <p className="text-slate-400 text-xs mt-1">Inserisci le credenziali di sicurezza</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password Amministratore</label>
            <input 
              type="password" 
              autoFocus
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none transition"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
            />
            {error && <p className="text-red-600 text-xs mt-2 font-bold flex items-center gap-1">🚫 {error}</p>}
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition text-sm"
            >
              Annulla
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 shadow-lg transition text-sm"
            >
              Accedi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 0.12 Forgot Password Modal
const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'customer' | 'installer'>('customer');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[210] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">✕</button>
        
        <div className="bg-slate-50 p-6 text-center border-b border-slate-100">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl text-blue-600">
            🔑
          </div>
          <h3 className="text-slate-900 font-bold text-lg">Recupero Credenziali</h3>
          <p className="text-slate-500 text-sm mt-1">Inserisci la tua email per reimpostare la password.</p>
        </div>

        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center animate-fadeIn">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-green-600">
                ✅
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Email Inviata!</h4>
              <p className="text-slate-600 text-sm mb-6">
                Abbiamo inviato le istruzioni per il reset della password all'indirizzo <strong>{email}</strong>. Controlla anche nello spam.
              </p>
              <button 
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 shadow transition"
              >
                Torna alla Home
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sei un...</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === 'customer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Cliente
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('installer')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${role === 'installer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Installatore
                    </button>
                  </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Registrata</label>
                 <input 
                   type="email" 
                   required
                   className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="nome@email.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   disabled={status === 'submitting'}
                 />
               </div>

               <button 
                 type="submit" 
                 disabled={status === 'submitting'}
                 className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition flex items-center justify-center gap-2"
               >
                 {status === 'submitting' ? (
                   <>
                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Invio in corso...
                   </>
                 ) : 'Recupera Password'}
               </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// 0.15 Platform Review Modal (User Submit)
const PlatformReviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, name?: string, role?: string) => void;
  isGuest?: boolean;
}> = ({ isOpen, onClose, onSubmit, isGuest }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  // Guest states
  const [name, setName] = useState('');
  const [role, setRole] = useState('Cliente');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, comment, isGuest ? name : undefined, isGuest ? role : undefined);
    setComment('');
    setRating(5);
    if (isGuest) {
        setName('');
        setRole('Cliente');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">⭐ Valuta FixPro</h3>
          <button onClick={onClose} className="text-blue-100 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-slate-600 text-sm mb-4">
            La tua opinione è fondamentale per migliorare il servizio. Dicci cosa ne pensi!
          </p>
          
          <div className="mb-4 text-center">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase">
              {rating === 5 ? 'Eccellente' : rating === 4 ? 'Molto Buono' : rating === 3 ? 'Buono' : rating === 2 ? 'Discreto' : 'Insufficiente'}
            </span>
          </div>

          {isGuest && (
             <div className="grid grid-cols-2 gap-3 mb-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Il tuo Nome</label>
                    <input 
                      required={isGuest}
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sei un...</label>
                    <select
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="Cliente">Cliente</option>
                        <option value="Installatore">Installatore</option>
                        <option value="Altro">Altro</option>
                    </select>
                 </div>
             </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">La tua esperienza</label>
            <textarea 
              required
              rows={3}
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Cosa ti piace? Cosa possiamo migliorare?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 shadow-md transition"
          >
            Invia Recensione
          </button>
        </form>
      </div>
    </div>
  );
};

// 0.16 Admin Platform Review Modal (Edit Mode)
const AdminPlatformReviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  review: PlatformReview | null;
  onSave: (review: PlatformReview) => void;
}> = ({ isOpen, onClose, review, onSave }) => {
  const [authorName, setAuthorName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (review) {
      setAuthorName(review.authorName);
      setRole(review.role);
      setRating(review.rating);
      setComment(review.comment);
      setDate(review.date.split('T')[0]);
    }
  }, [review, isOpen]);

  if (!isOpen || !review) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...review,
      authorName,
      role,
      rating,
      comment,
      date: new Date(date).toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[160] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
        <div className="bg-slate-800 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">✏️ Modifica Recensione Sito</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Autore</label>
              <input 
                required className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                value={authorName} onChange={e => setAuthorName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ruolo</label>
              <input 
                required className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                value={role} onChange={e => setRole(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
              <input 
                type="date"
                required className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                value={date} onChange={e => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Voto (1-5)</label>
              <input 
                type="number" min="1" max="5"
                required className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                value={rating} onChange={e => setRating(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Commento</label>
            <textarea 
              required rows={4}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              value={comment} onChange={e => setComment(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-slate-800 transition">
            Salva Modifiche
          </button>
        </form>
      </div>
    </div>
  );
};


// 0.2 FAQ Item Component
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left focus:outline-none bg-white"
      >
        <span className="font-bold text-slate-800 text-sm md:text-base">{question}</span>
        <svg 
          className={`w-5 h-5 text-blue-600 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className={`px-4 bg-slate-50 text-slate-600 text-sm leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-48 py-4 border-t border-slate-100' : 'max-h-0 py-0'}`}
      >
        {answer}
      </div>
    </div>
  );
};

// 0.5 Generic Confirmation Dialog
const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Annulla
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 shadow-lg transition"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};

// 0.7 Opportunity Management Modal (New)
const OpportunityModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (opp: Omit<BigOpportunity, 'id' | 'postedDate' | 'applicants' | 'authorId'>) => void;
  initialData?: BigOpportunity | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [type, setType] = useState<InstallerType | 'both'>('both');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setLocation(initialData.location);
      setBudgetRange(initialData.budgetRange);
      setType(initialData.type);
    } else {
      setTitle('');
      setDescription('');
      setLocation('');
      setBudgetRange('');
      setType('both');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, location, budgetRange, type });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[105] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
        <div className="bg-indigo-900 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">{initialData ? 'Modifica Opportunità' : 'Nuova Opportunità'}</h3>
          <button onClick={onClose} className="text-indigo-200 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titolo Annuncio</label>
            <input 
              required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={title} onChange={e => setTitle(e.target.value)} placeholder="Es. Rifacimento impianto 20 appartamenti"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrizione Dettagliata</label>
            <textarea 
              required rows={3} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrivi il lavoro, requisiti richiesti..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Luogo / Cantiere</label>
              <input 
                required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" 
                value={location} onChange={e => setLocation(e.target.value)} placeholder="Es. Milano Nord"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Budget Stimato</label>
              <input 
                required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" 
                value={budgetRange} onChange={e => setBudgetRange(e.target.value)} placeholder="Es. 10k - 15k €"
              />
            </div>
          </div>
          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Settore Richiesto</label>
             <select 
               className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white"
               value={type} onChange={e => setType(e.target.value as any)}
             >
               <option value="both">Entrambi (Idraulico & Elettricista)</option>
               <option value="idraulico">Solo Idraulico</option>
               <option value="elettricista">Solo Elettricista</option>
             </select>
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition">
            {initialData ? 'Salva Modifiche' : 'Pubblica Opportunità'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 0.9 Supplier Management Modal (New)
const SupplierModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, 'id'>) => void;
  initialData?: Supplier | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'idraulica' | 'elettrico' | 'generale'>('generale');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setDiscount(initialData.discount);
      setLocation(initialData.location);
      setWebsite(initialData.website);
      setLogoUrl(initialData.logoUrl);
    } else {
      setName('');
      setCategory('generale');
      setDescription('');
      setDiscount('');
      setLocation('');
      setWebsite('');
      setLogoUrl('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, category, description, discount, location, website, logoUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[106] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
        <div className="bg-slate-800 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">{initialData ? 'Modifica Fornitore' : 'Nuovo Fornitore Partner'}</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Azienda</label>
                <input required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" 
                  value={name} onChange={e => setName(e.target.value)} placeholder="Es. IdroMarket" />
            </div>
            <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                 <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white"
                   value={category} onChange={e => setCategory(e.target.value as any)}>
                   <option value="idraulica">Idraulica</option>
                   <option value="elettrico">Elettrico</option>
                   <option value="generale">Generale</option>
                 </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sconto Offerto</label>
                <input required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" 
                  value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Es. -20% listino" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrizione</label>
            <textarea required rows={2} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" 
              value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrizione breve prodotti..." />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Indirizzo Punto Vendita</label>
             <input required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" 
               value={location} onChange={e => setLocation(e.target.value)} placeholder="Via Roma 1, Città" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sito Web</label>
                <input required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" 
                  value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.sito.it" />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL Logo</label>
                <input className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" 
                  value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
             </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-md transition">
            {initialData ? 'Aggiorna Fornitore' : 'Aggiungi Fornitore'}
          </button>
        </form>
      </div>
    </div>
  );
};


// 0.8 Supplier Inquiry Modal (New B2B Flow)
const SupplierInquiryModal: React.FC<{
  onClose: () => void;
  onSubmit: () => void;
}> = ({ onClose, onSubmit }) => {
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('generale');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call to Customer Service CRM
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="bg-slate-800 px-8 py-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-overlay filter blur-2xl opacity-20 -mr-10 -mt-10"></div>
          <h2 className="text-2xl font-bold mb-1">Diventa Partner</h2>
          <p className="text-slate-300 text-sm">Unisciti al network di fornitori FixPro.</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800 leading-relaxed">
              <span className="font-bold">ℹ️ Processo di verifica:</span> Per garantire la qualità agli installatori, ogni richiesta di partnership viene valutata manualmente dal nostro servizio clienti.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Ragione Sociale</label>
            <input 
              type="text" 
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Es. Rossi Forniture S.r.l."
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Partita IVA</label>
            <input 
              type="text" 
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="IT00000000000"
              value={vatNumber}
              onChange={e => setVatNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email Aziendale</label>
                <input 
                type="email" 
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="info@azienda.it"
                value={email}
                onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Settore</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                    <option value="idraulica">Idraulica</option>
                    <option value="elettrico">Elettrico</option>
                    <option value="generale">Edilizia/Altro</option>
                </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? 'Invio in corso...' : 'Invia Candidatura'}
          </button>
          
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Inviando la richiesta accetti di essere ricontattato dal nostro reparto commerciale.
          </p>
        </form>
      </div>
    </div>
  );
};

// 1. Subscription Modal
const SubscriptionModal: React.FC<{ 
  role: UserRole; 
  onSubscribe: () => void; 
}> = ({ role, onSubscribe }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Determine price based on role and cycle
  let price = 0;
  if (role === 'customer') {
    price = billingCycle === 'monthly' ? SUBSCRIPTION_PRICES.customer : SUBSCRIPTION_PRICES.customerYearly;
  } else {
    price = billingCycle === 'monthly' ? SUBSCRIPTION_PRICES.installer : SUBSCRIPTION_PRICES.installerYearly;
  }

  // Calculate monthly equivalent for yearly plan display
  const monthlyEquivalent = (price / 12).toFixed(2);
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Abbonamento {role === 'customer' ? 'Cliente' : 'Installatore'}</h2>
        <p className="text-slate-600 mb-6">
          Sblocca l'accesso completo alla piattaforma FixPro.
        </p>

        <div className="flex bg-slate-100 p-1 rounded-lg mb-6 relative">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${billingCycle === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mensile
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all relative ${billingCycle === 'yearly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Annuale
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
              RISPARMIA
            </span>
          </button>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100 transition-all duration-300">
          <div className="flex justify-center items-end gap-1">
            <span className="text-4xl font-extrabold text-blue-600">€{price}</span>
            <span className="text-slate-500 mb-1">/{billingCycle === 'monthly' ? 'mese' : 'anno'}</span>
          </div>
          {billingCycle === 'yearly' && (
             <p className="text-green-600 text-xs font-bold mt-2 bg-green-50 inline-block px-2 py-1 rounded">
               Solo €{monthlyEquivalent} al mese!
             </p>
          )}
          <ul className="mt-4 text-left space-y-2 text-sm text-slate-600">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span> {role === 'customer' ? 'Cerca professionisti illimitati' : 'Visibilità massima'}
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span> {role === 'customer' ? 'Leggi e scrivi recensioni' : 'Gestisci disponibilità e prezzi'}
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span> Cancellazione gratuita
            </li>
          </ul>
        </div>

        <button 
          onClick={onSubscribe}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-[1.02] active:scale-95"
        >
          Attiva Abbonamento {billingCycle === 'yearly' ? 'Annuale' : 'Mensile'}
        </button>
        <p className="mt-4 text-xs text-slate-400">Pagamento sicuro simulato per la demo.</p>
      </div>
    </div>
  );
};

// 1.5 Booking Modal
const BookingModal: React.FC<{
  installer: InstallerProfile;
  customerName: string;
  onClose: () => void;
  onSubmit: (bookingData: { date: string; serviceName: string; notes: string }) => Promise<void>;
}> = ({ installer, customerName, onClose, onSubmit }) => {
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [date, setDate] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [customService, setCustomService] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // States for robust error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Helper to find price for summary
  const getSelectedServicePrice = () => {
    const s = installer.services.find(s => s.name === serviceName);
    return s ? `€${s.price.toFixed(2)}` : (serviceName === 'altro' ? 'Da concordare' : '');
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    if (!date) return;
    const finalService = serviceName === 'altro' ? customService : serviceName;
    if (!finalService) return;
    
    setStep('confirm');
  };

  const handleFinalSubmit = async () => {
     const finalService = serviceName === 'altro' ? customService : serviceName;
     setIsSubmitting(true);
     setSubmissionError(null);
     
     try {
       await onSubmit({ date, serviceName: finalService, notes });
       onClose();
     } catch (err) {
       console.error(err);
       setSubmissionError("Si è verificato un errore durante l'invio della prenotazione. Riprova più tardi.");
     } finally {
       setIsSubmitting(false);
     }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">
            {step === 'form' ? `Prenota ${installer.name}` : 'Conferma Prenotazione'}
          </h3>
          <button onClick={onClose} disabled={isSubmitting} className="text-slate-400 hover:text-white disabled:opacity-50">✕</button>
        </div>
        
        {step === 'form' ? (
          <form onSubmit={handleNext} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Richiesta</label>
              <input 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo di Intervento</label>
              <select 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
              >
                <option value="">Seleziona un servizio...</option>
                {installer.services.map(s => (
                  <option key={s.id} value={s.name}>{s.name} - €{s.price}</option>
                ))}
                <option value="altro">Altro / Non in lista</option>
              </select>
              
              {serviceName === 'altro' && (
                <input 
                  type="text" 
                  placeholder="Specifica il tipo di intervento..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Note / Dettagli Problema</label>
              <textarea 
                rows={3}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Descrivi brevemente il problema..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                Annulla
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md"
              >
                Avanti
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-5">
            {submissionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                <strong className="font-bold">Errore! </strong>
                <span className="block sm:inline">{submissionError}</span>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2 font-semibold">Riepilogo Richiesta</p>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between border-b border-yellow-100 pb-1">
                  <span className="text-slate-500">Tecnico:</span>
                  <span className="font-bold">{installer.name}</span>
                </div>
                <div className="flex justify-between border-b border-yellow-100 pb-1">
                  <span className="text-slate-500">Data:</span>
                  <span className="font-bold">{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-yellow-100 pb-1">
                  <span className="text-slate-500">Intervento:</span>
                  <span className="font-bold">{serviceName === 'altro' ? customService : serviceName}</span>
                </div>
                <div className="flex justify-between border-b border-yellow-100 pb-1">
                  <span className="text-slate-500">Costo Stimato:</span>
                  <span className="font-bold text-green-600">{getSelectedServicePrice()}</span>
                </div>
                {notes && (
                  <div className="pt-1">
                    <span className="text-slate-500 block text-xs mb-1">Note:</span>
                    <p className="italic bg-white/50 p-2 rounded border border-yellow-100">{notes}</p>
                  </div>
                )}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group bg-slate-50 p-3 rounded border border-slate-100 hover:bg-slate-100 transition">
              <input 
                type="checkbox" 
                className="mt-1 rounded text-blue-600 focus:ring-blue-500 w-4 h-4" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span className="text-xs text-slate-600 group-hover:text-slate-800">
                Confermo che i dati inseriti sono corretti e accetto di essere ricontattato dal professionista per finalizzare l'intervento.
              </span>
            </label>

            <div className="pt-2 flex gap-3">
              <button 
                type="button" 
                onClick={() => setStep('form')}
                disabled={isSubmitting}
                className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium disabled:opacity-50"
              >
                Indietro
              </button>
              <button 
                type="button" 
                onClick={handleFinalSubmit}
                disabled={isSubmitting || !acceptedTerms}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Invio...
                  </>
                ) : (
                  <>✅ Conferma</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 1.9 Suppliers Section
const SuppliersSection: React.FC<{
  suppliers: Supplier[];
  onAdd?: () => void;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (id: string) => void;
}> = ({ suppliers, onAdd, onEdit, onDelete }) => {
  const [filter, setFilter] = useState<'all' | 'idraulica' | 'elettrico'>('all');

  const filteredSuppliers = suppliers.filter(s => filter === 'all' || s.category === filter);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
             <h2 className="text-xl font-bold flex items-center gap-2">
               🛒 Fornitori Partner
             </h2>
             <p className="text-slate-300 text-sm mt-1">Sconti esclusivi su materiali elettrici e idraulici per gli abbonati.</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-pulse h-fit self-center">
              SCONTI ATTIVI
            </span>
            {onAdd && (
              <button 
                onClick={onAdd}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-lg border border-white/20 transition flex items-center gap-1"
              >
                + Aggiungi
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-xs font-bold transition ${filter === 'all' ? 'bg-white text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Tutti
          </button>
          <button 
            onClick={() => setFilter('idraulica')}
            className={`px-3 py-1 rounded text-xs font-bold transition ${filter === 'idraulica' ? 'bg-white text-blue-600' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Idraulica
          </button>
          <button 
            onClick={() => setFilter('elettrico')}
            className={`px-3 py-1 rounded text-xs font-bold transition ${filter === 'elettrico' ? 'bg-white text-yellow-600' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            Elettrico
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition flex flex-col h-full bg-white relative group">
             
             {/* Edit/Delete Controls for Admin */}
             {onEdit && onDelete && (
               <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button onClick={() => onEdit(supplier)} className="p-1 bg-slate-100 hover:bg-white text-slate-500 hover:text-blue-600 rounded border border-slate-200 shadow-sm" title="Modifica">✏️</button>
                 <button onClick={() => onDelete(supplier.id)} className="p-1 bg-red-50 hover:bg-red-100 text-red-500 rounded border border-red-100 shadow-sm" title="Elimina">🗑️</button>
               </div>
             )}

             <div className="flex gap-4 items-start flex-1">
                <img src={supplier.logoUrl} alt={supplier.name} className="w-16 h-16 object-contain bg-slate-50 rounded-md p-1 border border-slate-100" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 leading-tight">{supplier.name}</h3>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${supplier.category === 'elettrico' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                          {supplier.category}
                        </span>
                      </div>
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded whitespace-nowrap mr-6 md:mr-0">
                        {supplier.discount}
                      </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 mb-2 line-clamp-2">{supplier.description}</p>
                </div>
             </div>
             
             <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Punto Vendita</span>
                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                      📍 {supplier.location}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1 border border-blue-100"
                    >
                      🌐 Sito Web
                    </a>
                    <button className="text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm">
                      Rivela Codice
                    </button>
                  </div>
             </div>
          </div>
        ))}
        {filteredSuppliers.length === 0 && (
          <div className="col-span-2 text-center py-8 text-slate-400 italic">
            Nessun fornitore trovato in questa categoria.
          </div>
        )}
      </div>
    </div>
  );
};

// 1.8 Community Section
const CommunitySection: React.FC<{
  posts: Post[];
  currentUser: User;
  onAddPost: (post: Omit<Post, 'id' | 'date' | 'likes' | 'comments'>) => void;
  onAddComment: (postId: string, comment: string) => void;
}> = ({ posts, currentUser, onAddPost, onAddComment }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<Post['category']>('consiglio');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPost({
      authorId: currentUser.id,
      authorName: currentUser.name,
      title: newTitle,
      content: newContent,
      category: newCategory
    });
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  const handleCommentSubmit = (postId: string) => {
    if (!commentText.trim()) return;
    onAddComment(postId, commentText);
    setCommentText('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Community Clienti</h2>
          <p className="text-slate-500">Confrontati con altri utenti su prezzi e lavori.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
        >
          {isCreating ? 'Annulla' : '+ Nuovo Post'}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8 animate-fadeIn">
          <h3 className="font-bold text-lg mb-4 text-slate-800">Crea una discussione</h3>
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Titolo</label>
              <input 
                type="text" 
                required
                placeholder="Es. Quanto costa rifare un bagno?"
                className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-indigo-500"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                 <select 
                   className="w-full border-gray-300 rounded-lg p-2 border"
                   value={newCategory}
                   onChange={e => setNewCategory(e.target.value as any)}
                 >
                   <option value="consiglio">Consiglio</option>
                   <option value="prezzi">Prezzi & Preventivi</option>
                   <option value="esperienza">Esperienze</option>
                   <option value="altro">Altro</option>
                 </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Messaggio</label>
              <textarea 
                required
                rows={4}
                placeholder="Scrivi qui la tua domanda o esperienza..."
                className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-indigo-500"
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800">Pubblica</button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide mb-2 
                     ${post.category === 'prezzi' ? 'bg-green-100 text-green-700' : 
                       post.category === 'consiglio' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                     {post.category}
                   </span>
                   <h3 className="text-xl font-bold text-slate-800">{post.title}</h3>
                </div>
                <span className="text-xs text-slate-400">{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-600 mb-4 leading-relaxed">{post.content}</p>
              
              <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    {post.authorName.charAt(0)}
                  </div>
                  <span>{post.authorName}</span>
                </div>
                <button 
                  onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1 hover:text-indigo-600 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {post.comments.length} Commenti
                </button>
              </div>
            </div>

            {expandedPostId === post.id && (
              <div className="bg-slate-50 p-5 border-t border-slate-200">
                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                  {post.comments.length === 0 ? (
                    <p className="text-center text-slate-400 italic text-sm">Nessun commento ancora. Sii il primo!</p>
                  ) : (
                    post.comments.map(comment => (
                      <div key={comment.id} className="bg-white p-3 rounded-lg border border-slate-100 text-sm shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-slate-800">{comment.authorName}</span>
                          <span className="text-xs text-slate-400">{new Date(comment.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Scrivi un commento..." 
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                  />
                  <button 
                    onClick={() => handleCommentSubmit(post.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
                  >
                    Invia
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Installer Dashboard
const InstallerDashboard: React.FC<{ 
  user: User; 
  updateProfile: (p: Partial<InstallerProfile>) => void;
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  bigOpportunities: BigOpportunity[];
  onApplyToOpportunity: (oppId: string) => void;
  suppliers: Supplier[];
  onSaveOpportunity: (opp: Omit<BigOpportunity, 'id' | 'postedDate' | 'applicants' | 'authorId'>, existingId?: string) => void;
  onDeleteOpportunity: (oppId: string) => void;
  onSaveSupplier: (supplier: Omit<Supplier, 'id'>, existingId?: string) => void;
  onDeleteSupplier: (supplierId: string) => void;
  platformReviews: PlatformReview[];
  onSavePlatformReview: (review: PlatformReview) => void;
  onDeletePlatformReview: (reviewId: string) => void;
}> = ({ user, updateProfile, bookings, onUpdateBookingStatus, bigOpportunities, onApplyToOpportunity, suppliers, onSaveOpportunity, onDeleteOpportunity, onSaveSupplier, onDeleteSupplier, platformReviews, onSavePlatformReview, onDeletePlatformReview }) => {
  if (!user.profile) return null;

  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceIcon, setServiceIcon] = useState('🔧');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [experienceInput, setExperienceInput] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Opportunity Management State
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<BigOpportunity | null>(null);

  // Supplier Management State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Platform Review Management State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PlatformReview | null>(null);

  // Filter bookings for this installer
  const myBookings = bookings.filter(b => b.installerId === user.profile?.id);
  const pendingBookings = myBookings.filter(b => b.status === 'pending');
  const pastBookings = myBookings.filter(b => b.status !== 'pending');

  const handleAddService = () => {
    if (!serviceName || !servicePrice) return;
    const newService: ServicePrice = {
      id: Date.now().toString(),
      name: serviceName,
      price: parseFloat(servicePrice),
      icon: serviceIcon
    };
    updateProfile({
      services: [...user.profile!.services, newService]
    });
    setServiceName('');
    setServicePrice('');
    setServiceIcon('🔧');
  };

  const handleRemoveService = (id: string) => {
    updateProfile({
      services: user.profile!.services.filter(s => s.id !== id)
    });
  };

  const handleGenerateBio = async () => {
    if (!user.profile) return;
    setIsGeneratingBio(true);
    const bio = await generateProfessionalBio(
      user.profile.name, 
      user.profile.type, 
      experienceInput || "5 anni", 
      "Affidabilità, Rapidità, Onestà"
    );
    updateProfile({ bio });
    setIsGeneratingBio(false);
  };
  
  const openNewOppModal = () => {
    setEditingOpp(null);
    setIsOppModalOpen(true);
  };

  const openEditOppModal = (opp: BigOpportunity) => {
    setEditingOpp(opp);
    setIsOppModalOpen(true);
  };

  const openNewSupplierModal = () => {
    setEditingSupplier(null);
    setIsSupplierModalOpen(true);
  };

  const openEditSupplierModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setIsSupplierModalOpen(true);
  };

  const openEditReviewModal = (review: PlatformReview) => {
    setEditingReview(review);
    setIsReviewModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">

      {/* Opportunity Modal */}
      <OpportunityModal 
        isOpen={isOppModalOpen}
        onClose={() => setIsOppModalOpen(false)}
        onSave={(data) => onSaveOpportunity(data, editingOpp?.id)}
        initialData={editingOpp}
      />

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSave={(data) => onSaveSupplier(data, editingSupplier?.id)}
        initialData={editingSupplier}
      />

      {/* Admin Review Modal */}
      <AdminPlatformReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        review={editingReview}
        onSave={onSavePlatformReview}
      />

      {/* BIG OPPORTUNITIES SECTION */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl shadow-lg overflow-hidden border border-indigo-500/50">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
             <div>
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <span className="text-2xl">🚀</span> Grandi Opportunità
               </h2>
               <p className="text-indigo-200 text-sm mt-1">
                 Trova subappalti o pubblica lavori per colleghi.
               </p>
             </div>
             <div className="flex gap-2">
                <span className="bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-2 rounded-full uppercase tracking-wider h-fit self-center">
                  Premium
                </span>
                {/* RESTRICTED TO ADMIN */}
                {user.isAdmin && (
                  <button 
                    onClick={openNewOppModal}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-1 transition animate-pulse border border-white/30"
                  >
                    + Pubblica (Admin)
                  </button>
                )}
             </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {bigOpportunities.filter(o => o.type === 'both' || o.type === user.profile?.type || o.authorId === user.profile?.id || user.isAdmin).map(opp => {
              const hasApplied = opp.applicants.includes(user.profile!.id);
              
              return (
                <div key={opp.id} className={`backdrop-blur-md border rounded-lg p-4 transition relative group ${user.isAdmin ? 'bg-indigo-800/40 border-indigo-400' : 'bg-white/10 border-white/20 hover:bg-white/15'}`}>
                  
                  {/* RESTRICTED TO ADMIN */}
                  {user.isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 transition-opacity">
                      <button onClick={() => openEditOppModal(opp)} className="p-1 bg-white/20 hover:bg-white/40 rounded text-white" title="Modifica">✏️</button>
                      <button onClick={() => onDeleteOpportunity(opp.id)} className="p-1 bg-red-500/50 hover:bg-red-500 rounded text-white" title="Elimina">🗑️</button>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white pr-6">{opp.title}</h3>
                    {!user.isAdmin && <span className="text-xs text-indigo-200 bg-indigo-900/50 px-2 py-0.5 rounded whitespace-nowrap">{opp.location}</span>}
                  </div>
                  {user.isAdmin && <span className="text-xs text-indigo-300 block mb-2">📍 {opp.location} (Visibile come Admin)</span>}

                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{opp.description}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      💰 {opp.budgetRange}
                    </span>
                    <span className="flex items-center gap-1">
                      📅 {new Date(opp.postedDate).toLocaleDateString()}
                    </span>
                    {user.isAdmin && (
                       <span className="flex items-center gap-1 text-green-400">
                         👥 {opp.applicants.length} Candidati
                       </span>
                    )}
                  </div>

                  {!user.isAdmin ? (
                    <button 
                      onClick={() => onApplyToOpportunity(opp.id)}
                      disabled={hasApplied}
                      className={`w-full py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2
                        ${hasApplied 
                          ? 'bg-green-500/20 text-green-300 cursor-not-allowed border border-green-500/50' 
                          : 'bg-yellow-400 hover:bg-yellow-300 text-slate-900 shadow-lg'}`}
                    >
                      {hasApplied ? (
                        <>✅ Candidatura Inviata</>
                      ) : (
                        <>Candidati Ora</>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2 text-center text-indigo-200 text-xs italic border border-dashed border-indigo-500/30 rounded-lg">
                      Modalità Amministratore
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SUPPLIERS SECTION with CRUD - RESTRICTED TO ADMIN */}
      <SuppliersSection 
        suppliers={suppliers} 
        onAdd={user.isAdmin ? openNewSupplierModal : undefined}
        onEdit={user.isAdmin ? openEditSupplierModal : undefined}
        onDelete={user.isAdmin ? onDeleteSupplier : undefined}
      />

      {/* ADMIN PLATFORM REVIEWS SECTION */}
      {user.isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 p-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              ⭐ Amministrazione Recensioni Sito
            </h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-4 py-3">Autore</th>
                    <th className="px-4 py-3">Ruolo</th>
                    <th className="px-4 py-3">Voto</th>
                    <th className="px-4 py-3">Commento</th>
                    <th className="px-4 py-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {platformReviews.map(review => (
                    <tr key={review.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{review.authorName}</td>
                      <td className="px-4 py-3 text-slate-600">{review.role}</td>
                      <td className="px-4 py-3 text-yellow-500 font-bold">{review.rating} ★</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => openEditReviewModal(review)} className="text-blue-600 hover:text-blue-800 font-bold text-xs">Modifica</button>
                        <button onClick={() => onDeletePlatformReview(review.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">Elimina</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Management Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          Richieste di Lavoro
          {pendingBookings.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              {pendingBookings.length} Nuove
            </span>
          )}
        </h2>

        {pendingBookings.length === 0 && pastBookings.length === 0 ? (
           <p className="text-slate-500 italic text-sm">Non hai ancora ricevuto richieste.</p>
        ) : (
          <div className="space-y-4">
            {/* Pending Requests */}
            {pendingBookings.map(booking => (
              <div key={booking.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 transition hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800">{booking.customerName}</h4>
                    <p className="text-sm text-slate-600">{booking.serviceName}</p>
                  </div>
                  <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded font-medium">
                    In Attesa
                  </span>
                </div>
                <div className="text-sm text-slate-600 mb-4 flex items-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   {new Date(booking.date).toLocaleDateString()}
                </div>
                {booking.notes && (
                  <p className="text-sm bg-white/50 p-2 rounded mb-4 text-slate-700 italic border border-yellow-100">
                    "{booking.notes}"
                  </p>
                )}
                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => onUpdateBookingStatus(booking.id, 'accepted')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    Accetta
                  </button>
                  <button 
                    onClick={() => onUpdateBookingStatus(booking.id, 'rejected')}
                    className="flex-1 bg-white text-slate-600 border border-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                  >
                    Rifiuta
                  </button>
                </div>
              </div>
            ))}

            {/* Past/Processed Requests Accordion */}
            {pastBookings.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className="w-full flex justify-between items-center group focus:outline-none"
                >
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide group-hover:text-slate-700 transition-colors">
                    Storico ({pastBookings.length})
                  </h4>
                  <svg 
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isHistoryOpen ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isHistoryOpen && (
                  <div className="space-y-2 opacity-75 mt-4 animate-fadeIn">
                    {pastBookings.map(booking => (
                      <div key={booking.id} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                        <div className="text-sm">
                          <span className="font-medium text-slate-700">{booking.customerName}</span>
                          <span className="text-slate-400 mx-2">•</span>
                          <span className="text-slate-500">{new Date(booking.date).toLocaleDateString()}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${booking.status === 'accepted' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                          {booking.status === 'accepted' ? 'ACCETTATO' : 'RIFIUTATO'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Gestione Profilo</h2>
        
        {/* Availability Toggle */}
        <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-lg">
          <div>
            <span className="font-semibold text-slate-700">Stato Disponibilità</span>
            <p className="text-sm text-slate-500">Renditi visibile ai clienti ora.</p>
          </div>
          <button
            onClick={() => updateProfile({ isAvailable: !user.profile!.isAvailable })}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${user.profile.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${user.profile.isAvailable ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Avatar URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Foto Profilo (URL)</label>
          <div className="flex items-center gap-4">
            <img 
              src={user.profile.avatarUrl || 'https://via.placeholder.com/150'} 
              alt="Anteprima" 
              className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-100"
            />
            <input
              type="text"
              className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2 border"
              value={user.profile.avatarUrl}
              onChange={(e) => updateProfile({ avatarUrl: e.target.value })}
              placeholder="Incolla qui l'URL della tua foto..."
            />
          </div>
        </div>

        {/* Location Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Città / Zona Operativa</label>
          <input
            type="text"
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2 border"
            value={user.profile.location}
            onChange={(e) => updateProfile({ location: e.target.value })}
            placeholder="Es. Roma, Milano Nord, Tutta Italia..."
          />
        </div>

        {/* Bio Section with AI */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">La tua Biografia</label>
          <div className="flex gap-2 mb-2">
            <textarea
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2 border"
              rows={3}
              value={user.profile.bio}
              onChange={(e) => updateProfile({ bio: e.target.value })}
              placeholder="Descrivi la tua esperienza..."
            />
          </div>
          <div className="flex gap-2 items-center bg-blue-50 p-3 rounded-lg">
            <input 
              type="text" 
              placeholder="Anni di esperienza (per AI)" 
              className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
              value={experienceInput}
              onChange={(e) => setExperienceInput(e.target.value)}
            />
            <button
              onClick={handleGenerateBio}
              disabled={isGeneratingBio}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-700 flex items-center disabled:opacity-50"
            >
              {isGeneratingBio ? (
                <span className="animate-pulse">Generando...</span>
              ) : (
                <>✨ Genera Bio con AI</>
              )}
            </button>
          </div>
        </div>

        {/* Services List */}
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">I tuoi Prezzi & Servizi</h3>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Aggiungi nuovo servizio</label>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
               <input
                 type="text"
                 placeholder="Nome servizio (es. Cambio presa)"
                 className="border-gray-300 rounded px-3 py-2 border text-sm w-full"
                 value={serviceName}
                 onChange={(e) => setServiceName(e.target.value)}
               />
               <input
                 type="number"
                 placeholder="Prezzo (€)"
                 className="border-gray-300 rounded px-3 py-2 border text-sm w-full"
                 value={servicePrice}
                 onChange={(e) => setServicePrice(e.target.value)}
               />
             </div>
             
             <div className="mb-3">
               <label className="block text-xs text-slate-500 mb-1">Scegli Icona</label>
               <div className="flex flex-wrap gap-2">
                 {SERVICE_ICONS.map(icon => (
                   <button
                     key={icon}
                     onClick={() => setServiceIcon(icon)}
                     className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition ${serviceIcon === icon ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'}`}
                   >
                     {icon}
                   </button>
                 ))}
               </div>
             </div>

             <button
                onClick={handleAddService}
                disabled={!serviceName || !servicePrice}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                + Aggiungi Servizio
              </button>
          </div>

          <div className="space-y-2">
            {user.profile.services.map((s) => (
              <div key={s.id} className="flex justify-between items-center bg-white p-3 rounded border border-slate-100 shadow-sm">
                <span className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="text-xl">{s.icon || '🔧'}</span> 
                  {s.name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-slate-900 font-bold">{s.price.toFixed(2)} €</span>
                  <button onClick={() => handleRemoveService(s.id)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                </div>
              </div>
            ))}
            {user.profile.services.length === 0 && <p className="text-sm text-slate-400 italic">Nessun servizio aggiunto.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Customer Dashboard
const CustomerDashboard: React.FC<{
  installers: InstallerProfile[];
  onReview: (installerId: string, review: Omit<Review, 'id' | 'date' | 'authorId'>) => void;
  onEditReview: (installerId: string, reviewId: string, newRating: number, newComment: string) => void;
  onBookInstaller: (installer: InstallerProfile) => void;
  currentUserId: string;
}> = ({ installers, onReview, onEditReview, onBookInstaller, currentUserId }) => {
  const [filter, setFilter] = useState<'all' | 'idraulico' | 'elettricista'>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filteredInstallers = installers.filter(i => 
    (filter === 'all' || i.type === filter) &&
    (locationFilter === '' || i.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
    (nameFilter === '' || i.name.toLowerCase().includes(nameFilter.toLowerCase())) &&
    (!onlyAvailable || i.isAvailable)
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8 text-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Trova il professionista giusto</h2>
        <p className="text-slate-500 mb-6">Esplora prezzi e disponibilità nella tua zona.</p>
        
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-4">
            
            {/* Input Group */}
            <div className="flex-1 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Cerca nome (es. Mario Rossi)..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>

              <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Cerca città (es. Roma, Milano)..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                  />
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2 items-center">
              <div className="flex gap-2">
                {['all', 'idraulico', 'elettricista'].map((f) => (
                    <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all border ${
                        filter === f 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                    >
                    {f === 'all' ? 'Tutti' : f}
                    </button>
                ))}
              </div>

              <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

              <button
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border flex items-center gap-2 ${
                    onlyAvailable
                    ? 'bg-green-600 text-white border-green-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                  <div className={`w-2 h-2 rounded-full ${onlyAvailable ? 'bg-white' : 'bg-green-500'}`}></div>
                  Solo Disponibili
              </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstallers.map(installer => (
          <InstallerCard 
            key={installer.id} 
            installer={installer} 
            isCustomer={true}
            onLeaveReview={onReview}
            onEditReview={onEditReview}
            // Fixed: Use onBookInstaller prop instead of undefined handleOpenBooking. Also corrected prop name to onBook.
            onBook={onBookInstaller}
            currentUserId={currentUserId}
          />
        ))}
      </div>
      
      {filteredInstallers.length === 0 && (
        <div className="text-center py-20 bg-slate-100 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-lg">Nessun professionista trovato con questi filtri.</p>
          <button onClick={() => { setFilter('all'); setLocationFilter(''); setNameFilter(''); setOnlyAvailable(false); }} className="mt-2 text-blue-600 hover:underline">Resetta filtri</button>
        </div>
      )}
    </div>
  );
};


// --- Main App Component ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookingInstaller, setBookingInstaller] = useState<InstallerProfile | null>(null);
  const [customerView, setCustomerView] = useState<'search' | 'community'>('search');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showPlatformReviewModal, setShowPlatformReviewModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
  // Notifications State
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Platform Reviews Data State
  const [platformReviews, setPlatformReviews] = useState<PlatformReview[]>([
    { id: 'pr-1', authorName: "Laura Bianchi", role: "Cliente", comment: "Finalmente un servizio trasparente! Ho trovato un idraulico onesto in meno di 10 minuti. L'abbonamento vale ogni centesimo per la tranquillità che offre.", rating: 5, date: new Date().toISOString() },
    { id: 'pr-2', authorName: "Marco Torrisi", role: "Installatore (Elettricista)", comment: "Da quando sono su FixPro ho smesso di rincorrere i clienti. Le richieste arrivano già filtrate e serie. Ottimo strumento di lavoro.", rating: 5, date: new Date().toISOString() },
    { id: 'pr-3', authorName: "Giuseppe Russo", role: "Cliente", comment: "Niente più attese infinite al telefono o preventivi gonfiati. Qui vedo subito chi è disponibile e quanto costa. Geniale.", rating: 5, date: new Date().toISOString() }
  ]);

  // Suppliers Mock Data
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: 'sup-1',
      name: 'IdroMarket Pro',
      category: 'idraulica',
      description: 'Forniture idrauliche all\'ingrosso, tubazioni, raccorderia e sanitari delle migliori marche.',
      discount: '-15% extra',
      location: 'Via Tiburtina 1020, Roma',
      website: 'www.idromarketpro-demo.it',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/3050/3050115.png'
    },
    {
      id: 'sup-2',
      name: 'ElettroPoint Italia',
      category: 'elettrico',
      description: 'Tutto per l\'installatore elettrico: cavi, quadri, domotica e illuminazione LED.',
      discount: 'Spedizione Gratuita + 10%',
      location: 'Viale Monza 15, Milano',
      website: 'www.elettropoint-demo.it',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/2983/2983914.png'
    },
    {
      id: 'sup-3',
      name: 'TuttoCantiere',
      category: 'generale',
      description: 'Attrezzature da lavoro, utensili professionali e abbigliamento antinfortunistico.',
      discount: 'Buono 50€ su primo ordine',
      location: 'Corso Francia 30, Torino',
      website: 'www.tuttocantiere-demo.it',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/1584/1584892.png'
    }
  ]);

  // Big Opportunities Mock Data
  const [bigOpportunities, setBigOpportunities] = useState<BigOpportunity[]>([
    {
      id: 'opp-1',
      authorId: 'admin', // Admin created
      title: 'Rifacimento Impianto Elettrico Hotel 4 Stelle',
      description: 'Cerchiamo azienda o team di elettricisti per rifacimento completo impianto elettrico e domotica 40 camere. Progetto urgente.',
      location: 'Roma Centro',
      budgetRange: '€50.000 - €70.000',
      postedDate: new Date().toISOString(),
      type: 'elettricista',
      applicants: []
    },
    {
      id: 'opp-2',
      authorId: 'admin', // Admin created
      title: 'Installazione Impianto Idrico Nuovo Complesso Residenziale',
      description: 'Lavoro su cantiere per 12 unità abitative. Richiesta certificazione e squadra di almeno 3 persone.',
      location: 'Milano Hinterland',
      budgetRange: '€30.000 - €45.000',
      postedDate: new Date(Date.now() - 86400000).toISOString(),
      type: 'idraulico',
      applicants: []
    }
  ]);

  // Mock Data State for Community
  const [communityPosts, setCommunityPosts] = useState<Post[]>([
    {
      id: 'post-1',
      authorId: 'user-123',
      authorName: 'Giovanni M.',
      title: 'Costo rifacimento impianto elettrico bilocale?',
      content: 'Buongiorno a tutti, sto valutando di rifare l\'impianto in un bilocale di 50mq a Torino. Qualcuno ha esperienze recenti sui costi medi? Mi hanno chiesto 3000€, è onesto?',
      category: 'prezzi',
      date: '2023-10-24T10:00:00Z',
      likes: 5,
      comments: [
        { id: 'c1', authorName: 'Marco P.', content: 'Ciao, a Milano ho speso circa 3500€ l\'anno scorso, quindi mi sembra in linea.', date: '2023-10-24T12:00:00Z' }
      ]
    },
    {
      id: 'post-2',
      authorId: 'user-456',
      authorName: 'Sara L.',
      title: 'Consiglio caldaia a condensazione',
      content: 'Devo cambiare caldaia. Meglio Vaillant o Immergas? Cerco affidabilità nel tempo.',
      category: 'consiglio',
      date: '2023-10-23T09:30:00Z',
      likes: 12,
      comments: []
    }
  ]);

  // Mock Data State for Installers
  const [installers, setInstallers] = useState<InstallerProfile[]>([
    {
      id: 'inst-1',
      name: 'Mario Rossi',
      type: 'idraulico',
      location: 'Roma',
      bio: "Esperto in riparazioni urgenti e impianti sanitari da oltre 15 anni. Disponibile h24.",
      isAvailable: true,
      avatarUrl: 'https://picsum.photos/200/200?random=1',
      services: [
        { id: 's1', name: 'Riparazione perdita', price: 60, icon: '💧' },
        { id: 's2', name: 'Sostituzione rubinetto', price: 40, icon: '🔧' },
      ],
      reviews: [
        { id: 'r1', authorId: 'cust-99', authorName: 'Luigi B.', rating: 5, comment: 'Veloce e onesto.', date: '2023-10-10' }
      ]
    },
    {
      id: 'inst-2',
      name: 'Giulia Bianchi',
      type: 'elettricista',
      location: 'Milano',
      bio: "Specializzata in domotica e impianti civili. Certificazioni in regola.",
      isAvailable: false,
      avatarUrl: 'https://picsum.photos/200/200?random=2',
      services: [
        { id: 's3', name: 'Punto luce', price: 35, icon: '💡' },
        { id: 's4', name: 'Certificazione impianto', price: 150, icon: '📝' },
      ],
      reviews: []
    },
    {
      id: 'inst-3',
      name: 'Alessandro Verdi',
      type: 'idraulico',
      location: 'Torino',
      bio: "Installazione caldaie e condizionatori. Preventivi gratuiti.",
      isAvailable: true,
      avatarUrl: 'https://picsum.photos/200/200?random=3',
      services: [],
      reviews: []
    }
  ]);

  // Mock Data for Bookings
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'b1',
      installerId: 'inst-1',
      customerId: 'cust-99',
      customerName: 'Marco Polo',
      serviceName: 'Riparazione perdita',
      date: new Date().toISOString(),
      status: 'pending',
      notes: 'Ho una perdita sotto il lavandino della cucina, è urgente.'
    },
    {
      id: 'b2',
      installerId: 'inst-1',
      customerId: 'cust-88',
      customerName: 'Elena Neri',
      serviceName: 'Sostituzione rubinetto',
      date: '2023-10-25T10:00:00Z',
      status: 'pending',
      notes: 'Vorrei sostituire il miscelatore della doccia.'
    },
    {
      id: 'b3',
      installerId: 'inst-1',
      customerId: 'cust-77',
      customerName: 'Luca Blu',
      serviceName: 'Controllo generale',
      date: '2023-10-01T09:00:00Z',
      status: 'accepted',
      notes: ''
    }
  ]);
  
  // FAQs Data
  const faqs = [
    { q: "Come funziona l'abbonamento per i clienti?", a: "L'abbonamento costa 4,99€ al mese (o 44,99€ l'anno) e ti dà accesso illimitato alla ricerca di professionisti, visualizzazione dei prezzi in chiaro e possibilità di contattarli direttamente senza commissioni aggiuntive." },
    { q: "Gli installatori sono verificati?", a: "Sì, verifichiamo l'identità e le certificazioni di ogni professionista. Inoltre, il sistema di recensioni garantisce la qualità del servizio basandosi su esperienze reali degli altri utenti." },
    { q: "Sono un installatore, pago commissioni sui lavori?", a: "Assolutamente no. FixPro Italia non trattiene alcuna percentuale sui tuoi lavori. Paghi solo il piccolo abbonamento mensile (o annuale) per essere visibile sulla piattaforma." },
    { q: "Posso disdire l'abbonamento quando voglio?", a: "Certamente. Non ci sono vincoli contrattuali a lungo termine. Puoi cancellare l'abbonamento in qualsiasi momento direttamente dalla tua area personale." },
    { q: "Cosa succede se non sono soddisfatto del lavoro?", a: "FixPro favorisce il contatto diretto, ma siamo sempre qui per supportarti. Puoi segnalare problemi al nostro servizio clienti e lasciare una recensione per informare la community." }
  ];

  // Effect to check for notifications for the current user
  useEffect(() => {
    if (!currentUser) return;

    // Find unread notifications for this user
    const myUnreadNotes = appNotifications.filter(n => n.userId === currentUser.id && !n.isRead);
    
    if (myUnreadNotes.length > 0) {
      // Show the first one as a toast
      const noteToShow = myUnreadNotes[0];
      setActiveToast(noteToShow);
      
      // Mark as read (in a real app, this would happen after toast is closed or viewed)
      setAppNotifications(prev => prev.map(n => 
        n.id === noteToShow.id ? { ...n, isRead: true } : n
      ));
    }
  }, [currentUser, appNotifications]);

  const addNotification = (userId: string, message: string, type: 'success' | 'info' | 'alert') => {
    const newNote: AppNotification = {
      id: Date.now().toString() + Math.random(),
      userId,
      message,
      type,
      isRead: false,
      timestamp: Date.now()
    };
    setAppNotifications(prev => [...prev, newNote]);
  };

  const handleLogin = (role: UserRole, isAdmin: boolean = false) => {
    // Creating a mock user session with fixed IDs for demo purposes so notifications work
    const newUser: User = {
      id: role === 'customer' ? 'cust-1' : (isAdmin ? 'admin-user' : 'inst-1'), 
      name: isAdmin ? 'Amministratore Idroproject' : (role === 'customer' ? 'Cliente Demo' : 'Mario Rossi'),
      role,
      isSubscribed: false,
      isAdmin: isAdmin,
      profile: role === 'installer' ? installers[0] : undefined
    };
    setCurrentUser(newUser);
  };

  const handleSubscribe = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, isSubscribed: true });
    }
  };

  const handleUpdateInstallerProfile = (updates: Partial<InstallerProfile>) => {
    if (!currentUser || currentUser.role !== 'installer' || !currentUser.profile) return;

    // Update local user state
    const updatedProfile = { ...currentUser.profile, ...updates };
    setCurrentUser({ ...currentUser, profile: updatedProfile });

    // Update global list state (syncing DB mock)
    setInstallers(prev => prev.map(inst => inst.id === currentUser.profile!.id ? updatedProfile : inst));
  };

  const handleCustomerReview = (installerId: string, reviewData: Omit<Review, 'id' | 'date' | 'authorId'>) => {
    if (!currentUser) return;
    
    const newReview: Review = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      date: new Date().toISOString(),
      ...reviewData
    };

    setInstallers(prev => prev.map(inst => {
      if (inst.id === installerId) {
        return { ...inst, reviews: [newReview, ...inst.reviews] };
      }
      return inst;
    }));
  };

  const handleUpdateReview = (installerId: string, reviewId: string, newRating: number, newComment: string) => {
    setInstallers(prev => prev.map(inst => {
      if (inst.id === installerId) {
        return {
          ...inst,
          reviews: inst.reviews.map(rev => 
            rev.id === reviewId ? { ...rev, rating: newRating, comment: newComment } : rev
          )
        };
      }
      return inst;
    }));
    
    setActiveToast({
       id: 'update-rev-' + Date.now(),
       userId: currentUser?.id || '',
       message: 'Recensione modificata con successo!',
       type: 'success',
       isRead: true,
       timestamp: Date.now()
    });
  };

  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus) => {
    const actionName = status === 'accepted' ? 'accettare' : 'rifiutare';
    
    setConfirmDialog({
      isOpen: true,
      title: `Conferma ${status === 'accepted' ? 'Accettazione' : 'Rifiuto'}`,
      message: `Sei sicuro di voler ${actionName} questa richiesta di lavoro? L'azione invierà una notifica al cliente.`,
      onConfirm: () => {
        const booking = bookings.find(b => b.id === bookingId);
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));

        if (booking) {
          // NOTIFICATION LOGIC: Installer updates status -> Notify Customer
          const message = status === 'accepted' 
            ? `L'installatore ha accettato la tua richiesta per ${booking.serviceName}!`
            : `L'installatore ha rifiutato la tua richiesta per ${booking.serviceName}.`;
            
          addNotification(booking.customerId, message, status === 'accepted' ? 'success' : 'alert');
        }
        setConfirmDialog(null);
      }
    });
  };

  // Logic to handle booking creation
  const handleOpenBooking = (installer: InstallerProfile) => {
    setBookingInstaller(installer);
  };

  const handleSubmitBooking = async (data: { date: string; serviceName: string; notes: string }) => {
    if (!bookingInstaller || !currentUser) return;
    
    // Simulate network delay and potential error
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Randomly simulate an error for demonstration (optional, removed for stability but structure allows it)
    // if (Math.random() > 0.9) throw new Error("Errore di connessione simulato.");

    const newBooking: Booking = {
      id: Date.now().toString(),
      installerId: bookingInstaller.id,
      customerId: currentUser.id,
      customerName: currentUser.name,
      serviceName: data.serviceName,
      date: data.date,
      status: 'pending',
      notes: data.notes
    };

    setBookings(prev => [...prev, newBooking]);
    
    // NOTIFICATION LOGIC: Customer books -> Notify Installer
    addNotification(
      bookingInstaller.id, 
      `Nuova richiesta da ${currentUser.name} per ${data.serviceName}.`, 
      'alert'
    );

    setBookingInstaller(null);
    
    // Show immediate feedback to customer
    setActiveToast({
        id: 'temp', 
        userId: currentUser.id, 
        message: 'Richiesta inviata con successo!', 
        type: 'success', 
        isRead: true, 
        timestamp: Date.now()
    });
  };

  const handleAddPost = (newPostData: Omit<Post, 'id' | 'date' | 'likes' | 'comments'>) => {
    const newPost: Post = {
      id: 'post-' + Date.now(),
      date: new Date().toISOString(),
      likes: 0,
      comments: [],
      ...newPostData
    };
    setCommunityPosts([newPost, ...communityPosts]);
    
    setActiveToast({
        id: 'post-success', 
        userId: currentUser?.id || '', 
        message: 'Discussione pubblicata con successo!', 
        type: 'success', 
        isRead: true, 
        timestamp: Date.now()
    });
  };

  const handleAddComment = (postId: string, content: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: 'c-' + Date.now(),
      authorName: currentUser.name,
      content,
      date: new Date().toISOString()
    };

    setCommunityPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));
  };

  // Opportunity Management Functions
  const handleApplyToOpportunity = (oppId: string) => {
     if (!currentUser || !currentUser.profile) return;
     
     setConfirmDialog({
       isOpen: true,
       title: "Conferma Candidatura",
       message: "Sei sicuro di volerti candidare per questa opportunità? Il tuo profilo verrà inviato immediatamente al committente.",
       onConfirm: () => {
         setBigOpportunities(prev => prev.map(opp => {
           if (opp.id === oppId) {
             return { ...opp, applicants: [...opp.applicants, currentUser.profile!.id] };
           }
           return opp;
         }));

         setActiveToast({
            id: 'apply-success', 
            userId: currentUser.id, 
            message: 'Candidatura inviata con successo! Verrai ricontattato.', 
            type: 'success', 
            isRead: true, 
            timestamp: Date.now()
        });
        setConfirmDialog(null);
       }
     });
  };

  const handleSaveOpportunity = (oppData: Omit<BigOpportunity, 'id' | 'postedDate' | 'applicants' | 'authorId'>, existingId?: string) => {
    if (!currentUser || !currentUser.profile) return;

    if (existingId) {
      // Edit mode
      setBigOpportunities(prev => prev.map(opp => {
        if (opp.id === existingId) {
          return { ...opp, ...oppData };
        }
        return opp;
      }));
      setActiveToast({
        id: 'opp-edit-' + Date.now(),
        userId: currentUser.id,
        message: 'Opportunità aggiornata con successo.',
        type: 'success',
        isRead: true,
        timestamp: Date.now()
      });
    } else {
      // Create mode
      const newOpp: BigOpportunity = {
        id: 'opp-' + Date.now(),
        authorId: currentUser.profile.id,
        postedDate: new Date().toISOString(),
        applicants: [],
        ...oppData
      };
      setBigOpportunities(prev => [newOpp, ...prev]);
      setActiveToast({
        id: 'opp-new-' + Date.now(),
        userId: currentUser.id,
        message: 'Opportunità pubblicata con successo!',
        type: 'success',
        isRead: true,
        timestamp: Date.now()
      });
    }
  };

  const handleDeleteOpportunity = (oppId: string) => {
    if (!currentUser) return;
    
    setConfirmDialog({
      isOpen: true,
      title: "Elimina Opportunità",
      message: "Sei sicuro di voler eliminare definitivamente questo annuncio? L'azione è irreversibile.",
      onConfirm: () => {
        setBigOpportunities(prev => prev.filter(o => o.id !== oppId));
        setConfirmDialog(null);
        setActiveToast({
          id: 'opp-del-' + Date.now(),
          userId: currentUser.id,
          message: 'Annuncio eliminato.',
          type: 'info',
          isRead: true,
          timestamp: Date.now()
        });
      }
    });
  };

  // Supplier Management Functions
  const handleSaveSupplier = (supplierData: Omit<Supplier, 'id'>, existingId?: string) => {
    if (!currentUser) return;

    if (existingId) {
      // Edit mode
      setSuppliers(prev => prev.map(sup => {
        if (sup.id === existingId) {
          return { ...sup, ...supplierData };
        }
        return sup;
      }));
      setActiveToast({
        id: 'sup-edit-' + Date.now(),
        userId: currentUser.id,
        message: 'Fornitore aggiornato con successo.',
        type: 'success',
        isRead: true,
        timestamp: Date.now()
      });
    } else {
      // Create mode
      const newSupplier: Supplier = {
        id: 'sup-' + Date.now(),
        ...supplierData
      };
      setSuppliers(prev => [newSupplier, ...prev]);
      setActiveToast({
        id: 'sup-new-' + Date.now(),
        userId: currentUser.id,
        message: 'Fornitore aggiunto con successo!',
        type: 'success',
        isRead: true,
        timestamp: Date.now()
      });
    }
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (!currentUser) return;

    setConfirmDialog({
      isOpen: true,
      title: "Elimina Fornitore",
      message: "Sei sicuro di voler rimuovere questo fornitore dalla lista?",
      onConfirm: () => {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
        setConfirmDialog(null);
        setActiveToast({
          id: 'sup-del-' + Date.now(),
          userId: currentUser.id,
          message: 'Fornitore rimosso.',
          type: 'info',
          isRead: true,
          timestamp: Date.now()
        });
      }
    });
  };

  const handleSupplierSubmit = () => {
    setShowSupplierModal(false);
    setActiveToast({
      id: 'supplier-req-' + Date.now(),
      userId: 'guest', // Not used in landing view really, but consistent with type
      message: 'Richiesta inviata! Il nostro reparto commerciale ti contatterà a breve.',
      type: 'success',
      isRead: true,
      timestamp: Date.now()
    });
  };

  const handlePlatformReviewSubmit = (rating: number, comment: string, guestName?: string, guestRole?: string) => {
    
    const authorName = currentUser ? currentUser.name : (guestName || "Utente Ospite");
    const role = currentUser 
      ? (currentUser.role === 'customer' ? 'Cliente' : (currentUser.role === 'installer' ? 'Installatore' : 'Admin')) 
      : (guestRole || "Visitatore");

    const newReview: PlatformReview = {
      id: 'pr-' + Date.now(),
      authorName: authorName,
      role: role,
      rating,
      comment,
      date: new Date().toISOString()
    };
    
    setPlatformReviews(prev => [newReview, ...prev]);
    
    setActiveToast({
      id: 'pr-success-' + Date.now(),
      userId: currentUser?.id || 'guest',
      message: 'Grazie per il tuo feedback!',
      type: 'success',
      isRead: true,
      timestamp: Date.now()
    });
  };

  // Admin Platform Review Management
  const handleSavePlatformReview = (review: PlatformReview) => {
    setPlatformReviews(prev => prev.map(r => r.id === review.id ? review : r));
    setActiveToast({
      id: 'pr-update-' + Date.now(),
      userId: currentUser?.id || '',
      message: 'Recensione sito aggiornata.',
      type: 'success',
      isRead: true,
      timestamp: Date.now()
    });
  };

  const handleDeletePlatformReview = (reviewId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Elimina Recensione Sito",
      message: "Sei sicuro? Questa recensione non sarà più visibile nella landing page.",
      onConfirm: () => {
        setPlatformReviews(prev => prev.filter(r => r.id !== reviewId));
        setConfirmDialog(null);
        setActiveToast({
          id: 'pr-delete-' + Date.now(),
          userId: currentUser?.id || '',
          message: 'Recensione eliminata.',
          type: 'info',
          isRead: true,
          timestamp: Date.now()
        });
      }
    });
  };


  // Landing Page View
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Show Notification Toast if Active (e.g. from previous session logic simulation) */}
        {activeToast && <NotificationToast notification={activeToast} onClose={() => setActiveToast(null)} />}
        
        {/* Supplier Modal */}
        {showSupplierModal && <SupplierInquiryModal onClose={() => setShowSupplierModal(false)} onSubmit={handleSupplierSubmit} />}

        {/* Forgot Password Modal */}
        {showForgotPasswordModal && <ForgotPasswordModal onClose={() => setShowForgotPasswordModal(false)} />}

        {/* Platform Review Modal (Guest Mode) */}
        {showPlatformReviewModal && (
          <PlatformReviewModal 
            isOpen={showPlatformReviewModal}
            onClose={() => setShowPlatformReviewModal(false)}
            onSubmit={handlePlatformReviewSubmit}
            isGuest={true}
          />
        )}

        {/* Admin Login Modal */}
        {showAdminLoginModal && (
          <AdminLoginModal 
            onClose={() => setShowAdminLoginModal(false)}
            onSuccess={() => {
              setShowAdminLoginModal(false);
              handleLogin('installer', true);
            }}
          />
        )}

        <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600 tracking-tight">FixPro<span className="text-slate-800">Italia</span></h1>
            <div className="space-x-4 flex items-center">
              <button 
                onClick={() => setShowSupplierModal(true)}
                className="hidden md:block text-slate-500 hover:text-slate-800 font-medium text-sm underline underline-offset-2"
              >
                Diventa Fornitore
              </button>
              <button
                onClick={() => setShowForgotPasswordModal(true)}
                className="hidden md:block text-slate-500 hover:text-slate-800 font-medium text-sm underline underline-offset-2"
              >
                Recupera Password
              </button>
              <div className="h-4 w-px bg-slate-300 hidden md:block"></div>
              <button onClick={() => handleLogin('installer')} className="text-slate-600 hover:text-blue-600 font-medium text-sm">Accesso Installatori</button>
              <button onClick={() => handleLogin('customer')} className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-blue-700 transition">Trova un Tecnico</button>
            </div>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center p-6 space-y-12">
          <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-2 block">La rete #1 in Italia</span>
              <h2 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                Idraulici ed Elettricisti <br/> a portata di click.
              </h2>
              
              <div className="space-y-4 mb-8 text-slate-600 bg-white/50 rounded-lg">
                <p>
                  <strong className="text-slate-900 block mb-1">Per i Clienti:</strong> 
                  Dimentica le attese infinite e i costi nascosti. Trova professionisti disponibili <em>subito</em>, vedi i prezzi <em>prima</em> di chiamare e prenota in sicurezza grazie a recensioni reali. Risolvi il problema oggi, senza brutte sorprese.
                </p>
                <p>
                  <strong className="text-slate-900 block mb-1">Per gli Installatori:</strong> 
                  Basta burocrazia e tempi morti. Ottieni visibilità immediata, gestisci i tuoi prezzi e ricevi richieste di lavoro concrete. Semplifica la tua attività e aumenta il fatturato oggi stesso.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                   onClick={() => handleLogin('customer')}
                   className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg hover:shadow-xl"
                >
                  Cerca Professionista
                </button>
                <button 
                   onClick={() => handleLogin('installer')}
                   className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-3 rounded-xl font-bold hover:border-slate-400 transition"
                >
                  Offri Servizi
                </button>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 opacity-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1000" 
                alt="Idraulico al lavoro" 
                className="relative rounded-2xl shadow-2xl object-cover h-[500px] w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">✓</div>
                   <div>
                     <p className="font-bold text-slate-900 text-sm">Problema Risolto</p>
                     <p className="text-xs text-slate-500">2 minuti fa a Milano</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* AUTHORITY SECTION */}
          <div className="w-full max-w-4xl bg-slate-900 text-white py-12 px-6 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative z-10 text-center">
              <span className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-2 block">Powered by</span>
              <h3 className="text-3xl font-bold mb-4">IDROPROJECT</h3>
              <p className="text-xl font-light text-slate-300 max-w-2xl mx-auto italic mb-6">
                "Leader indiscusso del settore"
              </p>
              <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed text-sm md:text-base px-4">
                La nostra missione va oltre la semplice connessione digitale. Vogliamo <strong>elevare lo standard del lavoro artigianale in Italia</strong>, garantendo agli installatori la dignità di un compenso equo senza intermediari e alle famiglie la <strong>serenità assoluta</strong> di aprire la porta a veri professionisti certificati. Abbiamo unito l'efficienza tecnologica all'etica del lavoro ben fatto: perché la fiducia si costruisce un intervento alla volta.
              </p>
              <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center gap-8 text-sm text-slate-400">
                <span>★ Esperienza Decennale</span>
                <span>★ Standard Certificati</span>
                <span>★ Garanzia di Qualità</span>
              </div>
            </div>
            {/* ADMIN LOGIN TRIGGER */}
            <div className="absolute bottom-2 right-4 opacity-50 hover:opacity-100 transition-opacity">
              <button onClick={() => setShowAdminLoginModal(true)} className="text-[10px] text-slate-600 hover:text-white uppercase tracking-wider">
                Accesso Admin
              </button>
            </div>
          </div>

          {/* B2B SUPPLIER CTA */}
          <div className="w-full max-w-4xl mt-8 border-t border-slate-200 pt-8 text-center">
            <h4 className="text-lg font-bold text-slate-700 mb-2">Sei un fornitore di materiale elettrico o idraulico?</h4>
            <p className="text-slate-500 text-sm mb-4">Entra nel nostro network e raggiungi migliaia di installatori professionisti.</p>
            <button 
               onClick={() => setShowSupplierModal(true)}
               className="text-blue-600 font-bold hover:underline text-sm flex items-center justify-center gap-2 mx-auto"
            >
              Compila il modulo di partnership <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* FAQ SECTION */}
          <div className="w-full max-w-4xl mt-16 mb-8">
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">Domande Frequenti</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
          
          {/* PLATFORM REVIEWS SECTION */}
          <div className="w-full max-w-6xl mt-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-4">
                 <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                   <span className="text-yellow-500">★★★★★</span> Dicono di Noi
                 </h3>
                 <button 
                   onClick={() => setShowPlatformReviewModal(true)}
                   className="mt-4 md:mt-0 bg-white text-blue-600 font-bold border border-blue-200 px-6 py-2 rounded-full hover:bg-blue-50 transition shadow-sm flex items-center gap-2"
                 >
                   ✍️ Scrivi una recensione
                 </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {platformReviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 hover:shadow-lg transition relative animate-fadeIn">
                  <div className="absolute top-4 left-4 text-slate-200 text-5xl font-serif">“</div>
                  <div className="relative z-10 pt-4">
                     <p className="text-slate-600 text-sm italic mb-4 leading-relaxed">
                       {review.comment}
                     </p>
                     <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                       <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                         {review.authorName.charAt(0)}
                       </div>
                       <div>
                         <p className="font-bold text-slate-800 text-sm">{review.authorName}</p>
                         <p className="text-xs text-slate-500">{review.role}</p>
                         <div className="flex text-yellow-400 text-xs mt-0.5">
                           {[...Array(review.rating)].map((_, i) => <span key={i}>★</span>)}
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    );
  }

  // Logged In View
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Toast Notifications */}
      {activeToast && <NotificationToast notification={activeToast} onClose={() => setActiveToast(null)} />}

      {/* Subscription Modal Overlay */}
      {!currentUser.isSubscribed && (
        <SubscriptionModal 
          role={currentUser.role} 
          onSubscribe={handleSubscribe} 
        />
      )}

      {/* Booking Modal Overlay */}
      {bookingInstaller && (
        <BookingModal 
          installer={bookingInstaller} 
          customerName={currentUser.name}
          onClose={() => setBookingInstaller(null)}
          onSubmit={handleSubmitBooking}
        />
      )}

      {/* Generic Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmationDialog 
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Platform Review Modal */}
      {showPlatformReviewModal && (
        <PlatformReviewModal 
          isOpen={showPlatformReviewModal}
          onClose={() => setShowPlatformReviewModal(false)}
          onSubmit={handlePlatformReviewSubmit}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <span className="text-xl font-bold text-slate-800">FixPro</span>
             <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded capitalize">
               {currentUser.isAdmin ? 'Admin' : currentUser.role}
             </span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Rate Us Button for Logged In Users */}
             <button 
               onClick={() => setShowPlatformReviewModal(true)}
               className="hidden md:flex items-center gap-1 text-xs font-bold text-yellow-600 hover:text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100 transition"
             >
               ⭐ Valutaci
             </button>

             {currentUser.role === 'customer' && (
                <div className="flex bg-slate-100 p-1 rounded-lg">
                   <button 
                     onClick={() => setCustomerView('search')}
                     className={`px-3 py-1 text-xs font-bold rounded-md transition ${customerView === 'search' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                   >
                     Cerca
                   </button>
                   <button 
                     onClick={() => setCustomerView('community')}
                     className={`px-3 py-1 text-xs font-bold rounded-md transition ${customerView === 'community' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                   >
                     Community
                   </button>
                </div>
             )}
             <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
                   {currentUser.profile?.avatarUrl ? (
                      <img src={currentUser.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">{currentUser.name.charAt(0)}</div>
                   )}
                </div>
                <span className="hidden md:inline font-medium text-slate-700">{currentUser.name}</span>
             </div>
             <button onClick={() => setCurrentUser(null)} className="text-slate-400 hover:text-red-500">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        {currentUser.role === 'customer' ? (
          customerView === 'search' ? (
            <CustomerDashboard 
              installers={installers} 
              onReview={handleCustomerReview}
              onEditReview={handleUpdateReview}
              onBookInstaller={handleOpenBooking}
              currentUserId={currentUser.id}
            />
          ) : (
            <CommunitySection 
               posts={communityPosts}
               currentUser={currentUser}
               onAddPost={handleAddPost}
               onAddComment={handleAddComment}
            />
          )
        ) : (
          <InstallerDashboard 
            user={currentUser} 
            updateProfile={handleUpdateInstallerProfile}
            bookings={bookings}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            bigOpportunities={bigOpportunities}
            onApplyToOpportunity={handleApplyToOpportunity}
            suppliers={suppliers}
            onSaveOpportunity={handleSaveOpportunity}
            onDeleteOpportunity={handleDeleteOpportunity}
            onSaveSupplier={handleSaveSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            platformReviews={platformReviews}
            onSavePlatformReview={handleSavePlatformReview}
            onDeletePlatformReview={handleDeletePlatformReview}
          />
        )}
      </main>
    </div>
  );
};

export default App;
