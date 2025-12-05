// Debug utility to check if scripts are loading and executing
console.log('Debug script loaded');

// Check if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
  });
} else {
  console.log('DOM already loaded');
}

// Check if required libraries are loaded
setTimeout(() => {
  console.log('Atrament loaded:', typeof Atrament !== 'undefined');
  console.log('jsPDF loaded:', typeof jspdf !== 'undefined');
  console.log('pdfjsLib loaded:', typeof pdfjsLib !== 'undefined');
  
  // Check if DNoteApp is defined
  console.log('DNoteApp defined:', typeof DNoteApp !== 'undefined');
  
  // Check if PDFUtils is defined
  console.log('PDFUtils defined:', typeof PDFUtils !== 'undefined');
  
  // Check if event listeners are working
  const testBtn = document.getElementById('new-note-btn');
  if (testBtn) {
    console.log('New note button found:', testBtn);
    console.log('Button has event listeners:', testBtn.hasOwnProperty('_listeners'));
  } else {
    console.error('New note button not found');
  }
  
  // Check if notes list is populated
  const notesList = document.getElementById('notes-list');
  if (notesList) {
    console.log('Notes list found:', notesList);
    console.log('Notes list children:', notesList.children.length);
  } else {
    console.error('Notes list not found');
  }
}, 1000);