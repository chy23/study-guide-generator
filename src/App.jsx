import { useState, useEffect } from 'react'
import { FileText, FileDown, BookOpen, GraduationCap, Settings2, X } from 'lucide-react'
import LessonViewer from './components/LessonViewer'
import { lessonsData } from './data/lessonsData'
import { exportToPDF, exportToWord } from './utils/exportUtils'

function App() {
  const [currentLesson, setCurrentLesson] = useState(lessonsData[0]);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [selections, setSelections] = useState({
    vocab: new Set(),
    fillIn: new Set(),
    questions: new Set()
  });

  // Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('pdf');
  const [paperSize, setPaperSize] = useState('A4');
  const [marginSetting, setMarginSetting] = useState('normal');

  const margins = {
    normal: '2.54cm',
    moderate: '1.91cm',
    narrow: '1.27cm'
  };

  // Initialize selections when lesson changes
  useEffect(() => {
    if (currentLesson) {
      setSelections({
        vocab: new Set(currentLesson.vocab.map((_, i) => i)),
        fillIn: new Set(currentLesson.fillIn.map((_, i) => i)),
        questions: new Set(currentLesson.questions.map((_, i) => i))
      });
    }
  }, [currentLesson]);

  const toggleSelection = (type, index) => {
    setSelections(prev => {
      const newSet = new Set(prev[type]);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return { ...prev, [type]: newSet };
    });
  };

  const handleOpenExportModal = (type) => {
    setExportType(type);
    setShowExportModal(true);
  };

  const handleConfirmExport = () => {
    const margin = margins[marginSetting];
    if (exportType === 'pdf') {
      const marginMm = marginSetting === 'normal' ? 25.4 : marginSetting === 'moderate' ? 19.1 : 12.7;
      exportToPDF(currentLesson, selections, null, paperSize.toLowerCase(), marginMm);
    } else {
      exportToWord(currentLesson, selections, null, paperSize, margin);
    }
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {/* Watermarks */}
      <div className="fixed top-20 right-4 text-slate-300/80 text-sm font-bold z-50 pointer-events-none select-none tracking-widest">
        網站建立自楊家驊老師
      </div>
      <div className="fixed bottom-4 right-4 text-slate-300/80 text-sm font-bold z-50 pointer-events-none select-none tracking-widest">
        網站建立自楊家驊老師
      </div>

      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
            <BookOpen className="w-6 h-6" />
            <span>國語預習單生成系統</span>
          </div>
          <div className="flex items-center gap-4">
            <select 
              className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={currentLesson.id}
              onChange={(e) => setCurrentLesson(lessonsData.find(l => l.id === Number(e.target.value)))}
            >
              {lessonsData.map(l => (
                <option key={l.id} value={l.id}>第 {l.id} 課 {l.title}</option>
              ))}
            </select>
            
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button 
                onClick={() => setIsTeacherMode(false)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${!isTeacherMode ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <GraduationCap className="w-4 h-4" />
                學用版預覽
              </button>
              <button 
                onClick={() => setIsTeacherMode(true)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${isTeacherMode ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Settings2 className="w-4 h-4" />
                教用版預覽
              </button>
            </div>

            <button 
              onClick={() => handleOpenExportModal('word')}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-5 py-2 rounded-lg text-sm font-bold transition-colors border border-indigo-200"
            >
              <FileText className="w-4 h-4" />
              匯出 Word
            </button>
            
            <button 
              onClick={() => handleOpenExportModal('pdf')}
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              匯出 PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <LessonViewer 
            lesson={currentLesson} 
            selections={selections} 
            toggleSelection={toggleSelection} 
            isTeacherMode={isTeacherMode} 
          />
        </div>
      </main>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {exportType === 'pdf' ? <FileDown className="w-5 h-5 text-blue-600" /> : <FileText className="w-5 h-5 text-indigo-600" />}
                匯出 {exportType === 'pdf' ? 'PDF' : 'Word'} 設定
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">紙張大小</label>
                <div className="grid grid-cols-3 gap-3">
                  {['A4', 'B4', 'A3'].map(size => (
                    <button
                      key={size}
                      onClick={() => setPaperSize(size)}
                      className={`py-2 rounded-lg font-bold border-2 transition-colors ${paperSize === size ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">邊界寬度</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'normal', label: '標準' },
                    { id: 'moderate', label: '中等' },
                    { id: 'narrow', label: '窄' }
                  ].map(margin => (
                    <button
                      key={margin.id}
                      onClick={() => setMarginSetting(margin.id)}
                      className={`py-2 rounded-lg font-bold border-2 transition-colors ${marginSetting === margin.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {margin.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowExportModal(false)}
                className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmExport}
                className="px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
              >
                確認匯出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
