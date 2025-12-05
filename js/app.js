// Note Class - 用于创建和管理笔记对象
class Note {
    constructor(id, title, content = '', category = 'Personal', categoryColor = '#10b981', isHandwritten = false, canvasData = null) {
        this.id = id || this.generateId();
        this.title = title || 'Untitled Note';
        this.content = content;
        this.category = category;
        this.categoryColor = categoryColor;
        this.isHandwritten = isHandwritten;
        this.canvasData = canvasData;
        this.hasAttachment = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    updateTitle(newTitle) {
        if (newTitle && newTitle.trim() !== '') {
            this.title = newTitle.trim();
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }
    
    updateContent(newContent) {
        this.content = newContent;
        this.updatedAt = new Date();
    }
    
    updateCategory(newCategory, newCategoryColor) {
        this.category = newCategory;
        this.categoryColor = newCategoryColor;
        this.updatedAt = new Date();
    }
    
    updateCanvasData(newCanvasData) {
        this.canvasData = newCanvasData;
        this.isHandwritten = true;
        this.updatedAt = new Date();
    }
    
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            category: this.category,
            categoryColor: this.categoryColor,
            isHandwritten: this.isHandwritten,
            canvasData: this.canvasData,
            hasAttachment: this.hasAttachment,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }
    
    static fromJSON(json) {
        const note = new Note();
        note.id = json.id;
        note.title = json.title;
        note.content = json.content;
        note.category = json.category;
        note.categoryColor = json.categoryColor;
        note.isHandwritten = json.isHandwritten;
        note.canvasData = json.canvasData;
        note.hasAttachment = json.hasAttachment;
        note.createdAt = new Date(json.createdAt);
        note.updatedAt = new Date(json.updatedAt);
        return note;
    }
}

// Category Class - 用于创建和管理分类对象
class Category {
    constructor(id, name, color = '#3b82f6', icon = 'folder') {
        this.id = id || this.generateId();
        this.name = name;
        this.color = color;
        this.icon = icon;
        this.noteCount = 0;
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    update(name, color, icon) {
        this.name = name;
        this.color = color;
        this.icon = icon;
    }
    
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            icon: this.icon,
            noteCount: this.noteCount
        };
    }
    
    static fromJSON(json) {
        const category = new Category();
        category.id = json.id;
        category.name = json.name;
        category.color = json.color;
        category.icon = json.icon;
        category.noteCount = json.noteCount;
        return category;
    }
}

// Notification Class - 用于显示用户通知
class Notification {
    constructor() {
        this.container = this.createContainer();
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
        return container;
    }
    
    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-x-full opacity-0`;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-blue-500');
        }
        
        // Add icon
        const icon = document.createElement('i');
        icon.className = 'fa';
        
        switch (type) {
            case 'success':
                icon.classList.add('fa-check-circle');
                break;
            case 'error':
                icon.classList.add('fa-exclamation-circle');
                break;
            case 'warning':
                icon.classList.add('fa-exclamation-triangle');
                break;
            default:
                icon.classList.add('fa-info-circle');
        }
        
        // Add message
        const messageEl = document.createElement('span');
        messageEl.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'ml-auto text-white/80 hover:text-white';
        closeBtn.innerHTML = '<i class="fa fa-times"></i>';
        closeBtn.addEventListener('click', () => this.hide(notification));
        
        // Assemble notification
        notification.appendChild(icon);
        notification.appendChild(messageEl);
        notification.appendChild(closeBtn);
        
        // Add to container
        this.container.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
        }, 10);
        
        // Auto hide after duration
        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }
        
        return notification;
    }
    
    hide(notification) {
        notification.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
            }
        }, 300);
    }
    
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

// NoteApp Class - 主应用类
class NoteApp {
    constructor() {
        // DOM Elements
        this.contentArea = document.getElementById('content-area');
        this.notesGridView = document.getElementById('notes-grid-view');
        this.noteEditorView = document.getElementById('note-editor-view');
        this.pdfsView = document.getElementById('pdfs-view');
        this.pdfViewer = document.getElementById('pdf-viewer');
        this.categoriesView = document.getElementById('categories-view');
        this.currentViewTitle = document.getElementById('current-view-title');
        this.categoriesList = document.getElementById('categories-list');
        
        // Navigation
        this.navItems = document.querySelectorAll('.nav-item[data-view]');
        this.newNoteBtn = document.getElementById('new-note-btn');
        this.addNoteCard = document.getElementById('add-note-card');
        this.closeEditorBtn = document.getElementById('close-editor-btn');
        this.saveNoteBtn = document.getElementById('save-note-btn');
        this.closePdfBtn = document.getElementById('close-pdf-btn');
        
        // Editor Tools
        this.toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
        this.colorOptions = document.querySelectorAll('.color-option');
        this.brushSize = document.getElementById('brush-size');
        this.recognizeTextBtn = document.getElementById('recognize-text-btn');
        this.textInputOverlay = document.getElementById('text-input-overlay');
        this.recognitionOverlay = document.getElementById('recognition-overlay');
        this.cancelRecognitionBtn = document.getElementById('cancel-recognition-btn');
        this.insertRecognizedBtn = document.getElementById('insert-recognized-btn');
        this.insertTextBtn = document.getElementById('insert-text-btn');
        
        // Color Picker
        this.colorR = document.getElementById('color-r');
        this.colorG = document.getElementById('color-g');
        this.colorB = document.getElementById('color-b');
        this.colorRValue = document.getElementById('color-r-value');
        this.colorGValue = document.getElementById('color-g-value');
        this.colorBValue = document.getElementById('color-b-value');
        this.colorPreview = document.getElementById('color-preview');
        this.applyColorBtn = document.getElementById('apply-color-btn');
        this.customColorBtn = document.getElementById('custom-color-btn');
        
        // Modals
        this.addCategoryBtn = document.getElementById('add-category-btn');
        this.addCategoryModalBtn = document.getElementById('add-category-modal-btn');
        this.addCategoryModal = document.getElementById('add-category-modal');
        this.cancelCategoryBtn = document.getElementById('cancel-category-btn');
        this.saveCategoryBtn = document.getElementById('save-category-btn');
        this.categoryNameInput = this.addCategoryModal.querySelector('input[type="text"]');
        this.categoryColorOptions = this.addCategoryModal.querySelectorAll('.color-option');
        this.categoryIconOptions = this.addCategoryModal.querySelectorAll('.w-10.h-10.rounded-full');
        
        this.uploadPdfBtn = document.getElementById('upload-pdf-btn');
        this.uploadPdfModal = document.getElementById('upload-pdf-modal');
        this.cancelUploadBtn = document.getElementById('cancel-upload-btn');
        this.confirmUploadBtn = document.getElementById('confirm-upload-btn');
        
        // Canvas
        this.canvas = document.getElementById('note-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // App Data
        this.notes = [];
        this.categories = [];
        
        // App State
        this.currentView = 'notes';
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.currentColor = '#ffffff';
        this.currentBrushSize = 2;
        this.lastX = 0;
        this.lastY = 0;
        this.currentNoteId = null;
        this.currentCategoryId = null;
        this.selectedCategoryColor = '#3b82f6';
        this.selectedCategoryIcon = 'folder';
        this.selectedNoteMenu = null;
        this.activeCategory = null; // Track the currently active category
        
        // Notification System
        this.notification = new Notification();
        
        // Initialize App
        this.init();
    }
    
    init() {
        // Load data from localStorage if available
        this.loadData();
        
        // Initialize canvas
        this.initCanvas();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render initial view
        this.switchView('notes');
    }
    
    loadData() {
        // Load notes
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            try {
                const notesData = JSON.parse(savedNotes);
                this.notes = notesData.map(noteData => Note.fromJSON(noteData));
            } catch (error) {
                console.error('Error loading notes:', error);
                this.notification.error('Failed to load notes. Starting with empty notes.');
                this.notes = [];
            }
        } else {
            // Start with empty notes array if no saved notes
            this.notes = [];
        }
        
        // Load categories
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            try {
                const categoriesData = JSON.parse(savedCategories);
                this.categories = categoriesData.map(categoryData => Category.fromJSON(categoryData));
            } catch (error) {
                console.error('Error loading categories:', error);
                this.notification.error('Failed to load categories. Starting with empty categories.');
                this.categories = [];
            }
        } else {
            // Start with empty categories array if no saved categories
            this.categories = [];
        }
        
        // Update category note counts
        this.updateCategoryNoteCounts();
    }
    
    // These methods are no longer needed as we're not using default data
    // Keeping them as empty methods for backward compatibility
    addSampleNotes() {
        console.warn('addSampleNotes() is deprecated and no longer used');
    }
    
    addDefaultCategories() {
        console.warn('addDefaultCategories() is deprecated and no longer used');
    }
    
    updateCategoryNoteCounts() {
        // Reset all note counts
        this.categories.forEach(category => {
            category.noteCount = 0;
        });
        
        // Count notes per category
        this.notes.forEach(note => {
            const category = this.categories.find(c => c.name === note.category);
            if (category) {
                category.noteCount++;
            }
        });
    }
    
    saveData() {
        try {
            // Save notes
            localStorage.setItem('notes', JSON.stringify(this.notes.map(note => note.toJSON())));
            
            // Save categories
            localStorage.setItem('categories', JSON.stringify(this.categories.map(category => category.toJSON())));
            
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            this.notification.error('Failed to save data. Please try again.');
            return false;
        }
    }
    
    initCanvas() {
        // Set canvas size to match container
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        // Set default styles
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.currentBrushSize;
        this.ctx.strokeStyle = this.currentColor;
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            if (this.currentView === 'editor') {
                this.initCanvas();
            }
        });
        
        // Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(item.dataset.view);
            });
        });
        
        // New Note
        this.newNoteBtn.addEventListener('click', () => {
            this.openNoteEditor('new');
        });
        
        this.addNoteCard.addEventListener('click', () => {
            this.openNoteEditor('new');
        });
        
        // Close Editor
        this.closeEditorBtn.addEventListener('click', () => {
            this.switchView('notes');
        });
        
        // Save Note
        this.saveNoteBtn.addEventListener('click', () => {
            this.saveNote();
        });
        
        // Close PDF
        this.closePdfBtn.addEventListener('click', () => {
            this.switchView('pdfs');
        });
        
        // Editor Tools
        this.toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all tools
                this.toolBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked tool
                btn.classList.add('active');
                
                // Update current tool
                this.currentTool = btn.dataset.tool;
                
                // Handle specific tool actions
                if (this.currentTool === 'text') {
                    this.textInputOverlay.classList.remove('hidden');
                } else {
                    this.textInputOverlay.classList.add('hidden');
                }
            });
        });
        
        // Color Selection
        this.colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Skip custom color button
                if (option.id === 'custom-color-btn') return;
                
                // Remove active class from all colors
                this.colorOptions.forEach(o => o.classList.remove('active'));
                
                // Add active class to clicked color
                option.classList.add('active');
                
                // Update current color
                this.currentColor = option.dataset.color;
            });
        });
        
        // RGB Color Picker
        const updateColorPreview = () => {
            const r = parseInt(this.colorR.value);
            const g = parseInt(this.colorG.value);
            const b = parseInt(this.colorB.value);
            
            // Update value displays
            this.colorRValue.textContent = r;
            this.colorGValue.textContent = g;
            this.colorBValue.textContent = b;
            
            // Update preview
            const color = `rgb(${r}, ${g}, ${b})`;
            this.colorPreview.style.backgroundColor = color;
            
            // Update custom color button
            this.customColorBtn.style.backgroundColor = color;
        };
        
        // Add event listeners to RGB sliders
        this.colorR.addEventListener('input', updateColorPreview);
        this.colorG.addEventListener('input', updateColorPreview);
        this.colorB.addEventListener('input', updateColorPreview);
        
        // Toggle color picker on custom color button click
        this.customColorBtn.addEventListener('click', () => {
            const colorPicker = document.getElementById('color-picker-container');
            colorPicker.classList.toggle('hidden');
        });
        
        // Apply custom color
        this.applyColorBtn.addEventListener('click', () => {
            const r = parseInt(this.colorR.value);
            const g = parseInt(this.colorG.value);
            const b = parseInt(this.colorB.value);
            
            const customColor = `rgb(${r}, ${g}, ${b})`;
            
            // Remove active class from all colors
            this.colorOptions.forEach(o => o.classList.remove('active'));
            
            // Add active class to custom color button
            this.customColorBtn.classList.add('active');
            
            // Update current color
            this.currentColor = customColor;
            
            // Update custom color button's data attribute
            this.customColorBtn.dataset.color = customColor;
            
            // Close color picker
            document.getElementById('color-picker-container').classList.add('hidden');
        });
        
        // Close color picker when clicking outside
        document.addEventListener('click', (e) => {
            const colorPicker = document.getElementById('color-picker-container');
            const customColorBtn = document.getElementById('custom-color-btn');
            
            if (!colorPicker.contains(e.target) && !customColorBtn.contains(e.target)) {
                colorPicker.classList.add('hidden');
            }
        });
        
        // Brush Size
        this.brushSize.addEventListener('input', () => {
            this.currentBrushSize = this.brushSize.value;
        });
        
        // Recognize Text
        this.recognizeTextBtn.addEventListener('click', () => {
            this.recognitionOverlay.classList.remove('hidden');
        });
        
        // Cancel Recognition
        this.cancelRecognitionBtn.addEventListener('click', () => {
            this.recognitionOverlay.classList.add('hidden');
        });
        
        // Insert Recognized Text
        this.insertRecognizedBtn.addEventListener('click', () => {
            // In a real app, we would insert the recognized text into the canvas
            this.recognitionOverlay.classList.add('hidden');
            this.notification.success('Text inserted successfully!');
        });
        
        // Insert Text
        this.insertTextBtn.addEventListener('click', () => {
            // In a real app, we would insert the text into the canvas
            this.textInputOverlay.classList.add('hidden');
            this.notification.success('Text inserted successfully!');
        });
        
        // Canvas Drawing
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch Events for Mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // Modals
        // Add Category
        this.addCategoryBtn.addEventListener('click', () => {
            this.currentCategoryId = null;
            this.categoryNameInput.value = '';
            this.addCategoryModal.classList.remove('hidden');
        });
        
        this.addCategoryModalBtn.addEventListener('click', () => {
            this.currentCategoryId = null;
            this.categoryNameInput.value = '';
            this.addCategoryModal.classList.remove('hidden');
        });
        
        this.cancelCategoryBtn.addEventListener('click', () => {
            this.addCategoryModal.classList.add('hidden');
        });
        
        // Category Color Selection
        this.categoryColorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all colors
                this.categoryColorOptions.forEach(o => o.classList.remove('active'));
                
                // Add active class to clicked color
                option.classList.add('active');
                
                // Update selected color
                this.selectedCategoryColor = option.dataset.color;
            });
        });
        
        // Category Icon Selection
        this.categoryIconOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all icons
                this.categoryIconOptions.forEach(o => o.classList.remove('bg-white/20'));
                
                // Add active class to clicked icon
                option.classList.add('bg-white/20');
                
                // Update selected icon
                const iconClass = option.querySelector('i').className;
                this.selectedCategoryIcon = iconClass.split('-')[1];
            });
        });
        
        this.saveCategoryBtn.addEventListener('click', () => {
            this.saveCategory();
        });
        
        // Upload PDF
        this.uploadPdfBtn.addEventListener('click', () => {
            this.uploadPdfModal.classList.remove('hidden');
        });
        
        this.cancelUploadBtn.addEventListener('click', () => {
            this.uploadPdfModal.classList.add('hidden');
        });
        
        this.confirmUploadBtn.addEventListener('click', () => {
            // In a real app, we would upload the PDF here
            this.uploadPdfModal.classList.add('hidden');
            this.notification.success('PDF uploaded successfully!');
        });
        
        // Close note menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.selectedNoteMenu && !e.target.closest('.note-menu-btn') && !e.target.closest('.note-menu')) {
                this.selectedNoteMenu.classList.add('hidden');
                this.selectedNoteMenu = null;
            }
        });
        
        // Search functionality
        const searchInput = document.querySelector('input[placeholder="Search notes..."]');
        searchInput.addEventListener('input', (e) => {
            this.searchNotes(e.target.value);
        });
    }
    
    // Drawing Functions
    startDrawing(e) {
        if (this.currentTool !== 'pen' && this.currentTool !== 'eraser') return;
        
        this.isDrawing = true;
        [this.lastX, this.lastY] = this.getCoordinates(e);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const [x, y] = this.getCoordinates(e);
        
        if (this.currentTool === 'pen') {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.currentBrushSize;
        } else if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineWidth = this.currentBrushSize * 2;
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        [this.lastX, this.lastY] = [x, y];
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    getCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return [
            (e.clientX - rect.left) * scaleX,
            (e.clientY - rect.top) * scaleY
        ];
    }
    
    // Utility Functions
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else if (days < 30) {
            return `${Math.floor(days / 7)} weeks ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    // Render Notes
    renderNotes(notesToRender = null) {
        const notesToDisplay = notesToRender || this.notes;
        
        // Clear existing notes
        const notesContainer = this.notesGridView;
        if (notesContainer) {
            // Keep the add note card
            const addNoteCard = document.getElementById('add-note-card');
            notesContainer.innerHTML = '';
            notesContainer.appendChild(addNoteCard);
            
            // Add notes before the add note card
            notesToDisplay.forEach(note => {
                const noteCard = document.createElement('div');
                noteCard.className = 'note-card';
                noteCard.dataset.noteId = note.id;
                
                noteCard.innerHTML = `
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-semibold">${note.title}</h3>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-white/50">${this.formatDate(note.updatedAt)}</span>
                            <div class="relative group">
                                <button class="tool-btn note-menu-btn" data-note-id="${note.id}">
                                    <i class="fa fa-ellipsis-v"></i>
                                </button>
                                <div class="note-menu hidden absolute right-0 mt-2 w-48 bg-secondary rounded-lg shadow-lg z-10">
                                    <ul class="py-1">
                                        <li class="px-4 py-2 hover:bg-white/10 cursor-pointer edit-note" data-note-id="${note.id}">
                                            <i class="fa fa-pencil mr-2"></i> Edit
                                        </li>
                                        <li class="px-4 py-2 hover:bg-white/10 cursor-pointer rename-note" data-note-id="${note.id}">
                                            <i class="fa fa-pencil-square-o mr-2"></i> Rename
                                        </li>
                                        <li class="px-4 py-2 hover:bg-white/10 cursor-pointer delete-note" data-note-id="${note.id}">
                                            <i class="fa fa-trash mr-2"></i> Delete
                                        </li>
                                        <li class="px-4 py-2 hover:bg-white/10 cursor-pointer export-pdf-note" data-note-id="${note.id}">
                                            <i class="fa fa-file-pdf-o mr-2"></i> Export as PDF
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${note.isHandwritten ? `
                        <div class="h-32 bg-white/5 rounded-lg mb-3 flex items-center justify-center">
                            <i class="fa fa-pencil text-white/30 text-2xl"></i>
                        </div>
                    ` : `
                        <p class="text-sm text-white/70 line-clamp-3">
                            ${note.content.replace(/\n/g, '<br>')}
                        </p>
                    `}
                    <div class="flex items-center gap-2 mt-3">
                        <span class="px-2 py-1" style="background-color: ${note.categoryColor}20; color: ${note.categoryColor}CC" class="text-xs rounded-full">${note.category}</span>
                        <div class="ml-auto flex items-center gap-2">
                            ${note.hasAttachment ? `<i class="fa fa-paperclip text-white/50 text-sm"></i>` : ''}
                        </div>
                    </div>
                `;
                
                // Insert before the add note card
                notesContainer.insertBefore(noteCard, addNoteCard);
                
                // Add event listeners
                noteCard.addEventListener('click', (e) => {
                    // Don't open editor if clicking on menu button or menu
                    if (!e.target.closest('.note-menu-btn') && !e.target.closest('.note-menu')) {
                        this.openNoteEditor(note.id);
                    }
                });
            });
            
            // Add event listeners for note menu buttons
            document.querySelectorAll('.note-menu-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const noteId = btn.dataset.noteId;
                    const menu = btn.nextElementSibling;
                    
                    // Close other open menus
                    document.querySelectorAll('.note-menu').forEach(m => {
                        if (m !== menu) m.classList.add('hidden');
                    });
                    
                    // Toggle current menu
                    menu.classList.toggle('hidden');
                    this.selectedNoteMenu = menu.classList.contains('hidden') ? null : menu;
                });
            });
            
            // Add event listeners for note menu actions
            document.querySelectorAll('.edit-note').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const noteId = item.dataset.noteId;
                    this.openNoteEditor(noteId);
                    document.querySelectorAll('.note-menu').forEach(m => m.classList.add('hidden'));
                });
            });
            
            document.querySelectorAll('.rename-note').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const noteId = item.dataset.noteId;
                    this.renameNote(noteId);
                    document.querySelectorAll('.note-menu').forEach(m => m.classList.add('hidden'));
                });
            });
            
            document.querySelectorAll('.delete-note').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const noteId = item.dataset.noteId;
                    console.log('Delete note clicked:', noteId);
                    
                    // Get the note directly from the notes array
                    const note = this.notes.find(n => n.id === noteId);
                    console.log('Found note:', note);
                    
                    if (note && confirm(`Are you sure you want to delete the note "${note.title}"?`)) {
                        // Create a new array without the deleted note
                        const updatedNotes = this.notes.filter(n => n.id !== noteId);
                        console.log('Original notes length:', this.notes.length);
                        console.log('Updated notes length:', updatedNotes.length);
                        
                        // Update the notes array
                        this.notes = updatedNotes;
                        
                        // Update category note counts
                        this.updateCategoryNoteCounts();
                        
                        // Save to localStorage
                        if (this.saveData()) {
                            console.log('Data saved successfully');
                            this.notification.success('Note deleted successfully!');
                        } else {
                            console.log('Failed to save data');
                        }
                        
                        // Update UI
                        this.renderNotes();
                    }
                    
                    document.querySelectorAll('.note-menu').forEach(m => m.classList.add('hidden'));
                });
            });
            
            document.querySelectorAll('.export-pdf-note').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const noteId = item.dataset.noteId;
                    this.exportNoteAsPDF(noteId);
                    document.querySelectorAll('.note-menu').forEach(m => m.classList.add('hidden'));
                });
            });
        }
    }
    
    // Render Categories
    renderCategories() {
        // Clear existing categories in sidebar
        this.categoriesList.innerHTML = '';
        
        // Add message if no categories
        if (this.categories.length === 0) {
            const noCategoriesMsg = document.createElement('div');
            noCategoriesMsg.className = 'text-sm text-white/50 italic px-4 py-2';
            noCategoriesMsg.textContent = 'No categories yet. Create your first one!';
            this.categoriesList.appendChild(noCategoriesMsg);
        } else {
            // Render each category
            this.categories.forEach(category => {
                const categoryItem = document.createElement('a');
                categoryItem.href = '#';
                categoryItem.className = 'nav-item';
                categoryItem.innerHTML = `
                    <i class="fa fa-circle text-xs" style="color: ${category.color}"></i>
                    <span>${category.name}</span>
                `;
                this.categoriesList.appendChild(categoryItem);
                
                // Add click event to filter notes by category
                categoryItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.filterNotesByCategory(category.name);
                });
            });
        }
        
        // Render categories view
        const categoriesContainer = document.getElementById('categories-grid');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = '';
            
            // Add message if no categories
            if (this.categories.length === 0) {
                const noCategoriesCard = document.createElement('div');
                noCategoriesCard.className = 'note-card flex flex-col items-center justify-center py-8 text-center';
                noCategoriesCard.innerHTML = `
                    <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                        <i class="fa fa-folder-open text-2xl text-white/50"></i>
                    </div>
                    <h3 class="text-lg font-semibold mb-2">No Categories Yet</h3>
                    <p class="text-sm text-white/50 mb-4">Create your first category to organize your notes</p>
                    <button class="btn-primary" id="add-first-category-btn">
                        <i class="fa fa-plus"></i>
                        <span>Create Category</span>
                    </button>
                `;
                categoriesContainer.appendChild(noCategoriesCard);
                
                // Add event listener to create first category
                document.getElementById('add-first-category-btn').addEventListener('click', () => {
                    this.currentCategoryId = null;
                    this.categoryNameInput.value = '';
                    this.addCategoryModal.classList.remove('hidden');
                });
            } else {
                // Render each category card
                this.categories.forEach(category => {
                    const categoryCard = document.createElement('div');
                    categoryCard.className = 'note-card';
                    categoryCard.dataset.categoryId = category.id;
                    
                    categoryCard.innerHTML = `
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full" style="background-color: ${category.color}20" class="flex items-center justify-center">
                                <i class="fa fa-${category.icon}" style="color: ${category.color}"></i>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-semibold">${category.name}</h3>
                                <p class="text-xs text-white/50">${category.noteCount} notes</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <button class="tool-btn edit-category" data-category-id="${category.id}">
                                    <i class="fa fa-pencil"></i>
                                </button>
                                <button class="tool-btn delete-category" data-category-id="${category.id}">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    
                    categoriesContainer.appendChild(categoryCard);
                });
                
                // Add event listeners for category actions
                document.querySelectorAll('.edit-category').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const categoryId = btn.dataset.categoryId;
                        this.editCategory(categoryId);
                    });
                });
                
                document.querySelectorAll('.delete-category').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const categoryId = btn.dataset.categoryId;
                        this.deleteCategory(categoryId);
                    });
                });
            }
        }
    }
    
    // Note Operations
    updateCategoryHighlighting() {
        // Remove highlighting from all category items
        document.querySelectorAll('#categories-list .nav-item').forEach(item => {
            item.classList.remove('bg-white/10');
        });
        
        // Highlight the active category if one is selected
        if (this.activeCategory) {
            document.querySelectorAll('#categories-list .nav-item').forEach(item => {
                if (item.textContent.trim() === this.activeCategory) {
                    item.classList.add('bg-white/10');
                }
            });
        }
    }
    
    openNoteEditor(noteId) {
        this.currentNoteId = noteId;
        
        if (noteId === 'new') {
            // New note
            this.currentViewTitle.textContent = 'New Note';
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Edit existing note
            const note = this.notes.find(n => n.id === noteId);
            if (note) {
                this.currentViewTitle.textContent = note.title;
                // In a real app, we would load the note content to canvas
                if (note.canvasData) {
                    const img = new Image();
                    img.onload = () => {
                        this.ctx.drawImage(img, 0, 0);
                    };
                    img.src = note.canvasData;
                } else {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                }
            }
        }
        
        this.switchView('editor');
    }
    
    saveNote() {
        const canvasData = this.canvas.toDataURL('image/png');
        
        if (this.currentNoteId === 'new') {
            // Determine category for new note
            let categoryName = 'Uncategorized';
            let categoryColor = '#6b7280'; // Gray color for uncategorized
            
            // Use active category if one is selected
            if (this.activeCategory) {
                const activeCategory = this.categories.find(cat => cat.name === this.activeCategory);
                if (activeCategory) {
                    categoryName = activeCategory.name;
                    categoryColor = activeCategory.color;
                }
            }
            
            // Create new note with the appropriate category
            const newNote = new Note(
                null,
                'Untitled Note',
                '',
                categoryName,
                categoryColor,
                true,
                canvasData
            );
            
            this.notes.unshift(newNote);
            this.currentNoteId = newNote.id;
            
            // Update category note counts
            this.updateCategoryNoteCounts();
            
            // Save to localStorage
            if (this.saveData()) {
                this.notification.success(`Note created in ${categoryName} category!`);
            }
            
            // Prompt user to rename the note
            setTimeout(() => {
                this.renameNote(newNote.id);
            }, 500);
        } else {
            // Update existing note
            const noteIndex = this.notes.findIndex(n => n.id === this.currentNoteId);
            if (noteIndex !== -1) {
                this.notes[noteIndex].updateCanvasData(canvasData);
                
                // Save to localStorage
                if (this.saveData()) {
                    this.notification.success('Note saved successfully!');
                }
            }
        }
        
        // Return to notes view
        this.switchView('notes');
    }
    
    renameNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            const newTitle = prompt('Enter new note title:', note.title);
            if (note.updateTitle(newTitle)) {
                // Save to localStorage
                if (this.saveData()) {
                    this.notification.success('Note renamed successfully!');
                }
                
                // Update UI
                this.renderNotes();
            }
        }
    }
    
    deleteNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note && confirm(`Are you sure you want to delete the note "${note.title}"?`)) {
            this.notes = this.notes.filter(n => n.id !== noteId);
            
            // Update category note counts
            this.updateCategoryNoteCounts();
            
            // Save to localStorage
            if (this.saveData()) {
                this.notification.success('Note deleted successfully!');
            }
            
            // Update UI
            this.renderNotes();
        }
    }
    
    exportNoteAsPDF(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            try {
                console.log('Exporting note as PDF:', note.title);
                
                // Create a simple PDF structure manually
                const pdfContent = {
                    title: note.title,
                    category: note.category,
                    createdAt: note.createdAt.toLocaleDateString(),
                    updatedAt: note.updatedAt.toLocaleDateString(),
                    content: note.content || 'Handwritten note (see image)',
                    isHandwritten: note.isHandwritten
                };
                
                // Convert to JSON string
                const jsonContent = JSON.stringify(pdfContent, null, 2);
                
                // Create a blob with the content
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                // Create a download link
                const a = document.createElement('a');
                a.href = url;
                a.download = `${note.title.replace(/[^a-z0-9]/gi, '_')}_note_data.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.notification.success('Note data exported successfully!');
                console.log('Note data exported successfully');
                
                // Show instructions for PDF conversion
                setTimeout(() => {
                    alert('Note data has been exported as JSON. In a full implementation, this would be converted to a proper PDF using a server-side service or a more robust client-side library.');
                }, 1000);
            } catch (error) {
                console.error('Error exporting note:', error);
                this.notification.error('Failed to export note. Please try again.');
            }
        }
    }
    
    searchNotes(query) {
        if (!query || query.trim() === '') {
            this.renderNotes();
            return;
        }
        
        const searchTerm = query.toLowerCase().trim();
        const filteredNotes = this.notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.content.toLowerCase().includes(searchTerm)
        );
        
        this.renderNotes(filteredNotes);
        
        // Update view title to show search results
        this.currentViewTitle.textContent = `Search Results: "${query}" (${filteredNotes.length})`;
    }
    
    filterNotesByCategory(categoryName) {
        const filteredNotes = this.notes.filter(note => note.category === categoryName);
        this.renderNotes(filteredNotes);
        
        // Update view title to show category filter
        this.currentViewTitle.textContent = `${categoryName} Notes (${filteredNotes.length})`;
        
        // Update active nav item
        this.navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Set the active category
        this.activeCategory = categoryName;
        
        // Update category list highlighting
        this.updateCategoryHighlighting();
    }
    
    // Category Operations
    addCategory(name, color, icon) {
        const newCategory = new Category(null, name, color, icon);
        this.categories.push(newCategory);
        
        // Save to localStorage
        if (this.saveData()) {
            this.notification.success(`Category "${name}" created successfully!`);
        }
        
        // Update UI
        this.renderCategories();
    }
    
    editCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            this.currentCategoryId = categoryId;
            this.categoryNameInput.value = category.name;
            
            // Select color
            this.categoryColorOptions.forEach(option => {
                option.classList.remove('active');
                if (option.dataset.color === category.color) {
                    option.classList.add('active');
                    this.selectedCategoryColor = category.color;
                }
            });
            
            // Select icon
            this.categoryIconOptions.forEach(option => {
                option.classList.remove('bg-white/20');
                const iconName = option.querySelector('i').className.split('-')[1];
                if (iconName === category.icon) {
                    option.classList.add('bg-white/20');
                    this.selectedCategoryIcon = category.icon;
                }
            });
            
            // Show modal
            this.addCategoryModal.classList.remove('hidden');
        }
    }
    
    saveCategory() {
        const categoryName = this.categoryNameInput.value.trim();
        
        if (!categoryName) {
            this.notification.warning('Please enter a category name');
            return;
        }
        
        if (this.currentCategoryId) {
            // Edit existing category
            const categoryIndex = this.categories.findIndex(c => c.id === this.currentCategoryId);
            if (categoryIndex !== -1) {
                const oldName = this.categories[categoryIndex].name;
                this.categories[categoryIndex].update(categoryName, this.selectedCategoryColor, this.selectedCategoryIcon);
                
                // Update notes with this category
                this.notes.forEach(note => {
                    if (note.category === oldName) {
                        note.updateCategory(categoryName, this.selectedCategoryColor);
                    }
                });
                
                // Save to localStorage
                if (this.saveData()) {
                    this.notification.success(`Category updated successfully!`);
                }
                
                // Update UI
                this.renderCategories();
                this.renderNotes();
            }
        } else {
            // Add new category
            this.addCategory(categoryName, this.selectedCategoryColor, this.selectedCategoryIcon);
        }
        
        this.addCategoryModal.classList.add('hidden');
    }
    
    deleteCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category && confirm(`Are you sure you want to delete the "${category.name}" category?`)) {
            // Update notes with this category to use "Uncategorized"
            this.notes.forEach(note => {
                if (note.category === category.name) {
                    note.updateCategory('Uncategorized', '#6b7280');
                }
            });
            
            // Remove category
            this.categories = this.categories.filter(c => c.id !== categoryId);
            
            // Update category note counts
            this.updateCategoryNoteCounts();
            
            // Save to localStorage
            if (this.saveData()) {
                this.notification.success(`Category "${category.name}" deleted successfully!`);
            }
            
            // Update UI
            this.renderCategories();
            this.renderNotes();
        }
    }
    
    // View Switching
    switchView(view) {
        this.currentView = view;
        
        // Hide all views
        this.notesGridView.classList.add('hidden');
        this.noteEditorView.classList.add('hidden');
        this.pdfsView.classList.add('hidden');
        this.pdfViewer.classList.add('hidden');
        this.categoriesView.classList.add('hidden');
        
        // Hide any open note menus
        if (this.selectedNoteMenu) {
            this.selectedNoteMenu.classList.add('hidden');
            this.selectedNoteMenu = null;
        }
        
        // Show selected view
        switch (view) {
            case 'notes':
                this.notesGridView.classList.remove('hidden');
                this.currentViewTitle.textContent = 'All Notes';
                this.renderNotes();
                // Clear active category when returning to all notes
                if (this.activeCategory) {
                    this.activeCategory = null;
                    this.updateCategoryHighlighting();
                }
                break;
            case 'editor':
                this.noteEditorView.classList.remove('hidden');
                this.initCanvas();
                break;
            case 'pdfs':
                this.pdfsView.classList.remove('hidden');
                this.currentViewTitle.textContent = 'PDF Documents';
                // Clear active category
                this.activeCategory = null;
                this.updateCategoryHighlighting();
                break;
            case 'pdf-viewer':
                this.pdfViewer.classList.remove('hidden');
                this.currentViewTitle.textContent = 'View PDF';
                // Clear active category
                this.activeCategory = null;
                this.updateCategoryHighlighting();
                break;
            case 'categories':
                this.categoriesView.classList.remove('hidden');
                this.currentViewTitle.textContent = 'Categories';
                this.renderCategories();
                // Clear active category
                this.activeCategory = null;
                this.updateCategoryHighlighting();
                break;
        }
        
        // Update active nav item
        this.navItems.forEach(item => {
            if (item.dataset.view === view) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create a global app instance
    window.noteApp = new NoteApp();
    
    // Add a console log to confirm initialization
    console.log('Note App initialized successfully!');
    console.log('Categories available:', window.noteApp.categories.map(c => c.name));
});