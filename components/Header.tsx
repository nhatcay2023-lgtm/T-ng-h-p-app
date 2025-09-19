
import React from 'react';

const FeatherIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-sky-400">
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
        <line x1="16" y1="8" x2="2" y2="22"></line>
        <line x1="17.5" y1="15" x2="9" y2="15"></line>
    </svg>
);


const Header: React.FC = () => {
  return (
    <header className="text-center border-b border-slate-700 pb-6">
        <div className="flex justify-center items-center gap-4">
            <FeatherIcon />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-display bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-violet-400">
                SÁNG TÁC THƠ AI
            </h1>
        </div>
      <p className="mt-2 text-lg text-slate-400">Khơi nguồn cảm hứng thơ ca Việt với Trí Tuệ Nhân Tạo</p>
    </header>
  );
};

export default Header;