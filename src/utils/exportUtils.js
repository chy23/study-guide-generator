import html2pdf from 'html2pdf.js';

function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function getExportHTMLContent(lesson, selections, isTeacher, showWatermark = true, paperSize = 'a4', exportFormat = 'word') {
  // Filter selected items based on ID or index. 
  // Let's assume selections is an object with sets of selected indices for each type.
  const selectedVocab = lesson.vocab.filter((_, i) => selections.vocab.has(i));
  const selectedFillIn = lesson.fillIn.filter((_, i) => selections.fillIn.has(i));
  const selectedQuestions = lesson.questions.filter((_, i) => selections.questions.has(i));

  const unselectedFillIn = lesson.fillIn.filter((_, i) => !selections.fillIn.has(i));
  const distractors = [...unselectedFillIn].sort(() => 0.5 - Math.random()).slice(0, 2);
  const wordBankAnswers = [...selectedFillIn.map(item => item.answer), ...distractors.map(item => item.answer)];

  const wordBank = shuffleArray(wordBankAnswers);
  
  const buildWatermarkDiv = (id, spid) => `
      <div style="mso-element:header" id="${id}">
        <p class="MsoHeader">
          <!--[if gte vml 1]>
          <v:shapetype id="_x0000_t136" coordsize="21600,21600" o:spt="136" adj="10800" path="m@7,l@8,m@5,21600l@6,21600e">
           <v:formulas>
            <v:f eqn="sum #0 0 10800"/>
            <v:f eqn="prod #0 2 1"/>
            <v:f eqn="sum 21600 0 @1"/>
            <v:f eqn="sum 0 0 @2"/>
            <v:f eqn="sum 21600 0 @3"/>
            <v:f eqn="if @0 @3 0"/>
            <v:f eqn="if @0 21600 @1"/>
            <v:f eqn="if @0 0 @2"/>
            <v:f eqn="if @0 @4 21600"/>
            <v:f eqn="mid @5 @6"/>
            <v:f eqn="mid @8 @5"/>
            <v:f eqn="mid @7 @8"/>
            <v:f eqn="mid @6 @7"/>
            <v:f eqn="sum @6 0 @5"/>
           </v:formulas>
           <v:path textpathok="t" o:connecttype="custom" o:connectlocs="@9,0;@10,10800;@11,21600;@12,10800" o:connectangles="270,180,90,0"/>
           <v:textpath on="t" fitshape="t"/>
           <v:handles>
            <v:h position="#0,bottomRight" xrange="6629,14971"/>
           </v:handles>
           <o:lock v:ext="edit" text="t" shapetype="t"/>
          </v:shapetype>
          <v:shape id="WaterMarkObject${id}" o:spid="_x0000_s${spid}" type="#_x0000_t136"
           style="position:absolute;left:0;text-align:left;margin-left:-20pt;
           margin-top:200pt;width:500pt;height:200pt;rotation:-45;z-index:-251657216;
           mso-position-horizontal:center;mso-position-horizontal-relative:margin;
           mso-position-vertical:center;mso-position-vertical-relative:margin"
           fillcolor="silver" stroked="f">
           <v:fill opacity=".25"/>
           <v:textpath style="font-family:'標楷體';font-size:87pt;font-weight:bold;font-style:italic" string="彙整自楊家驊老師"/>
           <o:lock v:ext="edit" position="t" selection="t" rotation="t" size="t" text="t" delete="t"/>
          </v:shape>
          <![endif]-->
        </p>
      </div>
  `;

  let watermarkHtml = '';
  let watermarkCSS = '';
  
  if (showWatermark && exportFormat === 'word') {
    watermarkHtml = buildWatermarkDiv('h1', '101') + buildWatermarkDiv('h2', '102') + buildWatermarkDiv('h3', '103');
  }

  const generatePage = (isTeacher) => {
    // Task 1
    const pCountText = isTeacher ? `<span style="color:red; font-weight:bold;">${lesson.paragraphs}</span>` : '＿＿＿';
    const criteriaText = isTeacher ? `<div style="color:red; font-weight:bold; margin-top: 5px; line-height: 1.6;">${lesson.criteria || ''}</div>` : '';

    // Task 2
    let vocabRows = '';
    for (let i = 0; i < selectedVocab.length; i += 2) {
      const v1 = selectedVocab[i];
      const v2 = selectedVocab[i + 1];
      
      const formatVocab = (v, idx) => {
        if (!v) return '';
        const word = isTeacher 
          ? `<span style="color:red; font-weight:bold; letter-spacing: 2px;">${v.word}</span>` 
          : '（　　　　　）';
        return `(${idx}) ${word}：${v.meaning}`;
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
        : `（　　　　　　　）`;
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
          
        let tagBg = '#475569'; // default slate-600
        if (q.type === '提取訊息') tagBg = '#2563eb'; // blue-600
        if (q.type === '推論訊息') tagBg = '#f97316'; // orange-500
        if (q.type === '詮釋整合') tagBg = '#16a34a'; // green-600
        if (q.type === '比較評估') tagBg = '#9333ea'; // purple-600
        
        const tag = isTeacher ? `<span style="background-color:${tagBg}; color:white; padding: 2px 6px; font-size: 12px; margin-left: 6px; border-radius: 2px; font-weight: bold; white-space: nowrap;">${q.type}</span>` : '';
        
        return `<div><span style="font-weight:bold;">(${idx}) ${q.q}</span>${tag}</div><div>答：${answer}</div>`;
      };

      questionRows += `
        <tr>
          <td style="width:50%; border: 1px solid #000; padding: 12px; vertical-align: top;">${formatQ(q1, i + 1)}</td>
          <td style="width:50%; border: 1px solid #000; padding: 12px; vertical-align: top;">${formatQ(q2, i + 2)}</td>
        </tr>
      `;
    }

    return `
      ${watermarkHtml}
      <div style="font-family: '標楷體', 'BiauKai', 'DFKai-SB'; margin: 0 auto; width: 100%; max-width: 800px; color: #000; line-height: 1.6; font-size: 14pt; min-height: 100vh; ${watermarkCSS}">
        
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
          ${isTeacher ? `(4) 結構說明：<div style="color:red; font-weight:bold; margin-top: 5px; line-height: 1.6;">${lesson.structure || ''}</div>` : ''}
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


export function exportToPDF(lesson, selections, filename, paperSize = 'a4', margin = 10, showWatermark = true) {
  // Pass showWatermark = false to HTML so it doesn't generate CSS watermarks
  const htmlContent = getExportHTMLContent(lesson, selections, false, false, paperSize, 'pdf');

  const element = document.createElement('div');
  element.innerHTML = htmlContent;

  const opt = {
    margin:       margin,
    filename:     filename || `${lesson.title}_預習講義.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: paperSize, orientation: 'portrait' }
  };

  if (showWatermark) {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1414;
    const ctx = canvas.getContext('2d');
    ctx.translate(500, 707);
    ctx.rotate(-45 * Math.PI / 180);
    ctx.font = 'bold italic 87pt "標楷體", "BiauKai", "DFKai-SB", sans-serif';
    ctx.fillStyle = 'rgba(128, 128, 128, 0.25)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('彙整自楊家驊老師', 0, 0);
    const dataUrl = canvas.toDataURL('image/png');

    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();
        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      }
    }).save();
  } else {
    html2pdf().set(opt).from(element).save();
  }
}

export function exportToWord(lesson, selections, filename, paperSize = 'A4', margin = '2cm', showWatermark = true) {
  const htmlContent = getExportHTMLContent(lesson, selections, false, showWatermark, paperSize, 'word');
  
  const header = `<html xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word"
    xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset='utf-8'>
      <!--[if gte mso 9]><xml>
       <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
       </w:WordDocument>
      </xml><![endif]-->
      <style>
        body { font-family: '標楷體', 'BiauKai', 'DFKai-SB'; }
        @page { size: ${paperSize}; margin: ${margin}; mso-header: h1; mso-even-header: h2; mso-first-header: h3; }
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
