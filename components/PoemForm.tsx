import React from 'react';
import { PoemOptions } from '../types';
import { POEM_TYPES, POEM_STYLES, POEM_CONTEXTS, EMOTIONS, AUDIENCE_AGES, SUGGESTED_TOPICS, FONT_OPTIONS } from '../constants';

interface PoemFormProps {
  options: PoemOptions;
  setOptions: React.Dispatch<React.SetStateAction<PoemOptions>>;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  selectedFont: string;
  setSelectedFont: React.Dispatch<React.SetStateAction<string>>;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-sky-300">{title}</label>
    {children}
  </div>
);

const SelectInput: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }> = ({ value, onChange, options }) => (
    <select
        value={value}
        onChange={onChange}
        className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
    >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
);

const PoemForm: React.FC<PoemFormProps> = ({ options, setOptions, onSubmit, onCancel, isLoading, selectedFont, setSelectedFont }) => {
  const handleOptionChange = <K extends keyof PoemOptions,>(key: K, value: PoemOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleEmotionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEmotions = Array.from(e.target.selectedOptions, option => option.value);
    handleOptionChange('emotions', selectedEmotions);
  };

  const handleTopicSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
        handleOptionChange('customContext', selectedValue);
    }
  };

  // Sync dropdown with customContext input
  const selectedTopic = SUGGESTED_TOPICS.includes(options.customContext) ? options.customContext : '';


  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-100 font-serif-display">Tùy chỉnh bài thơ của bạn</h2>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSection title="Thể loại thơ">
                <SelectInput 
                    value={options.type} 
                    onChange={e => handleOptionChange('type', e.target.value)}
                    options={POEM_TYPES}
                />
            </FormSection>
            <FormSection title="Phong cách thơ">
                 <SelectInput 
                    value={options.style} 
                    onChange={e => handleOptionChange('style', e.target.value)}
                    options={POEM_STYLES}
                />
            </FormSection>
        </div>
        
        <FormSection title="Số dòng mong muốn">
            <div className="flex items-center gap-4">
                <input
                    type="range"
                    min="4"
                    max="40"
                    step="2"
                    value={options.lines}
                    onChange={e => handleOptionChange('lines', parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <span className="bg-slate-700 text-slate-200 text-sm font-medium px-3 py-1 rounded-full w-12 text-center">{options.lines}</span>
            </div>
        </FormSection>

        <FormSection title="Ngữ cảnh thơ">
            <SelectInput 
                value={options.context} 
                onChange={e => handleOptionChange('context', e.target.value)}
                options={POEM_CONTEXTS}
            />
            <input
                type="text"
                value={options.customContext}
                onChange={e => handleOptionChange('customContext', e.target.value)}
                placeholder="Hoặc nhập ngữ cảnh riêng (ví dụ: bình minh trên biển)"
                className="mt-2 w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition placeholder-slate-500"
            />
        </FormSection>

        <FormSection title="Gợi ý chủ đề (Tùy chọn)">
            <select
                value={selectedTopic}
                onChange={handleTopicSelect}
                className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
            >
                <option value="">Chọn từ hơn 100 chủ đề có sẵn...</option>
                {SUGGESTED_TOPICS.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                ))}
            </select>
        </FormSection>
        
        <FormSection title="Nguồn cảm hứng (Tùy chọn)">
          <textarea
              value={options.inspiration}
              onChange={e => handleOptionChange('inspiration', e.target.value)}
              placeholder="Nhập ý tưởng, chủ đề, hoặc dán đường dẫn (link website, YouTube) để AI phân tích và lấy cảm hứng..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition placeholder-slate-500 resize-y"
          />
        </FormSection>

        <FormSection title="Cảm xúc chủ đạo">
            <select
                multiple
                value={options.emotions}
                onChange={handleEmotionChange}
                className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition h-28"
            >
                {EMOTIONS.map(emotion => (
                    <option key={emotion} value={emotion} className="p-1 rounded hover:bg-sky-500">
                        {emotion}
                    </option>
                ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Giữ Ctrl (hoặc Cmd trên Mac) để chọn nhiều cảm xúc.</p>
        </FormSection>

        <FormSection title="Độ tuổi độc giả">
            <SelectInput 
                value={options.audience} 
                onChange={e => handleOptionChange('audience', e.target.value)}
                options={AUDIENCE_AGES}
            />
        </FormSection>

        <FormSection title="Phông chữ hiển thị">
            <select
                value={selectedFont}
                onChange={e => setSelectedFont(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
            >
                {FONT_OPTIONS.map(font => <option key={font.name} value={font.family}>{font.name}</option>)}
            </select>
        </FormSection>
        
        {isLoading ? (
          <button
            type="button"
            onClick={onCancel}
            className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang sáng tác... (Nhấn để huỷ)
          </button>
        ) : (
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-600 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            Sáng tác thơ
          </button>
        )}
      </form>
    </div>
  );
};

export default PoemForm;