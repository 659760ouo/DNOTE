// PDF Utilities for DNOTE App

const PDFUtils = {
  // Import PDF file
  importPDF: function(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const typedarray = new Uint8Array(e.target.result);
        
        // Use PDF.js to render the PDF
        pdfjsLib.getDocument(typedarray).promise.then(pdf => {
          // Get the first page
          return pdf.getPage(1).then(page => {
            const viewport = page.getViewport({scale: 1.5});
            
            // Create a canvas element to render the PDF page
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render the PDF page into the canvas context
            const renderContext = {
              canvasContext: context,
              viewport: viewport
            };
            
            return page.render(renderContext).promise.then(() => {
              // Return the canvas data URL
              return canvas.toDataURL('image/png');
            });
          });
        }).then(imageData => {
          resolve(imageData);
        }).catch(error => {
          reject(error);
        });
      };
      
      reader.onerror = function() {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  },
  
  // Export note to PDF
  exportPDF: function(noteTitle, canvasData) {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add title
        pdf.setFontSize(18);
        pdf.text(noteTitle, 20, 20);
        
        // Add date
        const date = new Date().toLocaleDateString();
        pdf.setFontSize(10);
        pdf.text(`Exported on: ${date}`, 20, 25);
        
        // If there's canvas data, add it to the PDF
        if (canvasData) {
          // Calculate position and dimensions to fit the page
          const imgProps = pdf.getImageProperties(canvasData);
          const pdfWidth = pdf.internal.pageSize.getWidth() - 40; // 20mm margin on each side
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          // Add image to PDF
          pdf.addImage(canvasData, 'PNG', 20, 30, pdfWidth, pdfHeight);
        }
        
        // Save the PDF
        const pdfOutput = pdf.output('datauristring');
        resolve(pdfOutput);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  // Process PDF import
  processImport: function(file) {
    // Show loading state
    document.getElementById('import-status').textContent = 'Loading PDF...';
    document.getElementById('import-status').classList.remove('hidden');
    document.getElementById('confirm-import').disabled = true;
    
    // Import PDF
    this.importPDF(file)
      .then(imageData => {
        // Create a new note with the PDF content
        const newNote = {
          id: Date.now(),
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          content: `Imported PDF: ${file.name}`,
          category: 'Documents',
          categoryColor: '#6366f1',
          date: new Date(),
          starred: false,
          canvasData: imageData
        };
        
        // Add note to the app
        DNoteApp.state.notes.unshift(newNote);
        DNoteApp.addNoteToList(newNote);
        DNoteApp.loadNote(newNote);
        
        // Close modal
        document.getElementById('import-pdf-modal').classList.add('hidden');
        
        // Show success notification
        DNoteApp.showNotification('PDF imported successfully!');
      })
      .catch(error => {
        console.error('Error importing PDF:', error);
        DNoteApp.showNotification('Failed to import PDF. Please try again.', 'error');
      })
      .finally(() => {
        // Reset loading state
        document.getElementById('import-status').classList.add('hidden');
        document.getElementById('confirm-import').disabled = false;
      });
  },
  
  // Process PDF export
  processExport: function(noteTitle, canvasData) {
    // Show loading state
    document.getElementById('export-status').textContent = 'Generating PDF...';
    document.getElementById('export-status').classList.remove('hidden');
    document.getElementById('confirm-export').disabled = true;
    
    // Export PDF
    this.exportPDF(noteTitle, canvasData)
      .then(pdfData => {
        // Create download link
        const link = document.createElement('a');
        link.href = pdfData;
        link.download = `${noteTitle}.pdf`;
        link.click();
        
        // Close modal
        document.getElementById('export-pdf-modal').classList.add('hidden');
        
        // Show success notification
        DNoteApp.showNotification('PDF exported successfully!');
      })
      .catch(error => {
        console.error('Error exporting PDF:', error);
        DNoteApp.showNotification('Failed to export PDF. Please try again.', 'error');
      })
      .finally(() => {
        // Reset loading state
        document.getElementById('export-status').classList.add('hidden');
        document.getElementById('confirm-export').disabled = false;
      });
  }
};

// Add event listeners for PDF import/export
document.addEventListener('DOMContentLoaded', function() {
  // File input change event
  document.getElementById('pdf-file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        DNoteApp.showNotification('File too large. Please select a file smaller than 10MB.', 'error');
        return;
      }
      
      // Check file type
      if (!file.type.match('application/pdf')) {
        DNoteApp.showNotification('Please select a PDF file.', 'error');
        return;
      }
      
      // Enable import button
      document.getElementById('confirm-import').disabled = false;
      document.getElementById('selected-file-name').textContent = file.name;
    }
  });
  
  // Import PDF button
  document.getElementById('confirm-import').addEventListener('click', function() {
    const fileInput = document.getElementById('pdf-file-input');
    const file = fileInput.files[0];
    
    if (file) {
      PDFUtils.processImport(file);
    }
  });
  
  // Export PDF button
  document.getElementById('confirm-export').addEventListener('click', function() {
    if (DNoteApp.state.currentNote) {
      const noteTitle = DNoteApp.elements.noteTitle.value || 'Untitled Note';
      const canvasData = DNoteApp.elements.canvas.toDataURL('image/png');
      
      PDFUtils.processExport(noteTitle, canvasData);
    }
  });
});