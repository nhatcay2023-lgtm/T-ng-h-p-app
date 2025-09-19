import React, { useState, useEffect } from 'react';
import { SavedPoem } from '../types';
import { getSavedPoems, savePoem, deletePoem } from '../services/storageService';


interface PoemDisplayProps {
  poem: string;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
  onLoadPoem: (poem: SavedPoem) => void;
  selectedFont: string;
  poemTitle: string;
  setPoemTitle: (title: string) => void;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-700 rounded w-4/5 mt-4"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
    </div>
);

// --- ICONS ---
const CopyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);
const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);
const NewPoemIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
    </svg>
);
const SaveIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);
const LibraryIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
);
const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);
const ViewIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);
const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

// --- MODAL COMPONENT ---
const SavedPoemsModal: React.FC<{
    poems: SavedPoem[];
    onClose: () => void;
    onView: (poem: SavedPoem) => void;
    onDelete: (timestamp: number) => void;
    selectedFont: string;
}> = ({ poems, onClose, onView, onDelete, selectedFont }) => {
    const [copiedTimestamp, setCopiedTimestamp] = useState<number | null>(null);

    const handleCopy = (poemToCopy: SavedPoem) => {
        const textToCopy = `${poemToCopy.title}\n\n${poemToCopy.content}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedTimestamp(poemToCopy.timestamp);
            const timer = setTimeout(() => {
                setCopiedTimestamp(null);
            }, 2000);
            return () => clearTimeout(timer);
        });
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="library-title">
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 id="library-title" className="text-xl font-bold font-serif-display text-sky-300">Thư viện thơ đã lưu</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition" aria-label="Đóng thư viện">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {poems.length > 0 ? (
                        <ul className="space-y-3">
                            {poems.map(p => (
                                <li key={p.timestamp} className="bg-slate-900/50 p-3 rounded-md border border-slate-700 flex justify-between items-start gap-4">
                                    <div className="flex-grow min-w-0">
                                        <h4 className="text-md font-semibold text-slate-200 truncate" style={{ fontFamily: selectedFont }}>{p.title}</h4>
                                        <p className="text-slate-400 whitespace-pre-wrap text-sm italic truncate" >"{p.content.substring(0, 100)}{p.content.length > 100 ? '...' : ''}"</p>
                                        <p className="text-xs text-slate-500 mt-2">{new Date(p.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-2">
                                         <button onClick={() => handleCopy(p)} className="p-2 rounded-md hover:bg-slate-700 transition text-slate-400 hover:text-sky-400" title={copiedTimestamp === p.timestamp ? "Đã sao chép!" : "Sao chép thơ"}>
                                            {copiedTimestamp === p.timestamp ? <CheckIcon className="h-5 w-5 text-green-400"/> : <CopyIcon className="h-5 w-5"/>}
                                        </button>
                                         <button onClick={() => onView(p)} className="p-2 rounded-md hover:bg-slate-700 transition text-slate-400 hover:text-sky-400" title="Xem thơ">
                                            <ViewIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onDelete(p.timestamp)} className="p-2 rounded-md hover:bg-slate-700 transition text-slate-400 hover:text-red-400" title="Xóa thơ">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-500 py-8">Thư viện của bạn chưa có bài thơ nào.</p>
                    )}
                </div>
            </div>
        </div>
    )
};


const PoemDisplay: React.FC<PoemDisplayProps> = ({ poem, isLoading, error, onReset, onLoadPoem, selectedFont, poemTitle, setPoemTitle }) => {
    const [copySuccess, setCopySuccess] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const [isLibraryVisible, setIsLibraryVisible] = useState(false);
    const [savedPoems, setSavedPoems] = useState<SavedPoem[]>([]);

    useEffect(() => {
        if (copySuccess) {
            const timer = setTimeout(() => setCopySuccess(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [copySuccess]);
    
    useEffect(() => {
        if (saveSuccess) {
            const timer = setTimeout(() => setSaveSuccess(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [saveSuccess]);

    const handleCopy = () => {
        const textToCopy = `${poemTitle}\n\n${poem}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopySuccess('Đã sao chép!');
        }, () => {
            setCopySuccess('Sao chép thất bại.');
        });
    };

    const handleSave = () => {
        savePoem({ title: poemTitle, content: poem });
        setSaveSuccess('Đã lưu thơ!');
    };

    const handleDownload = () => {
        if (!poem) return;
        const textToDownload = `${poemTitle}\n\n${poem}`;
        const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const filename = `${poemTitle.replace(/ /g, '_') || 'Sang_Tac_Tho_AI'}_${Date.now()}.txt`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const handleToggleLibrary = () => {
        if (!isLibraryVisible) {
            setSavedPoems(getSavedPoems());
        }
        setIsLibraryVisible(!isLibraryVisible);
    }
    
    const handleDelete = (timestamp: number) => {
        deletePoem(timestamp);
        setSavedPoems(getSavedPoems());
    }

    const handleView = (poemToView: SavedPoem) => {
        onLoadPoem(poemToView);
        setIsLibraryVisible(false);
    }

    const renderContent = () => {
        if (isLoading) {
            return <LoadingSkeleton />;
        }
        if (error) {
            return <p className="text-red-400 text-center">{error}</p>;
        }
        if (poem) {
            return (
                <div className="space-y-4">
                     <input
                        type="text"
                        value={poemTitle}
                        onChange={(e) => setPoemTitle(e.target.value)}
                        placeholder="Đặt tên cho bài thơ..."
                        className="w-full bg-transparent text-2xl font-bold font-serif-display text-slate-100 placeholder-slate-500 focus:outline-none text-center border-b-2 border-slate-700 focus:border-sky-500 transition pb-2"
                        aria-label="Tiêu đề bài thơ"
                     />
                     <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-100" style={{ fontFamily: selectedFont }}>{poem}</p>
                </div>
            )
        }
        return (
            <div className="text-center text-slate-500 italic flex items-center justify-center h-full">
                <div>
                    <p>Vần thơ của bạn sẽ xuất hiện ở đây...</p>
                    <p className="mt-2 text-sm">Hãy tùy chỉnh các lựa chọn và để AI khơi nguồn sáng tạo.</p>
                </div>
            </div>
        )
    }


  return (
    <>
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-lg flex flex-col h-full min-h-[500px] lg:min-h-0">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-100 font-serif-display">Tác phẩm của bạn</h2>
            <div className="flex items-center gap-1 sm:gap-2">
                 {poem && !isLoading && (
                     <div className="flex items-center gap-1 sm:gap-2">
                        <button onClick={handleDownload} className="p-2 rounded-full hover:bg-slate-700 transition text-slate-400 hover:text-sky-400" title="Tải xuống thơ (.txt)">
                            <DownloadIcon className="h-5 w-5"/>
                        </button>
                        <button onClick={handleSave} className="relative p-2 rounded-full hover:bg-slate-700 transition text-slate-400 hover:text-sky-400" title="Lưu thơ">
                            <SaveIcon className="h-5 w-5"/>
                            {saveSuccess && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-slate-600 text-white px-2 py-1 rounded">{saveSuccess}</span>}
                        </button>
                        <button onClick={handleCopy} className="relative p-2 rounded-full hover:bg-slate-700 transition text-slate-400 hover:text-sky-400" title="Sao chép">
                            <CopyIcon className="h-5 w-5"/>
                            {copySuccess && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-slate-600 text-white px-2 py-1 rounded">{copySuccess}</span>}
                        </button>
                    </div>
                )}
                <button onClick={handleToggleLibrary} className="p-2 rounded-full hover:bg-slate-700 transition text-slate-400 hover:text-sky-400" title="Thư viện thơ">
                   <LibraryIcon className="h-5 w-5" />
                </button>
                <button onClick={onReset} className="p-2 rounded-full hover:bg-slate-700 transition text-slate-400 hover:text-sky-400" title="Sáng tác bài mới">
                   <NewPoemIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
      <div className="flex-grow bg-slate-900/70 p-4 rounded-md overflow-y-auto">
        {renderContent()}
      </div>
    </div>
    {isLibraryVisible && (
        <SavedPoemsModal 
            poems={savedPoems} 
            onClose={handleToggleLibrary} 
            onView={handleView}
            onDelete={handleDelete}
            selectedFont={selectedFont}
        />
    )}
    </>
  );
};

export default PoemDisplay;