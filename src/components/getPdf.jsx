import jsPDF from 'jspdf';
import MedCare from '../assets/v987-18a-removebg-preview.png';

/* ---------- Page 1 header ---------- */
const addLogoAndHeading = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  const logoWidth = 40;
  const logoHeight = 40;
  const xLogo = (pageWidth - logoWidth) / 2;
  const yLogo = 20;
  doc.addImage(MedCare, 'PNG', xLogo, yLogo, logoWidth, logoHeight);

  const heading = 'MedLife.AI - Chat History';
  doc.setFont('helvetica', 'bold').setFontSize(18);
  const textWidth = doc.getTextWidth(heading);
  const xOffset = (pageWidth - textWidth) / 2;
  doc.text(heading, xOffset, yLogo + logoHeight + 14);

  const date = new Date().toLocaleDateString();
  doc.setFont('helvetica', 'normal').setFontSize(12);
  doc.text(`Generated on: ${date}`, pageWidth / 2, yLogo + logoHeight + 26, { align: 'center' });

  doc.addPage(); // start chat on page 2
};

/* ---------- utils ---------- */
const sanitize = (text = '') =>
  String(text)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/* ---------- Streaming writer: draws one line at a time (no gaps) ---------- */
const writeLinesStreaming = (doc, lines, opts) => {
  const {
    leftMargin,
    rightMargin,
    topMargin,
    bottomMargin,
    y,
    font = { family: 'helvetica', style: 'normal', size: 12, color: [0, 0, 0] },
    lineHeightFactor = 0.5,
    paragraphGap = 1,
  } = opts;

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const usableW = pageW - leftMargin - rightMargin;

  doc.setFont(font.family, font.style)
     .setFontSize(font.size)
     .setTextColor(...font.color);

  const lineH = font.size * lineHeightFactor;
  let cursorY = y;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // page break *per line* so we never leave large blanks
    if (cursorY + lineH > pageH - bottomMargin) {
      doc.addPage();
      cursorY = topMargin;
    }

    // draw the line
    doc.text(line, leftMargin, cursorY, { maxWidth: usableW });

    cursorY += lineH;
  }

  // paragraph spacing
  return cursorY + paragraphGap;
};

/* ---------- Chat writer (continuous) ---------- */
const addChatToPDF = (doc, chatHistory) => {
  const leftMargin = 20;
  const rightMargin = 20;
  const topMargin = 20;
  const bottomMargin = 20;

  const usableW = doc.internal.pageSize.getWidth() - leftMargin - rightMargin;

  // Build Q/A pairs
  const qaPairs = [];
  for (let i = 0; i < chatHistory.length; i++) {
    const item = chatHistory[i];
    const isUser = item?.sender === 'user' || item?.type === 'user';
    if (isUser) {
      const question = item;
      const next = chatHistory[i + 1];
      const hasAnswer = next && (next.sender === 'ai' || next.type === 'ai');
      const answer = hasAnswer ? next : null;
      qaPairs.push({ question, answer });
      if (answer) i++;
    }
  }

  let y = topMargin;

  qaPairs.forEach(({ question, answer }) => {
    // QUESTION (blue + bold)
    const qPrefix = `${question?.name || 'You'}: `;
    const qText = sanitize(question?.text || question?.message || '');
    const qLines = doc.splitTextToSize(qPrefix + qText, usableW);

    y = writeLinesStreaming(doc, qLines, {
      leftMargin, rightMargin, topMargin, bottomMargin, y,
      font: { family: 'helvetica', style: 'bold', size: 12, color: [0, 102, 204] },
      lineHeightFactor: 0.5,
      paragraphGap: 8 , // small gap before the answer
    });

    // ANSWER (black, normal)
    if (answer) {
      const aPrefix = `${answer?.name || 'Medlife.ai'}: `;
      const aText = sanitize(answer?.text || answer?.message || '');
      const aLines = doc.splitTextToSize(aPrefix + aText, usableW);

      y = writeLinesStreaming(doc, aLines, {
        leftMargin, rightMargin, topMargin, bottomMargin, y,
        font: { family: 'helvetica', style: 'normal', size: 12, color: [0, 0, 0] },
        lineHeightFactor: 0.5,
        paragraphGap: 8, // a bit more before the next question
      });
    }
  });
};

/* ---------- API ---------- */
const generatePDF = (chatHistory, memberName = null) => {
  const doc = new jsPDF();

  // neutral global; we control spacing ourselves
  if (typeof doc.setLineHeightFactor === 'function') {
    doc.setLineHeightFactor(1.0);
  }

  addLogoAndHeading(doc);
  addChatToPDF(doc, chatHistory);

  const filename = memberName
    ? `Chat_History_${memberName.replace(/\s+/g, '_')}.pdf`
    : `Chat_History_${new Date().toISOString().split('T')[0]}.pdf`;

  doc.save(filename);
};

export default generatePDF;
