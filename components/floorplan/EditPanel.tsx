"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, MousePointer2, Edit2, Save } from "lucide-react";

interface EditPanelProps {
    isOpen: boolean;
    currentTool: 'none' | 'add' | 'remove';
    selectedClass: string;
    availableClasses: string[];
    onToolChange: (tool: 'none' | 'add' | 'remove') => void;
    onClassChange: (cls: string) => void;
    onToggle: () => void;
}

export default function EditPanel({
    isOpen,
    currentTool,
    selectedClass,
    availableClasses,
    onToolChange,
    onClassChange,
    onToggle
}: EditPanelProps) {
    return (
        <div className="absolute top-8 right-8 z-50 flex flex-col items-end">
            <AnimatePresence mode="wait">
                {!isOpen ? (
                    <motion.button
                        key="edit-button"
                        layoutId="edit-panel"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggle}
                        className="flex items-center justify-center p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white shadow-xl hover:bg-slate-800 transition-colors"
                    >
                        <Edit2 className="w-5 h-5" />
                    </motion.button>
                ) : (
                    <motion.div
                        key="edit-panel"
                        layoutId="edit-panel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 w-72 flex flex-col gap-4 overflow-hidden"
                    >
                        {/* Header Actions */}
                        <div className="flex items-center justify-end">
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white flex items-center gap-2"
                            >
                                <span className="text-xs font-bold uppercase tracking-wider">Done</span>
                                <Save className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tools Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => onToolChange('add')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${currentTool === 'add'
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                                        : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-white/10'
                                    }`}
                            >
                                <Plus className="w-5 h-5" />
                                <span className="text-xs font-bold">Add</span>
                            </button>

                            <button
                                onClick={() => onToolChange('remove')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${currentTool === 'remove'
                                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/25'
                                        : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-white/10'
                                    }`}
                            >
                                <Trash2 className="w-5 h-5" />
                                <span className="text-xs font-bold">Remove</span>
                            </button>
                        </div>

                        {/* Context Options */}
                        <div className="min-h-[100px]">
                            <AnimatePresence mode="wait">
                                {currentTool === 'add' ? (
                                    <motion.div
                                        key="add-options"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Item Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {availableClasses.map((cls) => (
                                                <button
                                                    key={cls}
                                                    onClick={() => onClassChange(cls)}
                                                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all capitalize text-center ${selectedClass === cls
                                                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                                                            : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                                        }`}
                                                >
                                                    {cls}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-500 text-center mt-3">
                                            Drag on image to draw
                                        </p>
                                    </motion.div>
                                ) : currentTool === 'remove' ? (
                                    <motion.div
                                        key="remove-options"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex flex-col items-center justify-center h-full text-center p-2"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mb-2 text-red-400">
                                            <MousePointer2 className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs text-red-200">
                                            Click any box to remove it
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="no-tool"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center justify-center h-full text-slate-500 text-xs italic"
                                    >
                                        Select a tool above
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
