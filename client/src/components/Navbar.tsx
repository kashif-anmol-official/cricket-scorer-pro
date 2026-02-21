import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const Navbar: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="sticky top-0 z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto glass-card rounded-[2rem] px-8 py-4 flex items-center justify-between border-white/20 shadow-2xl">
                <Link to="/" className="group flex items-center gap-3 active:scale-95 transition-all">
                    <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-xl shadow-blue-200 group-hover:rotate-[15deg] transition-transform duration-300">
                        <span className="text-xl">🏏</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-black text-xl text-slate-900 tracking-tighter">
                            Cric<span className="text-blue-600">Pro</span>
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mt-0.5">Scorer v3</span>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <Link
                        to="/"
                        className={clsx(
                            "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                            location.pathname === '/'
                                ? "bg-slate-900 text-white shadow-xl"
                                : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                        )}
                    >
                        New Match
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
