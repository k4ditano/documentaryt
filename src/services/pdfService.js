import * as pdfjsLib from 'pdfjs-dist';
// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
export const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item) => {
                if ('str' in item) {
                    return item.str;
                }
                return '';
            })
                .join(' ');
            fullText += pageText + '\n\n';
        }
        if (!fullText.trim()) {
            throw new Error('No se pudo extraer texto del PDF');
        }
        return fullText;
    }
    catch (error) {
        console.error('Error al extraer texto del PDF:', error);
        throw new Error('No se pudo extraer el texto del PDF');
    }
};
export const analyzePDF = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/pdf/analyze', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Error al analizar el PDF');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error en analyzePDF:', error);
        throw error;
    }
};
