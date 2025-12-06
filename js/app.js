// Page Class - 用于创建和管理笔记页面
class Page {
    constructor(id = null, canvasData = null) {
        this.id = id || this.generateId();
        this.canvasData = canvasData;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    updateCanvasData(newCanvasData) {
        this.canvasData = newCanvasData;
        this.updatedAt = new Date();
    }
    
    toJSON() {
        return {
            id: this.id,
            canvasData: this.canvasData,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }
    
    static fromJSON(json) {
        const page = new Page();
        page.id = json.id;
        page.canvasData = json.canvasData;
        page.createdAt = new Date(json.createdAt);
        page.updatedAt = new Date(json.updatedAt);
        return page;
    }
}

// Note Class - 用于创建和管理笔记对象
class Note {
    constructor(id, title, content = '', category = 'Uncategorized', categoryColor = '#6b7280', isHandwritten = false, canvasData = null) {
        this.id = id || this.generateId();
        this.title = title || 'Untitled Note';
        this.content = content;
        this.category = category;
        this.categoryColor = categoryColor;
        this.isHandwritten = isHandwritten;
        this.hasAttachment = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        
        // 初始化页面数组
        this.pages = [];
        // 如果提供了canvasData，创建第一个页面
        if (canvasData) {
            this.pages.push(new Page(null, canvasData));
        } else {
            // 否则创建一个空白页面
            this.pages.push(new Page());
        }
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
    
    updateCanvasData(newCanvasData, pageIndex = 0) {
        if (this.pages[pageIndex]) {
            this.pages[pageIndex].updateCanvasData(newCanvasData);
            this.isHandwritten = true;
            this.updatedAt = new Date();
        }
    }
    
    addPage(canvasData = null) {
        const newPage = new Page(null, canvasData);
        this.pages.push(newPage);
        this.updatedAt = new Date();
        return this.pages.length - 1; // 返回新页面的索引
    }
    
    removePage(pageIndex) {
        if (this.pages.length > 1 && pageIndex >= 0 && pageIndex < this.pages.length) {
            this.pages.splice(pageIndex, 1);
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }
    
    getPage(pageIndex) {
        return this.pages[pageIndex] || null;
    }
    
    getPageCount() {
        return this.pages.length;
    }
    
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            category: this.category,
            categoryColor: this.categoryColor,
            isHandwritten: this.isHandwritten,
            hasAttachment: this.hasAttachment,
            pages: this.pages.map(page => page.toJSON()),
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
        note.hasAttachment = json.hasAttachment;
        note.createdAt = new Date(json.createdAt);
        note.updatedAt = new Date(json.updatedAt);
        
        // 从JSON加载页面
        if (json.pages && Array.isArray(json.pages)) {
            note.pages = json.pages.map(pageData => Page.fromJSON(pageData));
        } else if (json.canvasData) {
            // 兼容旧版本数据
            note.pages = [new Page(null, json.canvasData)];
        } else {
            note.pages = [new Page()];
        }
        
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
        
        // PDF related elements
        this.pdfCanvas = document.getElementById('pdf-canvas');
        this.pdfCtx = this.pdfCanvas.getContext('2d');
        this.pdfLoading = document.getElementById('pdf-loading');
        this.pdfPageInfo = document.getElementById('pdf-page-info');
        this.pdfPrevPageBtn = document.getElementById('pdf-prev-page');
        this.pdfNextPageBtn = document.getElementById('pdf-next-page');
        this.pdfDownloadBtn = document.getElementById('pdf-download-btn');
        this.pdfClearAnnotationsBtn = document.getElementById('pdf-clear-annotations');
        
        // PDF annotation tools
        this.pdfPenTool = document.getElementById('pdf-pen-tool');
        this.pdfEraserTool = document.getElementById('pdf-eraser-tool');
        this.pdfAnnotationColor = document.getElementById('pdf-annotation-color');
        this.pdfBrushSize = document.getElementById('pdf-brush-size');
        this.pdfBrushSizeValue = document.getElementById('pdf-brush-size-value');
        
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
        
        // Page Navigation
        this.pageNavContainer = null; // Will be created in init()
        this.prevPageBtn = null; // Will be created in init()
        this.nextPageBtn = null; // Will be created in init()
        this.addPageBtn = null; // Will be created in init()
        this.pageOverviewBtn = null; // Will be created in init()
        this.pageOverviewModal = null; // Will be created in init()
        this.pageOverviewGrid = null; // Will be created in init()
        this.currentPageIndex = 0;
        
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
        
        // PDF state
        this.currentPdf = null;
        this.currentPdfDocument = null;
        this.currentPdfPage = 1;
        this.totalPdfPages = 1;
        this.pdfAnnotations = {}; // Store annotations per page
        this.pdfCurrentTool = 'pen';
        this.pdfIsDrawing = false;
        this.pdfLastX = 0;
        this.pdfLastY = 0;
        this.pdfScale = 1.0;
        
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
        
        // Create page navigation UI
        this.createPageNavigation();
        
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
    
    createPageNavigation() {
        // Create page navigation container
        this.pageNavContainer = document.createElement('div');
        this.pageNavContainer.className = 'flex items-center gap-3 bg-secondary/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 shadow-lg z-10 ml-auto';
        this.pageNavContainer.id = 'page-navigation';
        
        // Previous page button
        this.prevPageBtn = document.createElement('button');
        this.prevPageBtn.className = 'tool-btn';
        this.prevPageBtn.innerHTML = '<i class="fa fa-chevron-left"></i>';
        this.prevPageBtn.id = 'prev-page-btn';
        this.prevPageBtn.disabled = true;
        
        // Page indicator
        this.pageIndicator = document.createElement('span');
        this.pageIndicator.className = 'text-sm font-medium';
        this.pageIndicator.id = 'page-indicator';
        this.pageIndicator.textContent = 'Page 1';
        
        // Add page button
        this.addPageBtn = document.createElement('button');
        this.addPageBtn.className = 'tool-btn';
        this.addPageBtn.innerHTML = '<i class="fa fa-plus"></i>';
        this.addPageBtn.id = 'add-page-btn';
        
        // Next page button
        this.nextPageBtn = document.createElement('button');
        this.nextPageBtn.className = 'tool-btn';
        this.nextPageBtn.innerHTML = '<i class="fa fa-chevron-right"></i>';
        this.nextPageBtn.id = 'next-page-btn';
        this.nextPageBtn.disabled = true;
        
        // Page overview button
        this.pageOverviewBtn = document.createElement('button');
        this.pageOverviewBtn.className = 'tool-btn';
        this.pageOverviewBtn.innerHTML = '<i class="fa fa-th-large"></i>';
        this.pageOverviewBtn.id = 'page-overview-btn';
        
        // Assemble page navigation
        this.pageNavContainer.appendChild(this.prevPageBtn);
        this.pageNavContainer.appendChild(this.pageIndicator);
        this.pageNavContainer.appendChild(this.addPageBtn);
        this.pageNavContainer.appendChild(this.nextPageBtn);
        this.pageNavContainer.appendChild(this.pageOverviewBtn);
        
        // Add to note editor toolbar
        const editorToolbar = document.querySelector('#note-editor-view .flex');
        editorToolbar.appendChild(this.pageNavContainer);
        
        // Create page overview modal
        this.createPageOverviewModal();
    }
    
    createPageOverviewModal() {
        // Create modal container
        this.pageOverviewModal = document.createElement('div');
        this.pageOverviewModal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 hidden';
        this.pageOverviewModal.id = 'page-overview-modal';
        
        // Modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-secondary p-6 rounded-xl w-11/12 max-w-4xl max-h-[80vh] overflow-auto';
        
        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'flex justify-between items-center mb-4';
        modalHeader.innerHTML = `
            <h3 class="text-lg font-semibold">Page Overview</h3>
            <button class="tool-btn" id="close-page-overview-btn">
                <i class="fa fa-times"></i>
            </button>
        `;
        
        // Page grid
        this.pageOverviewGrid = document.createElement('div');
        this.pageOverviewGrid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';
        this.pageOverviewGrid.id = 'page-overview-grid';
        
        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(this.pageOverviewGrid);
        this.pageOverviewModal.appendChild(modalContent);
        
        // Add to document
        document.body.appendChild(this.pageOverviewModal);
        
        // Add event listener to close button
        document.getElementById('close-page-overview-btn').addEventListener('click', () => {
            this.pageOverviewModal.classList.add('hidden');
        });
    }
    
    updatePageNavigation() {
        if (!this.currentNoteId) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;
        
        // Update page indicator
        this.pageIndicator.textContent = `Page ${this.currentPageIndex + 1} of ${note.getPageCount()}`;
        
        // Enable/disable navigation buttons
        this.prevPageBtn.disabled = this.currentPageIndex === 0;
        this.nextPageBtn.disabled = this.currentPageIndex === note.getPageCount() - 1;
        
        // Update button styles based on disabled state
        this.prevPageBtn.classList.toggle('opacity-50', this.prevPageBtn.disabled);
        this.nextPageBtn.classList.toggle('opacity-50', this.nextPageBtn.disabled);
    }
    
    renderPageOverview() {
        if (!this.currentNoteId) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;
        
        // Clear grid
        this.pageOverviewGrid.innerHTML = '';
        
        // Add each page thumbnail
        note.pages.forEach((page, index) => {
            const pageThumbnail = document.createElement('div');
            pageThumbnail.className = `relative aspect-[3/4] bg-white/5 border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${index === this.currentPageIndex ? 'border-accent ring-2 ring-accent/50' : 'border-white/20 hover:border-white/50'}`;
            
            // Create canvas for thumbnail
            const thumbnailCanvas = document.createElement('canvas');
            thumbnailCanvas.width = 200;
            thumbnailCanvas.height = 280;
            thumbnailCanvas.className = 'w-full h-full';
            
            // Draw page content or placeholder
            const thumbnailCtx = thumbnailCanvas.getContext('2d');
            thumbnailCtx.fillStyle = '#1e40af';
            thumbnailCtx.fillRect(0, 0, 200, 280);
            
            if (page.canvasData) {
                const img = new Image();
                img.onload = () => {
                    thumbnailCtx.drawImage(img, 0, 0, 200, 280);
                };
                img.src = page.canvasData;
            } else {
                thumbnailCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                thumbnailCtx.font = '16px Arial';
                thumbnailCtx.textAlign = 'center';
                thumbnailCtx.fillText('Empty Page', 100, 140);
            }
            
            // Add page controls
            const pageControls = document.createElement('div');
            pageControls.className = 'absolute bottom-2 right-2 flex items-center gap-1';
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors';
            deleteBtn.innerHTML = '<i class="fa fa-times"></i>';
            deleteBtn.title = 'Delete page';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (note.getPageCount() > 1) {
                    if (confirm(`Are you sure you want to delete page ${index + 1}?`)) {
                        note.removePage(index);
                        this.renderPageOverview();
                        // If deleted current page, switch to previous one
                        if (index === this.currentPageIndex) {
                            this.currentPageIndex = Math.min(index, note.getPageCount() - 1);
                            this.loadPageContent();
                            this.updatePageNavigation();
                        } else if (index < this.currentPageIndex) {
                            // If deleted page was before current page, adjust current page index
                            this.currentPageIndex--;
                            this.updatePageNavigation();
                        }
                    }
                } else {
                    this.notification.warning('Cannot delete the last page!');
                }
            });
            
            // Page number
            const pageNumber = document.createElement('div');
            pageNumber.className = 'bg-black/50 text-white text-xs px-2 py-1 rounded';
            pageNumber.textContent = `Page ${index + 1}`;
            
            // Assemble controls
            pageControls.appendChild(deleteBtn);
            pageControls.appendChild(pageNumber);
            
            // Assemble thumbnail
            pageThumbnail.appendChild(thumbnailCanvas);
            pageThumbnail.appendChild(pageControls);
            
            // Add click event
            pageThumbnail.addEventListener('click', () => {
                this.switchToPage(index);
                this.pageOverviewModal.classList.add('hidden');
            });
            
            // Add to grid
            this.pageOverviewGrid.appendChild(pageThumbnail);
        });
    }
    
    switchToPage(pageIndex) {
        if (!this.currentNoteId) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note || pageIndex < 0 || pageIndex >= note.getPageCount()) return;
        
        // Save current page
        const currentPage = note.getPage(this.currentPageIndex);
        if (currentPage) {
            const canvasData = this.canvas.toDataURL('image/png');
            currentPage.updateCanvasData(canvasData);
        }
        
        // Switch to new page
        this.currentPageIndex = pageIndex;
        
        // Load new page content
        this.loadPageContent();
        
        // Update navigation
        this.updatePageNavigation();
    }
    
    addNewPage() {
        if (!this.currentNoteId) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;
        
        // Save current page
        const currentPage = note.getPage(this.currentPageIndex);
        if (currentPage) {
            const canvasData = this.canvas.toDataURL('image/png');
            currentPage.updateCanvasData(canvasData);
        }
        
        // Add new page
        const newPageIndex = note.addPage();
        
        // Switch to new page
        this.currentPageIndex = newPageIndex;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update navigation
        this.updatePageNavigation();
        
        this.notification.success('New page added!');
    }
    
    loadPageContent() {
        if (!this.currentNoteId) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;
        
        const page = note.getPage(this.currentPageIndex);
        if (!page) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Load page content if available
        if (page.canvasData) {
            const img = new Image();
            img.onload = () => {
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = page.canvasData;
        }
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            if (this.currentView === 'editor') {
                this.initCanvas();
                this.loadPageContent();
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
            this.closePdfViewer();
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
                    this.canvas.style.cursor = 'default';
                } else {
                    this.textInputOverlay.classList.add('hidden');
                    this.canvas.style.cursor = this.currentTool === 'eraser' ? 'crosshair' : 'default';
                }
            });
        });
        
        // Clear canvas button - with debug logging
        console.log('Looking for clearCanvasBtn...');
        this.clearCanvasBtn = document.getElementById('clearCanvasBtn');
        if (this.clearCanvasBtn) {
            console.log('Found clearCanvasBtn, adding event listener');
            this.clearCanvasBtn.addEventListener('click', (e) => {
                console.log('Clear canvas button clicked!');
                e.preventDefault();
                this.clearCanvas();
            });
        } else {
            console.log('clearCanvasBtn not found!');
        }
        
        // PDF related event listeners
        if (this.pdfPrevPageBtn) {
            this.pdfPrevPageBtn.addEventListener('click', () => this.goToPrevPdfPage());
        }
        if (this.pdfNextPageBtn) {
            this.pdfNextPageBtn.addEventListener('click', () => this.goToNextPdfPage());
        }
        if (this.pdfDownloadBtn) {
            this.pdfDownloadBtn.addEventListener('click', () => this.downloadAnnotatedPdf());
        }
        if (this.pdfClearAnnotationsBtn) {
            this.pdfClearAnnotationsBtn.addEventListener('click', () => this.clearPdfAnnotations());
        }
        
        // PDF annotation tools
        if (this.pdfPenTool) {
            this.pdfPenTool.addEventListener('click', () => this.setPdfTool('pen'));
        }
        if (this.pdfEraserTool) {
            this.pdfEraserTool.addEventListener('click', () => this.setPdfTool('eraser'));
        }
        
        // PDF annotation settings
        if (this.pdfAnnotationColor) {
            this.pdfAnnotationColor.addEventListener('input', () => {
                console.log('PDF annotation color changed:', this.pdfAnnotationColor.value);
            });
        }
        if (this.pdfBrushSize) {
            this.pdfBrushSize.addEventListener('input', () => {
                if (this.pdfBrushSizeValue) {
                    this.pdfBrushSizeValue.textContent = `${this.pdfBrushSize.value}px`;
                }
            });
        }
        
        // PDF canvas events
        if (this.pdfCanvas) {
            this.pdfCanvas.addEventListener('mousedown', (e) => this.startPdfDrawing(e));
            this.pdfCanvas.addEventListener('mousemove', (e) => this.drawOnPdf(e));
            this.pdfCanvas.addEventListener('mouseup', () => this.stopPdfDrawing());
            this.pdfCanvas.addEventListener('mouseout', () => this.stopPdfDrawing());
            
            // Touch events for mobile
            this.pdfCanvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startPdfDrawing(e.touches[0]);
            });
            this.pdfCanvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                this.drawOnPdf(e.touches[0]);
            });
            this.pdfCanvas.addEventListener('touchend', () => this.stopPdfDrawing());
        }
        
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
            // Get text from input field
            const textInput = this.textInputOverlay.querySelector('textarea');
            const text = textInput.value.trim();
            
            if (text) {
                // Set text properties
                this.ctx.font = '20px Arial';
                this.ctx.fillStyle = this.currentColor;
                this.ctx.textAlign = 'left';
                
                // Calculate position (center of canvas)
                const x = this.canvas.width / 2 - this.ctx.measureText(text).width / 2;
                const y = this.canvas.height / 2;
                
                // Draw text on canvas
                this.ctx.fillText(text, x, y);
                
                // Clear input field
                textInput.value = '';
                
                // Hide overlay
                this.textInputOverlay.classList.add('hidden');
                
                // Show success message
                this.notification.success('Text inserted successfully!');
            } else {
                this.notification.warning('Please enter some text to insert');
            }
        });
        
        // Canvas Drawing Events
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
        
        // Set up page navigation event listeners
        this.setupPageNavigationEventListeners();
        
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    setupPageNavigationEventListeners() {
        // Previous page button
        this.prevPageBtn.addEventListener('click', () => {
            if (this.currentPageIndex > 0) {
                this.switchToPage(this.currentPageIndex - 1);
            }
        });
        
        // Next page button
        this.nextPageBtn.addEventListener('click', () => {
            if (!this.currentNoteId) return;
            
            const note = this.notes.find(n => n.id === this.currentNoteId);
            if (note && this.currentPageIndex < note.getPageCount() - 1) {
                this.switchToPage(this.currentPageIndex + 1);
            }
        });
        
        // Add page button
        this.addPageBtn.addEventListener('click', () => {
            this.addNewPage();
        });
        
        // Page overview button
        this.pageOverviewBtn.addEventListener('click', () => {
            this.renderPageOverview();
            this.pageOverviewModal.classList.remove('hidden');
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when in editor view
            if (this.currentView !== 'editor') return;
            
            // Handle arrow key navigation
            if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                if (this.currentPageIndex > 0) {
                    this.switchToPage(this.currentPageIndex - 1);
                }
            } else if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                if (!this.currentNoteId) return;
                
                const note = this.notes.find(n => n.id === this.currentNoteId);
                if (note && this.currentPageIndex < note.getPageCount() - 1) {
                    this.switchToPage(this.currentPageIndex + 1);
                }
            }
            
            // Handle Ctrl/Cmd + Page Up/Down
            if ((e.ctrlKey || e.metaKey) && e.key === 'PageUp') {
                e.preventDefault();
                if (this.currentPageIndex > 0) {
                    this.switchToPage(this.currentPageIndex - 1);
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'PageDown') {
                e.preventDefault();
                if (!this.currentNoteId) return;
                
                const note = this.notes.find(n => n.id === this.currentNoteId);
                if (note && this.currentPageIndex < note.getPageCount() - 1) {
                    this.switchToPage(this.currentPageIndex + 1);
                }
            }
            
            // Handle Ctrl/Cmd + Shift + N for new page
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.addNewPage();
            }
            
            // Handle Ctrl/Cmd + O for page overview
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                this.renderPageOverview();
                this.pageOverviewModal.classList.remove('hidden');
            }
        });
    }
    
    // Clear Canvas Function
    clearCanvas() {
        console.log('clearCanvas() called');
        console.log('Current note ID:', this.currentNoteId);
        console.log('Current page index:', this.currentPageIndex);
        
        if (!this.currentNoteId) {
            console.log('No current note selected');
            this.notification.error('请先选择一个笔记');
            return;
        }
        
        // Show confirmation dialog
        if (confirm('确定要清除当前页面的所有绘图内容吗？此操作不可撤销。')) {
            console.log('User confirmed clearing canvas');
            
            try {
                // Clear the canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                console.log('Canvas cleared successfully');
                
                // Update the note's canvas data
                const note = this.notes.find(n => n.id === this.currentNoteId);
                if (note) {
                    console.log('Found note:', note.title);
                    const canvasData = this.canvas.toDataURL('image/png');
                    note.updateCanvasData(canvasData, this.currentPageIndex);
                    console.log('Note canvas data updated');
                    this.notification.success('页面内容已清除');
                } else {
                    console.log('Note not found!');
                }
            } catch (error) {
                console.error('Error clearing canvas:', error);
                this.notification.error('清除画布时出错');
            }
        } else {
            console.log('User cancelled clearing canvas');
        }
    }
    
    // Drawing Functions - Simplified and fixed
    startDrawing(e) {
        // Only draw with pen or eraser tools
        if (this.currentTool !== 'pen' && this.currentTool !== 'eraser') return;
        
        this.isDrawing = true;
        const [x, y] = this.getCoordinates(e);
        this.lastX = x;
        this.lastY = y;
        
        // Set drawing mode based on tool
        if (this.currentTool === 'pen') {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.currentBrushSize;
        } else if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineWidth = this.currentBrushSize * 2;
        }
        
        // Start a new path
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const [x, y] = this.getCoordinates(e);
        
        // Continue the path
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        this.lastX = x;
        this.lastY = y;
    }
    
    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // Save canvas state to current note
        if (this.currentNoteId) {
            const note = this.notes.find(n => n.id === this.currentNoteId);
            if (note) {
                const canvasData = this.canvas.toDataURL('image/png');
                note.updateCanvasData(canvasData, this.currentPageIndex);
            }
        }
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
        // Save current page data
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
                true
            );
            
            // Update first page with canvas data
            newNote.updateCanvasData(canvasData, 0);
            
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
                // Save current page data
                this.notes[noteIndex].updateCanvasData(canvasData, this.currentPageIndex);
                
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
                this.renderPdfs();
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
    // PDF Annotation Functions
    openPdfViewer(pdfFile) {
        console.log('openPdfViewer() called with:', pdfFile);
        
        // Check if PDF viewer elements exist
        console.log('PDF canvas element:', this.pdfCanvas);
        console.log('PDF loading element:', this.pdfLoading);
        
        if (!this.pdfCanvas) {
            console.error('PDF canvas element not found!');
            return;
        }
        
        // Get PDF title element from the PDF viewer
        this.pdfTitle = document.getElementById('pdf-title');
        console.log('PDF title element:', this.pdfTitle);
        
        this.currentPdf = pdfFile;
        
        // Set PDF title if element exists
        if (this.pdfTitle) {
            this.pdfTitle.textContent = pdfFile.name || 'PDF Document';
        }
        
        // Show loading indicator
        this.showPdfLoading();
        
        // Initialize PDF.js to load the PDF
        this.loadPdf(pdfFile.url);
    }
    
    async loadPdf(pdfUrl) {
        try {
            console.log('Loading PDF from:', pdfUrl);
            
            // For demo purposes, create a sample PDF if URL is not provided
            if (!pdfUrl) {
                this.createSamplePdf();
                return;
            }
            
            // Use PDF.js to load the PDF
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            
            const pdfDocument = await pdfjsLib.getDocument({
                url: pdfUrl,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/cmaps/',
                cMapPacked: true
            }).promise;
            
            this.currentPdfDocument = pdfDocument;
            this.totalPdfPages = pdfDocument.numPages;
            this.currentPdfPage = 1;
            
            console.log('PDF loaded successfully, total pages:', this.totalPdfPages);
            
            // Initialize annotations storage
            this.pdfAnnotations = {};
            for (let i = 1; i <= this.totalPdfPages; i++) {
                this.pdfAnnotations[i] = [];
            }
            
            // Render the first page
            await this.renderPdfPage(this.currentPdfPage);
            
            // Update UI
            this.updatePdfPageInfo();
            this.updatePdfNavigationButtons();
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.notification.error('加载 PDF 失败');
            this.createSamplePdf(); // Fallback to sample PDF
        } finally {
            this.hidePdfLoading();
            this.switchView('pdf-viewer');
        }
    }
    
    createSamplePdf() {
        console.log('Creating sample PDF for demo');
        
        // Create a simple canvas with text content to simulate a PDF
        const canvas = this.pdfCanvas;
        const ctx = this.pdfCtx;
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 1100;
        
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw sample content
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('示例 PDF 文档', 40, 60);
        
        ctx.font = 'bold 18px Arial';
        ctx.fillText('第一页', 40, 90);
        
        ctx.font = '14px Arial';
        ctx.fillText('这是一个示例 PDF 文档，用于演示 PDF 标注功能。', 40, 130);
        ctx.fillText('您可以使用工具栏中的钢笔工具在 PDF 上进行标注。', 40, 160);
        ctx.fillText('使用橡皮擦工具可以擦除标注内容。', 40, 190);
        
        // Add more sample content
        ctx.font = 'bold 16px Arial';
        ctx.fillText('主要功能：', 40, 240);
        
        ctx.font = '14px Arial';
        const features = [
            '• 在 PDF 上进行手写标注',
            '• 支持多页 PDF 浏览',
            '• 调整标注颜色和粗细',
            '• 擦除不需要的标注',
            '• 下载带有标注的 PDF'
        ];
        
        features.forEach((feature, index) => {
            ctx.fillText(feature, 60, 270 + (index * 30));
        });
        
        // Add a second page indicator
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.fillText('(共 2 页)', canvas.width - 80, canvas.height - 40);
        
        // Set up PDF state for demo
        this.totalPdfPages = 2;
        this.currentPdfPage = 1;
        this.pdfAnnotations = {
            1: [],
            2: []
        };
        
        this.updatePdfPageInfo();
        this.updatePdfNavigationButtons();
    }
    
    async renderPdfPage(pageNumber) {
        if (!this.currentPdfDocument && pageNumber > 1) {
            // For demo, create second page content
            this.renderSampleSecondPage();
            return;
        }
        
        if (this.currentPdfDocument) {
            try {
                const page = await this.currentPdfDocument.getPage(pageNumber);
                const viewport = page.getViewport({ scale: this.pdfScale });
                
                // Set canvas size
                this.pdfCanvas.width = viewport.width;
                this.pdfCanvas.height = viewport.height;
                
                // Render PDF page
                await page.render({
                    canvasContext: this.pdfCtx,
                    viewport: viewport
                }).promise;
                
                console.log('PDF page rendered:', pageNumber);
            } catch (error) {
                console.error('Error rendering PDF page:', error);
                this.notification.error('渲染 PDF 页面失败');
            }
        }
        
        // Draw annotations for this page
        this.drawPdfAnnotations(pageNumber);
    }
    
    renderSampleSecondPage() {
        console.log('Rendering sample second page');
        
        const canvas = this.pdfCanvas;
        const ctx = this.pdfCtx;
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 1100;
        
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw sample content for second page
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('示例 PDF 文档', 40, 60);
        
        ctx.font = 'bold 18px Arial';
        ctx.fillText('第二页', 40, 90);
        
        ctx.font = '14px Arial';
        ctx.fillText('这是 PDF 文档的第二页。', 40, 130);
        ctx.fillText('您可以使用页面导航按钮在不同页面之间切换。', 40, 160);
        
        // Add some sample text content
        ctx.font = 'bold 16px Arial';
        ctx.fillText('PDF 标注使用说明：', 40, 210);
        
        ctx.font = '14px Arial';
        const instructions = [
            '1. 选择钢笔工具开始标注',
            '2. 选择颜色和线条粗细',
            '3. 在 PDF 上拖动鼠标进行绘制',
            '4. 使用橡皮擦工具擦除标注',
            '5. 点击"清除"按钮删除当前页面所有标注',
            '6. 点击"下载"按钮保存带有标注的 PDF'
        ];
        
        instructions.forEach((instruction, index) => {
            ctx.fillText(instruction, 60, 240 + (index * 30));
        });
        
        // Add a first page indicator
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.fillText('(共 2 页)', canvas.width - 80, canvas.height - 40);
    }
    
    drawPdfAnnotations(pageNumber) {
        const annotations = this.pdfAnnotations[pageNumber] || [];
        const ctx = this.pdfCtx;
        
        annotations.forEach(annotation => {
            ctx.beginPath();
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            
            for (let i = 1; i < annotation.points.length; i++) {
                ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
            }
            
            ctx.strokeStyle = annotation.color;
            ctx.lineWidth = annotation.lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        });
    }
    
    startPdfDrawing(e) {
        if (this.pdfCurrentTool !== 'pen' && this.pdfCurrentTool !== 'eraser') return;
        
        this.pdfIsDrawing = true;
        const [x, y] = this.getPdfCoordinates(e);
        this.pdfLastX = x;
        this.pdfLastY = y;
        
        // Start a new annotation
        const newAnnotation = {
            points: [{ x, y }],
            color: this.pdfAnnotationColor.value,
            lineWidth: parseInt(this.pdfBrushSize.value),
            tool: this.pdfCurrentTool
        };
        
        // Initialize annotations array for current page if needed
        if (!this.pdfAnnotations[this.currentPdfPage]) {
            this.pdfAnnotations[this.currentPdfPage] = [];
        }
        
        this.pdfAnnotations[this.currentPdfPage].push(newAnnotation);
    }
    
    drawOnPdf(e) {
        if (!this.pdfIsDrawing) return;
        
        const [x, y] = this.getPdfCoordinates(e);
        const ctx = this.pdfCtx;
        
        // Get the last annotation
        const annotations = this.pdfAnnotations[this.currentPdfPage];
        const currentAnnotation = annotations[annotations.length - 1];
        
        // Add new point to the annotation
        currentAnnotation.points.push({ x, y });
        
        // Draw the line
        if (this.pdfCurrentTool === 'pen') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = this.pdfAnnotationColor.value;
            ctx.lineWidth = parseInt(this.pdfBrushSize.value);
        } else if (this.pdfCurrentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = parseInt(this.pdfBrushSize.value) * 2;
        }
        
        ctx.beginPath();
        ctx.moveTo(this.pdfLastX, this.pdfLastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        this.pdfLastX = x;
        this.pdfLastY = y;
    }
    
    stopPdfDrawing() {
        if (!this.pdfIsDrawing) return;
        
        this.pdfIsDrawing = false;
        console.log('PDF drawing stopped, annotations count:', 
            this.pdfAnnotations[this.currentPdfPage]?.length || 0);
    }
    
    getPdfCoordinates(e) {
        const rect = this.pdfCanvas.getBoundingClientRect();
        const scaleX = this.pdfCanvas.width / rect.width;
        const scaleY = this.pdfCanvas.height / rect.height;
        
        return [
            (e.clientX - rect.left) * scaleX,
            (e.clientY - rect.top) * scaleY
        ];
    }
    
    setPdfTool(tool) {
        console.log('Setting PDF tool to:', tool);
        this.pdfCurrentTool = tool;
        
        // Update tool button states
        if (this.pdfPenTool) {
            this.pdfPenTool.classList.toggle('active', tool === 'pen');
        }
        if (this.pdfEraserTool) {
            this.pdfEraserTool.classList.toggle('active', tool === 'eraser');
        }
        
        // Update cursor style
        if (this.pdfCanvas) {
            this.pdfCanvas.style.cursor = tool === 'eraser' ? 'crosshair' : 'default';
        }
    }
    
    goToPrevPdfPage() {
        if (this.currentPdfPage > 1) {
            this.currentPdfPage--;
            this.renderPdfPage(this.currentPdfPage);
            this.updatePdfPageInfo();
            this.updatePdfNavigationButtons();
        }
    }
    
    goToNextPdfPage() {
        if (this.currentPdfPage < this.totalPdfPages) {
            this.currentPdfPage++;
            this.renderPdfPage(this.currentPdfPage);
            this.updatePdfPageInfo();
            this.updatePdfNavigationButtons();
        }
    }
    
    updatePdfPageInfo() {
        if (this.pdfPageInfo) {
            this.pdfPageInfo.textContent = `${this.currentPdfPage} / ${this.totalPdfPages}`;
        }
    }
    
    updatePdfNavigationButtons() {
        if (this.pdfPrevPageBtn) {
            this.pdfPrevPageBtn.disabled = this.currentPdfPage === 1;
            this.pdfPrevPageBtn.classList.toggle('opacity-50', this.currentPdfPage === 1);
        }
        if (this.pdfNextPageBtn) {
            this.pdfNextPageBtn.disabled = this.currentPdfPage === this.totalPdfPages;
            this.pdfNextPageBtn.classList.toggle('opacity-50', this.currentPdfPage === this.totalPdfPages);
        }
    }
    
    clearPdfAnnotations() {
        if (confirm('确定要清除当前页面的所有标注吗？此操作不可撤销。')) {
            this.pdfAnnotations[this.currentPdfPage] = [];
            this.renderPdfPage(this.currentPdfPage);
            this.notification.success('页面标注已清除');
        }
    }
    
    downloadAnnotatedPdf() {
        try {
            // For demo, we'll just download the current canvas as an image
            const link = document.createElement('a');
            link.download = `${this.pdfTitle.textContent || 'annotated-pdf'}.png`;
            link.href = this.pdfCanvas.toDataURL();
            link.click();
            this.notification.success('标注已保存为图片');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            this.notification.error('下载失败');
        }
    }
    
    showPdfLoading() {
        if (this.pdfLoading) {
            this.pdfLoading.classList.remove('hidden');
        }
    }
    
    hidePdfLoading() {
        if (this.pdfLoading) {
            this.pdfLoading.classList.add('hidden');
        }
    }
    
    closePdfViewer() {
        console.log('Closing PDF viewer');
        this.currentPdf = null;
        this.currentPdfDocument = null;
        this.pdfAnnotations = {};
        this.switchView('pdfs');
    }
    
    renderPdfs() {
        console.log('renderPdfs() called');
        
        // Store the app instance for use in event handlers
        const app = this;
        
        // Sample PDF data for demo
        const pdfs = [
            { id: 1, name: '季度报告', size: '2 MB', lastOpened: '昨天', url: '' },
            { id: 2, name: '项目提案', size: '1.5 MB', lastOpened: '3天前', url: '' }
        ];
        
        // Get all existing PDF cards in the HTML
        const pdfCards = document.querySelectorAll('#pdfs-view .note-card[data-pdf-id]');
        console.log('Found PDF cards:', pdfCards.length);
        
        // Add event listeners to existing PDF cards and their buttons
        pdfCards.forEach((card, index) => {
            if (index < pdfs.length) {
                const pdf = pdfs[index];
                console.log('Processing PDF card for:', pdf.name);
                
                // Add click event to the card itself
                card.addEventListener('click', function(e) {
                    // Don't trigger if clicking on buttons
                    if (e.target.closest('button')) return;
                    
                    console.log('PDF card clicked:', pdf.name);
                    app.openPdfViewer(pdf);
                });
                
                // Get the view button inside the card
                const viewBtn = card.querySelector('button:first-of-type');
                if (viewBtn) {
                    viewBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        console.log('View PDF button clicked:', pdf.name);
                        app.openPdfViewer(pdf);
                    });
                    console.log('Added event listener to view button');
                } else {
                    console.warn('View button not found in PDF card');
                }
                
                // Get the download button inside the card
                const downloadBtn = card.querySelector('button:last-of-type');
                if (downloadBtn) {
                    downloadBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        console.log('Download PDF button clicked:', pdf.name);
                        app.notification.info('下载功能开发中...');
                    });
                }
            }
        });
        
        // Add event listener to upload PDF card
        const uploadCard = document.querySelector('#pdfs-view .note-card:not([data-pdf-id])');
        if (uploadCard) {
            uploadCard.addEventListener('click', function() {
                console.log('Upload PDF card clicked');
                app.notification.info('上传功能开发中...');
            });
        }
        
        console.log('PDF cards event listeners added successfully');
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