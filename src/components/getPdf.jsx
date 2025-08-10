import jsPDF from 'jspdf';
import MedCare from '../assets/v987-18a-removebg-preview.png';

const addLogoAndHeading = (doc) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add logo
    const logoWidth = 40;
    const logoHeight = 40;
    const xLogo = (pageWidth - logoWidth) / 2;
    const yLogo = 20;

    doc.addImage(MedCare, 'PNG', xLogo, yLogo, logoWidth, logoHeight);

    // Centered Heading
    const heading = "MedLife.AI - Chat History";
    doc.setFont('helvetica', 'bold').setFontSize(18);
    const textWidth = doc.getTextWidth(heading);
    const xOffset = (pageWidth - textWidth) / 2;
    doc.text(heading, xOffset, yLogo + logoHeight + 15);

    // Add date
    const date = new Date().toLocaleDateString();
    doc.setFont('helvetica', 'normal').setFontSize(12);
    doc.text(`Generated on: ${date}`, pageWidth / 2, yLogo + logoHeight + 30, { align: 'center' });
    
    doc.addPage();
};

const addChatToPDF = (doc, chatHistory, memberName) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Group Q&A pairs
    let qaPairs = [];
    for (let i = 0; i < chatHistory.length; i++) {
        if (chatHistory[i].sender === "user" || chatHistory[i].type === "user") {
            const question = chatHistory[i];
            const answer = chatHistory[i + 1] && (chatHistory[i + 1].sender === "ai" || chatHistory[i + 1].type === "ai")
                ? chatHistory[i + 1]
                : null;
            qaPairs.push({ question, answer });
            if (answer) i++; 
        }
    }

    qaPairs.forEach((pair, index) => {
        let yOffset = 30;

        // Question
        const qText = `${pair.question.name || "You"}: ${pair.question.text || pair.question.message || ""}`;
        const qLines = doc.splitTextToSize(qText.replace(/<br>/g, "\n").replace(/<[^>]*>/g, ""), pageWidth - 30);
        doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(0, 102, 204);
        doc.text(qLines, 20, yOffset);
        yOffset += (doc.internal.getFontSize() + 4) * qLines.length + 10;

        // Answer
        if (pair.answer) {
            const aText = `${pair.answer.name || "Medlife.ai"}: ${pair.answer.text || pair.answer.message || ""}`;
            const aLines = doc.splitTextToSize(aText.replace(/<br>/g, "\n").replace(/<[^>]*>/g, ""), pageWidth - 30);
            doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(0, 0, 0);
            doc.text(aLines, 20, yOffset);
        }

        // Add new page unless it's the last pair
        if (index < qaPairs.length - 1) {
            doc.addPage();
        }
    });
};


const generatePDF = (chatHistory, memberName = null) => {
    const doc = new jsPDF();
    
    // Add logo and heading
    addLogoAndHeading(doc);
    
    // Add chat content
    addChatToPDF(doc, chatHistory, memberName);
    
    // Generate filename
    const filename = memberName 
        ? `Chat_History_${memberName.replace(/\s+/g, '_')}.pdf`
        : `Chat_History_${new Date().toISOString().split('T')[0]}.pdf`;
    
    doc.save(filename);
};

export default generatePDF;
