import { useState, useEffect } from 'react'
import { FileText, FileDown, BookOpen, GraduationCap, Settings2 } from 'lucide-react'
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

  const handleExportPDF = () => {
    exportToPDF(currentLesson, selections);
  };

  const handleExportWord = () => {
    exportToWord(currentLesson, selections);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
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
              onClick={handleExportWord}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-5 py-2 rounded-lg text-sm font-bold transition-colors border border-indigo-200"
            >
              <FileText className="w-4 h-4" />
              匯出 Word
            </button>
            
            <button 
              onClick={handleExportPDF}
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
    </div>
  )
}

export default App
