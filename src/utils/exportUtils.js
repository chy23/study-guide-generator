import html2pdf from 'html2pdf.js';

function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function getExportHTMLContent(lesson, selections, isTeacherMode) {
  // Filter selected items based on ID or index. 
  // Let's assume selections is an object with sets of selected indices for each type.
  const selectedVocab = lesson.vocab.filter((_, i) => selections.vocab.has(i));
  const selectedFillIn = lesson.fillIn.filter((_, i) => selections.fillIn.has(i));
  const selectedQuestions = lesson.questions.filter((_, i) => selections.questions.has(i));

  const unselectedFillIn = lesson.fillIn.filter((_, i) => !selections.fillIn.has(i));
  const distractors = [...unselectedFillIn].sort(() => 0.5 - Math.random()).slice(0, 2);
  const wordBankAnswers = [...selectedFillIn.map(item => item.answer), ...distractors.map(item => item.answer)];

  const wordBank = shuffleArray(wordBankAnswers);

  const generatePage = (isTeacher) => {
    // Task 1
    const pCountText = isTeacher ? `<span style="color:red; font-weight:bold;">${lesson.paragraphs}</span>` : '＿＿＿';
    const structureText = isTeacher ? `<div style="color:red; font-weight:bold; margin-top: 5px; line-height: 1.6;">${lesson.structure || ''}</div>` : '<br/><br/><br/><br/>';
    const criteriaText = isTeacher ? `<div style="color:red; font-weight:bold; margin-top: 5px; line-height: 1.6;">${lesson.criteria || ''}</div>` : '';

    // Task 2
    let vocabRows = '';
    for (let i = 0; i < selectedVocab.length; i += 2) {
      const v1 = selectedVocab[i];
      const v2 = selectedVocab[i + 1];
      
      const formatVocab = (v, idx) => {
        if (!v) return '';
        const word = isTeacher 
          ? `<span style="color:red; font-weight:bold;">${v.word}</span>` 
          : '＿＿＿＿＿＿';
        return `(${idx}) ${word} ：${v.meaning}`;
      };

      vocabRows += `
        <tr>
          <td style="width:50%; padding: 8px 8px 8px 0; vertical-align: top;">${formatVocab(v1, i + 1)}</td>
          <td style="width:50%; padding: 8px 8px 8px 0; vertical-align: top;">${formatVocab(v2, i + 2)}</td>
        </tr>
      `;
    }

    // Task 3
    let wordBankHtml = '';
    if (wordBank.length > 0) {
      wordBankHtml = `<div style="border: 1px solid #000; padding: 15px; margin-bottom: 15px; text-align: center; font-size: 14pt;">${wordBank.join('&nbsp;&nbsp;&nbsp;&nbsp;')}</div>`;
    }

    let fillInHtml = '';
    selectedFillIn.forEach((item, index) => {
      let sentence = item.sentence;
      const blank = isTeacher 
        ? `( <span style="color:red; font-weight:bold;">${item.answer}</span> )` 
        : `(       )`;
      sentence = sentence.replace(/（\s*）|\(\s*\)/g, blank);
      fillInHtml += `<div style="margin-bottom: 12px; line-height: 1.8;">(${index + 1}) ${sentence}</div>`;
    });

    // Task 4
    let questionRows = '';
    for (let i = 0; i < selectedQuestions.length; i += 2) {
      const q1 = selectedQuestions[i];
      const q2 = selectedQuestions[i + 1];

      const formatQ = (q, idx) => {
        if (!q) return '';
        const answer = isTeacher 
          ? `<div style="color:red; margin-top: 8px;">${q.a}</div>` 
          : `<br/><br/><br/><br/><br/>`;
        return `<div>(${idx}) ${q.q}</div><div>答：${answer}</div>`;
      };

      questionRows += `
        <tr>
          <td style="width:50%; border: 1px solid #000; padding: 12px; vertical-align: top;">${formatQ(q1, i + 1)}</td>
          <td style="width:50%; border: 1px solid #000; padding: 12px; vertical-align: top;">${formatQ(q2, i + 2)}</td>
        </tr>
      `;
    }

    return `
      <div style="font-family: '標楷體', 'BiauKai', 'DFKai-SB'; margin: 0 auto; width: 100%; max-width: 800px; color: #000; line-height: 1.6; font-size: 14pt;">
        
        <div style="text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 10px;">
          115 六上國語預習講義 翰林版 第 ${lesson.id} 課 &nbsp;&nbsp;${lesson.title}&nbsp;&nbsp; 作者 ： ${lesson.author}
        </div>
        <div style="text-align: center; font-size: 14pt; margin-bottom: 25px;">
          <span style="font-weight: bold;">（${isTeacher ? '教用版' : '學用版'}）</span> 班級：_______ 座號：_______ 姓名：_____________
        </div>

        <div style="font-weight:bold; margin-bottom: 10px;">課前任務 1、讀讀看</div>
        <div style="margin-bottom: 25px;">
          (1) 先朗讀課文三遍，標示出標點符號。；！？。 &nbsp;&nbsp;&nbsp;&nbsp; (2) 自然段有 ${pCountText} 段。<br/>
          (3) 圈出不懂的語詞、找重點句、句型、修辭。劃線標註段落重點句。<br/>
          (4) 結構說明：${structureText}
          ${isTeacher ? `<div style="margin-top: 8px;">(5) 判定標準：${criteriaText}</div>` : ''}
        </div>

        <div style="font-weight:bold; margin-bottom: 10px;">課前任務 2、暖身大挑戰(答題時盡量不看課本，測試自己)在空格內填入 語詞加注音</div>
        <table style="width: 100%; margin-bottom: 25px; table-layout: fixed; border-collapse: collapse;">
          <tbody>
            ${vocabRows}
          </tbody>
        </table>

        <div style="font-weight:bold; margin-bottom: 10px;">課前任務 3、 填入正確語詞，不懂的語詞請查字典：</div>
        ${wordBankHtml}
        <div style="margin-bottom: 25px;">
          ${fillInHtml}
        </div>

        <div style="font-weight:bold; margin-bottom: 10px;">課前任務 4、 文意預習：</div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; table-layout: fixed;">
          <tbody>
            ${questionRows}
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: right; font-size: 14pt; font-weight: bold; padding-right: 20px;">
          家長簽名：______________ 
        </div>

      </div>
    `;
  };

  const studentPage = generatePage(false);
  const teacherPage = generatePage(true);

  // Combine with page break
  return `
    <div class="export-container">
      ${studentPage}
      <div style="page-break-after: always; height: 0;"></div>
      ${teacherPage}
    </div>
  `;
}

export function exportToPDF(lesson, selections, filename, paperSize = 'a4', margin = 10) {
  const htmlContent = getExportHTMLContent(lesson, selections, false); // generatePage internally does both

  const element = document.createElement('div');
  element.innerHTML = htmlContent;

  const opt = {
    margin:       margin,
    filename:     filename || `${lesson.title}_預習講義.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: paperSize, orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

export function exportToWord(lesson, selections, filename, paperSize = 'A4', margin = '2cm') {
  const htmlContent = getExportHTMLContent(lesson, selections, false);
  
  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <style>
        body { font-family: '標楷體', 'BiauKai', 'DFKai-SB'; }
        @page { size: ${paperSize}; margin: ${margin}; }
      </style>
    </head><body>`;
  const footer = `</body></html>`;
  
  const sourceHTML = header + htmlContent + footer;
  
  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${lesson.title}_預習講義.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
