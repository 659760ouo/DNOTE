// DNOTE Application Main File
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the application
  DNoteApp.init();
});

// Main Application Object
const DNoteApp = {
  // Application state
  state: {
    currentNote: null,
    notes: [],
    isDrawing: false,
    currentTool: 'pen',
    currentColor: '#000000',
    currentLineWidth: 2,
    isPressureSupported: false,
    lastPressure: 0,
    startX: 0,
    startY: 0,
    shapeSuggestion: null,
    detectedShape: null,
    paths: [],
    undoStack: [],
    redoStack: []
  },
  
  // DOM Elements
  elements: {},
  
  // Initialize the application
  init: function() {
    console.log('Initializing DNOTE App...');
    
    // Get DOM elements
    this.elements.canvas = document.getElementById('drawing-canvas');
    this.elements.ctx = this.elements.canvas.getContext('2d');
    this.elements.notesList = document.getElementById('notes-list');
    this.elements.noteTitle = document.getElementById('note-title');
    this.elements.emptyState = document.getElementById('empty-state');
    this.elements.shapeSuggestion = document.getElementById('shape-suggestion');
    this.elements.shapeSuggestionModal = document.getElementById('shape-suggestion-modal');
    
    // Set canvas dimensions
    this.resizeCanvas();
    
    // Initialize Atrament for drawing
    this.initDrawing();
    
    // Check for pressure support
    this.checkPressureSupport();
    
    // Load sample notes
    this.loadSampleNotes();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load the first note by default
    if (this.state.notes.length > 0) {
      this.loadNote(this.state.notes[0]);
    }
    
    console.log('DNOTE App initialized successfully!');
  },
  
  // Resize canvas to match container
  resizeCanvas: function() {
    const container = document.getElementById('canvas-container');
    this.elements.canvas.width = container.clientWidth;
    this.elements.canvas.height = container.clientHeight;
  },
  
  // Initialize drawing functionality
  initDrawing: function() {
    this.sketchpad = new Atrament(this.elements.canvas, {
      color: this.state.currentColor,
      weight: this.state.currentLineWidth,
      mode: 'draw',
      smoothing: 0.85,
      adaptiveStroke: true
    });
  },
  
  // Check for pressure support
  checkPressureSupport: function() {
    try {
      // Test for pressure support on different input types
      const pressureEvent = new PressureEvent('pressure');
      this.state.isPressureSupported = 'pressure' in pressureEvent || 
                                      'webkitForce' in MouseEvent.prototype || 
                                      'mozPressure' in MouseEvent.prototype;
      
      console.log('Pressure support detected:', this.state.isPressureSupported);
    } catch (e) {
      console.warn('PressureEvent not supported:', e.message);
      this.state.isPressureSupported = false;
    }
  },
  
  // Load sample notes data
  loadSampleNotes: function() {
    this.state.notes = [
      {
        id: 1,
        title: 'Meeting Notes',
        content: 'Project timeline discussion and next steps for the marketing campaign.',
        category: 'Work',
        categoryColor: '#3b82f6',
        date: new Date(),
        starred: false,
        canvasData: null
      },
      {
        id: 2,
        title: 'Shopping List',
        content: 'Milk, eggs, bread, vegetables, and fruits for the week.',
        category: 'Personal',
        categoryColor: '#10b981',
        date: new Date(Date.now() - 86400000), // Yesterday
        starred: false,
        canvasData: null
      },
      {
        id: 3,
        title: 'Project Ideas',
        content: 'New app concept with AI integration for personal finance management.',
        category: 'Projects',
        categoryColor: '#8b5cf6',
        date: new Date(Date.now() - 172800000), // 2 days ago
        starred: true,
        canvasData: null
      },
      {
        id: 4,
        title: 'Recipe Collection',
        content: 'Collection of favorite recipes and new ones to try.',
        category: 'Personal',
        categoryColor: '#10b981',
        date: new Date(Date.now() - 604800000), // Last week
        starred: false,
        canvasData: null
      }
    ];
    
    // Add notes to the UI
    this.state.notes.forEach(note => {
      this.addNoteToList(note);
    });
  },
  
  // Set up event listeners
  setupEventListeners: function() {
    // Window resize event
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Tool selection
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = e.target.closest('.tool-btn').getAttribute('data-tool');
        this.selectTool(tool);
      });
    });
    
    // Color picker
    document.getElementById('color-picker-btn').addEventListener('click', () => {
      document.getElementById('color-picker').classList.toggle('hidden');
      document.getElementById('line-width-picker').classList.add('hidden');
    });
    
    document.querySelectorAll('#color-picker button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        this.state.currentColor = color;
        this.sketchpad.color = color;
        document.getElementById('color-picker').classList.add('hidden');
      });
    });
    
    // Line width picker
    document.getElementById('line-width-btn').addEventListener('click', () => {
      document.getElementById('line-width-picker').classList.toggle('hidden');
      document.getElementById('color-picker').classList.add('hidden');
    });
    
    document.getElementById('line-width-slider').addEventListener('input', (e) => {
      this.state.currentLineWidth = e.target.value;
      this.sketchpad.weight = e.target.value;
    });
    
    // Undo/Redo buttons
    document.getElementById('undo-btn').addEventListener('click', () => this.undo());
    document.getElementById('redo-btn').addEventListener('click', () => this.redo());
    
    // Clear canvas button
    document.getElementById('clear-canvas-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the canvas?')) {
        this.clearCanvas();
      }
    });
    
    // Import PDF button
    document.getElementById('import-pdf-btn').addEventListener('click', () => {
      document.getElementById('import-pdf-modal').classList.remove('hidden');
    });
    
    // Export PDF button
    document.getElementById('export-pdf-btn').addEventListener('click', () => {
      document.getElementById('export-pdf-modal').classList.remove('hidden');
    });
    
    // Modal close buttons
    document.getElementById('close-import-modal').addEventListener('click', () => {
      document.getElementById('import-pdf-modal').classList.add('hidden');
    });
    
    document.getElementById('cancel-import').addEventListener('click', () => {
      document.getElementById('import-pdf-modal').classList.add('hidden');
    });
    
    document.getElementById('close-export-modal').addEventListener('click', () => {
      document.getElementById('export-pdf-modal').classList.add('hidden');
    });
    
    document.getElementById('cancel-export').addEventListener('click', () => {
      document.getElementById('export-pdf-modal').classList.add('hidden');
    });
    
    // Import PDF
    document.getElementById('confirm-import').addEventListener('click', () => this.importPDF());
    
    // Export PDF
    document.getElementById('confirm-export').addEventListener('click', () => this.exportPDF());
    
    // Page range radio buttons
    document.querySelectorAll('input[name="page-range"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          document.getElementById('custom-page-range').classList.remove('hidden');
        } else {
          document.getElementById('custom-page-range').classList.add('hidden');
        }
      });
    });
    
    // New note button
    document.getElementById('new-note-btn').addEventListener('click', () => this.createNewNote());
    
    // Note title input
    this.elements.noteTitle.addEventListener('input', (e) => {
      if (this.state.currentNote) {
        this.state.currentNote.title = e.target.value;
        this.updateNoteInList(this.state.currentNote);
      }
    });
    
    // Shape suggestion buttons
    document.getElementById('accept-shape').addEventListener('click', () => this.acceptShapeSuggestion());
    document.getElementById('reject-shape').addEventListener('click', () => this.rejectShapeSuggestion());
    
    // Notification close button
    document.getElementById('close-notification').addEventListener('click', () => this.hideNotification());
    
    // Close color and line width pickers when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#color-picker-btn') && !e.target.closest('#color-picker')) {
        document.getElementById('color-picker').classList.add('hidden');
      }
      
      if (!e.target.closest('#line-width-btn') && !e.target.closest('#line-width-picker')) {
        document.getElementById('line-width-picker').classList.add('hidden');
      }
    });
    
    // Set up canvas event listeners for drawing
    this.setupCanvasEventListeners();
    
    // Navigation items
    document.getElementById('nav-all-notes').addEventListener('click', (e) => {
      e.preventDefault();
      this.showAllNotes();
    });
    
    document.getElementById('nav-recent').addEventListener('click', (e) => {
      e.preventDefault();
      this.showRecentNotes();
    });
    
    document.getElementById('nav-starred').addEventListener('click', (e) => {
      e.preventDefault();
      this.showStarredNotes();
    });
    
    document.getElementById('nav-trash').addEventListener('click', (e) => {
      e.preventDefault();
      this.showTrashNotes();
    });
  },
  
  // Set up canvas event listeners for drawing
  setupCanvasEventListeners: function() {
    // Mouse events
    this.elements.canvas.addEventListener('mousedown', (e) => {
      const rect = this.elements.canvas.getBoundingClientRect();
      this.state.startX = e.clientX - rect.left;
      this.state.startY = e.clientY - rect.top;
      
      // Get pressure value if supported
      let pressure = 1;
      if (this.state.isPressureSupported) {
        pressure = e.pressure || e.webkitForce || e.mozPressure || 1;
        this.state.lastPressure = pressure;
      }
      
      this.state.currentPath = [{x: this.state.startX, y: this.state.startY, pressure: pressure}];
      this.state.isDrawing = true;
    });
    
    this.elements.canvas.addEventListener('mousemove', (e) => {
      if (!this.state.isDrawing) return;
      
      const rect = this.elements.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Get pressure value if supported
      let pressure = 1;
      if (this.state.isPressureSupported) {
        pressure = e.pressure || e.webkitForce || e.mozPressure || this.state.lastPressure;
        this.state.lastPressure = pressure;
      }
      
      this.state.currentPath.push({x, y, pressure: pressure});
    });
    
    this.elements.canvas.addEventListener('mouseup', (e) => {
      if (!this.state.isDrawing) return;
      
      const rect = this.elements.canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      
      // Get pressure value if supported
      let pressure = 1;
      if (this.state.isPressureSupported) {
        pressure = e.pressure || e.webkitForce || e.mozPressure || this.state.lastPressure;
      }
      
      this.state.currentPath.push({x: endX, y: endY, pressure: pressure});
      this.state.paths.push([...this.state.currentPath]);
      
      this.state.undoStack.push({
        type: 'draw',
        path: [...this.state.currentPath]
      });
      
      this.state.redoStack = [];
      this.state.isDrawing = false;
      
      // Check if the drawn path might be a shape
      // Temporarily disabled to fix click issues
      // this.detectShape(this.state.startX, this.state.startY, endX, endY, this.state.currentPath);
    });
    
    // Touch events for mobile devices
    this.elements.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.elements.canvas.getBoundingClientRect();
      this.state.startX = touch.clientX - rect.left;
      this.state.startY = touch.clientY - rect.top;
      
      // Get pressure value from touch if supported
      let pressure = 1;
      if (touch.force) {
        pressure = touch.force;
        this.state.lastPressure = pressure;
      }
      
      this.state.currentPath = [{x: this.state.startX, y: this.state.startY, pressure: pressure}];
      this.state.isDrawing = true;
    });
    
    this.elements.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.state.isDrawing) return;
      
      const touch = e.touches[0];
      const rect = this.elements.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Get pressure value from touch if supported
      let pressure = 1;
      if (touch.force) {
        pressure = touch.force;
        this.state.lastPressure = pressure;
      }
      
      this.state.currentPath.push({x, y, pressure: pressure});
    });
    
    this.elements.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (!this.state.isDrawing) return;
      
      const touch = e.changedTouches[0];
      const rect = this.elements.canvas.getBoundingClientRect();
      const endX = touch.clientX - rect.left;
      const endY = touch.clientY - rect.top;
      
      // Get pressure value from touch if supported
      let pressure = 1;
      if (touch.force) {
        pressure = touch.force;
      }
      
      this.state.currentPath.push({x: endX, y: endY, pressure: pressure});
      this.state.paths.push([...this.state.currentPath]);
      
      this.state.undoStack.push({
        type: 'draw',
        path: [...this.state.currentPath]
      });
      
      this.state.redoStack = [];
      this.state.isDrawing = false;
      
      // Check if the drawn path might be a shape
      // Temporarily disabled to fix click issues
      // this.detectShape(this.state.startX, this.state.startY, endX, endY, this.state.currentPath);
    });
  },
  
  // Select a tool
  selectTool: function(tool) {
    this.state.currentTool = tool;
    
    // Update active tool button
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`.tool-btn[data-tool="${tool}"]`).classList.add('active');
    
    // Update Atrament mode
    switch(tool) {
      case 'pen':
        this.sketchpad.mode = 'draw';
        break;
      case 'eraser':
        this.sketchpad.mode = 'erase';
        break;
      case 'text':
        // Handle text tool separately
        break;
      default:
        this.sketchpad.mode = 'draw';
    }
  },
  
  // Undo last action
  undo: function() {
    if (this.state.undoStack.length === 0) return;
    
    const action = this.state.undoStack.pop();
    this.state.redoStack.push(action);
    
    // Redraw all paths except the last one
    this.redrawCanvas();
  },
  
  // Redo last undone action
  redo: function() {
    if (this.state.redoStack.length === 0) return;
    
    const action = this.state.redoStack.pop();
    this.state.undoStack.push(action);
    
    // Redraw all paths including the redone one
    this.redrawCanvas();
  },
  
  // Clear the canvas
  clearCanvas: function() {
    this.sketchpad.clear();
    this.state.paths = [];
    this.state.undoStack.push({type: 'clear'});
    this.state.redoStack = [];
  },
  
  // Redraw the canvas from paths
  redrawCanvas: function() {
    this.sketchpad.clear();
    
    // Redraw all paths
    this.state.paths.forEach(path => {
      if (path.length < 2) return;
      
      this.elements.ctx.beginPath();
      this.elements.ctx.moveTo(path[0].x, path[0].y);
      
      for (let i = 1; i < path.length; i++) {
        // Use pressure to adjust line width if available
        if (path[i].pressure && this.state.isPressureSupported) {
          // Map pressure (0-1) to line width (thin to thick)
          const pressureWidth = this.state.currentLineWidth * (0.5 + path[i].pressure * 1.5);
          this.elements.ctx.lineWidth = pressureWidth;
        } else {
          this.elements.ctx.lineWidth = this.state.currentLineWidth;
        }
        
        this.elements.ctx.lineTo(path[i].x, path[i].y);
        this.elements.ctx.stroke();
        this.elements.ctx.beginPath();
        this.elements.ctx.moveTo(path[i].x, path[i].y);
      }
      
      this.elements.ctx.strokeStyle = this.state.currentColor;
      this.elements.ctx.lineCap = 'round';
      this.elements.ctx.lineJoin = 'round';
    });
  },
  
  // Create a new note
  createNewNote: function() {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: '',
      category: 'Personal',
      categoryColor: '#10b981',
      date: new Date(),
      starred: false,
      canvasData: null
    };
    
    this.state.notes.unshift(newNote);
    this.addNoteToList(newNote);
    this.loadNote(newNote);
  },
  
  // Add a note to the notes list
  addNoteToList: function(note) {
    // Create note item element
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item p-3 bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md';
    noteItem.setAttribute('data-note-id', note.id);
    
    // Format date
    const dateStr = this.formatDate(note.date);
    
    // Set note item content
    noteItem.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-medium">${note.title}</h3>
        <span class="text-xs text-gray-500">${dateStr}</span>
      </div>
      <p class="text-sm text-gray-600 line-clamp-2">${note.content}</p>
      <div class="mt-2 flex items-center text-xs text-gray-500">
        <span class="w-2 h-2 rounded-full" style="background-color: ${note.categoryColor}"></span>
        <span>${note.category}</span>
      </div>
    `;
    
    // Add click event
    noteItem.addEventListener('click', () => {
      this.loadNote(note);
    });
    
    // Add to notes list at the beginning
    this.elements.notesList.insertBefore(noteItem, this.elements.notesList.firstChild);
  },
  
  // Update a note in the notes list
  updateNoteInList: function(note) {
    const noteItem = document.querySelector(`.note-item[data-note-id="${note.id}"]`);
    if (!noteItem) return;
    
    // Format date
    const dateStr = this.formatDate(note.date);
    
    // Update note item content
    noteItem.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-medium">${note.title}</h3>
        <span class="text-xs text-gray-500">${dateStr}</span>
      </div>
      <p class="text-sm text-gray-600 line-clamp-2">${note.content}</p>
      <div class="mt-2 flex items-center text-xs text-gray-500">
        <span class="w-2 h-2 rounded-full" style="background-color: ${note.categoryColor}"></span>
        <span>${note.category}</span>
      </div>
    `;
    
    // Add click event again after updating HTML
    noteItem.addEventListener('click', () => {
      this.loadNote(note);
    });
  },
  
  // Load a note
  loadNote: function(note) {
    this.state.currentNote = note;
    
    // Update note title
    this.elements.noteTitle.value = note.title;
    
    // Clear canvas
    this.sketchpad.clear();
    this.state.paths = [];
    this.state.undoStack = [];
    this.state.redoStack = [];
    
    // Hide empty state
    this.elements.emptyState.classList.add('hidden');
    
    // If note has canvas data, load it
    if (note.canvasData) {
      const img = new Image();
      img.onload = () => {
        this.elements.ctx.drawImage(img, 0, 0);
      };
      img.src = note.canvasData;
    }
    
    // Update active note item
    document.querySelectorAll('.note-item').forEach(item => {
      item.classList.remove('ring-2', 'ring-accent');
    });
    document.querySelector(`.note-item[data-note-id="${note.id}"]`).classList.add('ring-2', 'ring-accent');
  },
  
  // Format date to relative time (Today, Yesterday, etc.)
  formatDate: function(date) {
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours
    if (diff < 86400000) {
      return 'Today';
    }
    
    // Less than 48 hours
    if (diff < 172800000) {
      return 'Yesterday';
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)} days ago`;
    }
    
    // Otherwise, return formatted date
    return date.toLocaleDateString();
  },
  
  // Show all notes
  showAllNotes: function() {
    this.elements.notesList.innerHTML = '';
    this.state.notes.forEach(note => {
      this.addNoteToList(note);
    });
  },
  
  // Show recent notes
  showRecentNotes: function() {
    const recentNotes = this.state.notes.filter(note => {
      const diff = new Date() - note.date;
      return diff < 604800000; // Less than 7 days
    });
    
    this.elements.notesList.innerHTML = '';
    recentNotes.forEach(note => {
      this.addNoteToList(note);
    });
  },
  
  // Show starred notes
  showStarredNotes: function() {
    const starredNotes = this.state.notes.filter(note => note.starred);
    
    this.elements.notesList.innerHTML = '';
    starredNotes.forEach(note => {
      this.addNoteToList(note);
    });
  },
  
  // Show trash notes
  showTrashNotes: function() {
    // For now, just show an empty list with a message
    this.elements.notesList.innerHTML = `
      <div class="flex flex-col items-center justify-center py-8 text-gray-500">
        <i class="fa fa-trash-o text-4xl mb-2"></i>
        <p>No notes in trash</p>
      </div>
    `;
  },
  
  // Show notification
  showNotification: function(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    const notificationIcon = document.getElementById('notification-icon');
    
    // Set message
    notificationMessage.textContent = message;
    
    // Set type
    if (type === 'success') {
      notificationTitle.textContent = 'Success';
      notificationIcon.className = 'flex-shrink-0 mr-3 text-green-500';
      notificationIcon.innerHTML = '<i class="fa fa-check-circle text-xl"></i>';
    } else if (type === 'error') {
      notificationTitle.textContent = 'Error';
      notificationIcon.className = 'flex-shrink-0 mr-3 text-red-500';
      notificationIcon.innerHTML = '<i class="fa fa-exclamation-circle text-xl"></i>';
    } else if (type === 'info') {
      notificationTitle.textContent = 'Info';
      notificationIcon.className = 'flex-shrink-0 mr-3 text-blue-500';
      notificationIcon.innerHTML = '<i class="fa fa-info-circle text-xl"></i>';
    }
    
    // Show notification
    notification.classList.remove('translate-y-10', 'opacity-0');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 3000);
  },
  
  // Hide notification
  hideNotification: function() {
    const notification = document.getElementById('notification');
    notification.classList.add('translate-y-10', 'opacity-0');
  }
};