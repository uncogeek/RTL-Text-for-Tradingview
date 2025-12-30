// Settings object
let settings = {
  fontWeight: 400,
  fontSize: 20,
  lineHeight: 1.5,
  textColor: '#000000',
  bgColor: '#ffffff',
  bgOpacity: 100,
  fillBg: true,
  showBorder: false,
  borderColor: '#000000',
  borderWidth: 2,
  padding: 20,
  wrapText: false,
  maxWidth: 800,
  rtlMode: true,
  savedText: '',
  autoPaste: false
};
// Track cursor position and selection
let cursorPosition = 0;
let savedSelection = null;

// Material Design Color Palette (reduced to 3 shades per color)
const MATERIAL_COLORS = {
  red: ['#EF9A9A', '#EF5350', '#D32F2F'],
  pink: ['#F48FB1', '#EC407A', '#C2185B'],
  purple: ['#CE93D8', '#AB47BC', '#7B1FA2'],
  blue: ['#90CAF9', '#42A5F5', '#1976D2'],
  cyan: ['#80DEEA', '#26C6DA', '#0097A7'],
  green: ['#A5D6A7', '#66BB6A', '#388E3C'],
  yellow: ['#FFF59D', '#FFEE58', '#FBC02D'],
  orange: ['#FFCC80', '#FFA726', '#F57C00'],
  grey: ['#E0E0E0', '#9E9E9E', '#616161']
};

// Quick access emojis
const QUICK_EMOJIS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '✅', '❌', '⚠️', '←', '↑', '→', '↓', '✓' , '✗', '■', '●'];

// Extended emoji collection for modal
const EMOJIS = [
  '☑️', '✔️', '🔔', '👈', '👉', '👆', '👇', '☝️', '⛔️',
  '🟢', '🔴', '⚪️', '⚫️', '🟤', '🔳', '🔲', '▪️', '▫️', '🟠', '🧲',
  '⚖️', '⏰', '📌', '📍', '❗️', '❕', '❓', '❔', '‼️', '⁉️',
  '↕️', '↔️', '📈', '📉', '⏰', '⛔️', '📝', '📅'
];

const UNICODE_CHARS = [
  '⇒', '⇐', '⇑', '⇔', '⮕', '➜', '➔', '➡', '⬅', '⬆',
  '⬇', '∗', '−', '+', '×', '=', '≠', '◦', '∙', '●',
  '○', '■', '□', '►', '◄', '—', '―', '⸺', '★', '☆',
  '✓', '✔', '✗', '✘'
];

// Save selection
function saveSelection() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedSelection = selection.getRangeAt(0).cloneRange();
    return true;
  }
  return false;
}

// Restore selection
function restoreSelection() {
  if (savedSelection) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelection);
    return true;
  }
  return false;
}

// Load settings
function loadSettings() {
  const saved = localStorage.getItem('rtl_text_settings');
  if (saved) {
    settings = { ...settings, ...JSON.parse(saved) };
    applySettingsToUI();
  }
}

// Save settings
function saveSettings() {
  localStorage.setItem('rtl_text_settings', JSON.stringify(settings));
}

// Apply settings to UI
function applySettingsToUI() {
  document.getElementById('fontWeight').value = settings.fontWeight;
  document.getElementById('fontWeightValue').textContent = settings.fontWeight;
  document.getElementById('fontSizeDisplay').textContent = settings.fontSize;
  document.getElementById('lineHeightDisplay').textContent = settings.lineHeight;
  document.getElementById('textColor').value = settings.textColor;
  document.getElementById('bgColor').value = settings.bgColor;
  document.getElementById('bgOpacity').value = settings.bgOpacity;
  document.getElementById('bgOpacityValue').textContent = settings.bgOpacity + '%';
  document.getElementById('fillBg').checked = settings.fillBg;
  document.getElementById('showBorder').checked = settings.showBorder;
  document.getElementById('borderColor').value = settings.borderColor;
  document.getElementById('borderWidthDisplay').textContent = settings.borderWidth;
  document.getElementById('paddingDisplay').textContent = settings.padding;
  document.getElementById('wrapText').checked = settings.wrapText;
  document.getElementById('maxWidth').value = settings.maxWidth;
  document.getElementById('maxWidthValue').textContent = settings.maxWidth + 'px';
  document.getElementById('rtlMode').checked = settings.rtlMode;
  document.getElementById('autoPaste').checked = settings.autoPaste;
  
  // Restore saved text with colors
  const editor = document.getElementById('textInput');
  if (settings.savedText) {
    editor.innerHTML = settings.savedText;
  }
  
  updateWrapControlState();
  updateTextareaStyle();
}

// Update wrap control visibility
function updateWrapControlState() {
  const wrapControl = document.getElementById('wrapControl');
  if (settings.wrapText) {
    wrapControl.classList.remove('disabled');
  } else {
    wrapControl.classList.add('disabled');
  }
}

// Update textarea style
function updateTextareaStyle() {
  const editor = document.getElementById('textInput');
  
  editor.style.fontFamily = 'Vazirmatn, Arial, sans-serif';
  editor.style.fontWeight = settings.fontWeight;
  editor.style.fontSize = settings.fontSize + 'px';
  editor.style.lineHeight = settings.lineHeight;
  editor.style.color = settings.textColor;
  
  editor.style.direction = settings.rtlMode ? 'rtl' : 'ltr';
  editor.style.textAlign = settings.rtlMode ? 'right' : 'left';
  
  if (settings.wrapText) {
    editor.style.width = settings.maxWidth + 'px';
    editor.style.maxWidth = settings.maxWidth + 'px';
    editor.style.whiteSpace = 'pre-wrap';
  } else {
    editor.style.width = '';
    editor.style.maxWidth = 'none';
    editor.style.whiteSpace = 'pre';
  }
  
  if (settings.fillBg) {
    const opacity = settings.bgOpacity / 100;
    const rgb = hexToRgb(settings.bgColor);
    editor.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  } else {
    editor.style.backgroundColor = 'transparent';
  }
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Get plain text from contenteditable
function getPlainText(element) {
  let text = '';
  
  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        text += '\n';
      } else if (node.tagName === 'DIV') {
        if (text && !text.endsWith('\n')) {
          text += '\n';
        }
        for (let child of node.childNodes) {
          processNode(child);
        }
      } else {
        for (let child of node.childNodes) {
          processNode(child);
        }
      }
    }
  }
  
  processNode(element);
  return text;
}

// Get text segments with colors
function getTextSegments(element) {
  const segments = [];
  
  function processNode(node, inheritedColor = null) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        segments.push({
          text: text,
          color: inheritedColor || settings.textColor
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const nodeColor = node.style.color || inheritedColor;
      
      if (node.tagName === 'BR') {
        segments.push({ text: '\n', color: inheritedColor || settings.textColor });
      } else if (node.tagName === 'DIV') {
        if (segments.length > 0 && segments[segments.length - 1].text !== '\n') {
          segments.push({ text: '\n', color: inheritedColor || settings.textColor });
        }
        for (let child of node.childNodes) {
          processNode(child, nodeColor);
        }
      } else {
        for (let child of node.childNodes) {
          processNode(child, nodeColor);
        }
      }
    }
  }
  
  processNode(element);
  return segments;
}

// Helper function to wrap text lines
function wrapTextLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

function generateImage(callback) {
  const editor = document.getElementById('textInput');
  const segments = getTextSegments(editor);
  
  if (segments.length === 0 || segments.every(s => !s.text.trim())) {
    return;
  }
  
  try {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.font = `${settings.fontWeight} ${settings.fontSize}px Vazirmatn, Arial`;
    ctx.direction = settings.rtlMode ? 'rtl' : 'ltr';
    
    // Process segments into lines
    let processedLines = [];
    
    if (settings.wrapText) {
      const effectiveMaxWidth = settings.maxWidth - (settings.padding * 2) - (settings.showBorder ? settings.borderWidth * 2 : 0);
      
      let currentLineSegments = [];
      let currentLineWidth = 0;
      
      segments.forEach(segment => {
        const lines = segment.text.split('\n');
        
        lines.forEach((lineText, lineIndex) => {
          if (lineIndex > 0) {
            if (currentLineSegments.length > 0) {
              processedLines.push(currentLineSegments);
              currentLineSegments = [];
              currentLineWidth = 0;
            }
          }
          
          if (lineText) {
            const words = lineText.split(' ');
            
            words.forEach((word, wordIndex) => {
              const testText = (wordIndex > 0 ? ' ' : '') + word;
              const metrics = ctx.measureText(testText);
              
              if (currentLineWidth + metrics.width > effectiveMaxWidth && currentLineSegments.length > 0) {
                processedLines.push(currentLineSegments);
                currentLineSegments = [];
                currentLineWidth = 0;
              }
              
              const actualText = (currentLineSegments.length > 0 && currentLineWidth > 0 ? ' ' : '') + word;
              const actualMetrics = ctx.measureText(actualText);
              
              currentLineSegments.push({
                text: actualText,
                color: segment.color,
                width: actualMetrics.width
              });
              
              currentLineWidth += actualMetrics.width;
            });
          }
        });
      });
      
      if (currentLineSegments.length > 0) {
        processedLines.push(currentLineSegments);
      }
    } else {
      let currentLineSegments = [];
      
      segments.forEach(segment => {
        const lines = segment.text.split('\n');
        
        lines.forEach((lineText, lineIndex) => {
          if (lineIndex > 0) {
            if (currentLineSegments.length > 0) {
              processedLines.push(currentLineSegments);
            }
            currentLineSegments = [];
          }
          
          if (lineText || lineIndex === 0) {
            const metrics = ctx.measureText(lineText);
            currentLineSegments.push({
              text: lineText,
              color: segment.color,
              width: metrics.width
            });
          }
        });
      });
      
      if (currentLineSegments.length > 0) {
        processedLines.push(currentLineSegments);
      }
    }
    
    // Calculate dimensions
    let maxWidth = 0;
    processedLines.forEach(lineSegments => {
      const lineWidth = lineSegments.reduce((sum, seg) => sum + seg.width, 0);
      maxWidth = Math.max(maxWidth, lineWidth);
    });
    
    if (settings.wrapText) {
      const effectiveMaxWidth = settings.maxWidth - (settings.padding * 2) - (settings.showBorder ? settings.borderWidth * 2 : 0);
      maxWidth = Math.min(maxWidth, effectiveMaxWidth);
    }
    
    const lineHeightPx = settings.fontSize * settings.lineHeight;
    const borderWidth = settings.showBorder ? settings.borderWidth : 0;
    const totalPadding = settings.padding * 2;
    const totalBorder = borderWidth * 2;
    
    canvas.width = maxWidth + totalPadding + totalBorder;
    canvas.height = (processedLines.length * lineHeightPx) + totalPadding + totalBorder;
    
    // Reset context
    ctx.font = `${settings.fontWeight} ${settings.fontSize}px Vazirmatn, Arial`;
    ctx.direction = settings.rtlMode ? 'rtl' : 'ltr';
    ctx.textAlign = settings.rtlMode ? 'right' : 'left';
    ctx.textBaseline = 'top';
    
    // Fill background
    if (settings.fillBg) {
      const rgb = hexToRgb(settings.bgColor);
      const opacity = settings.bgOpacity / 100;
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw border
    if (settings.showBorder && borderWidth > 0) {
      ctx.strokeStyle = settings.borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(
        borderWidth / 2, 
        borderWidth / 2, 
        canvas.width - borderWidth, 
        canvas.height - borderWidth
      );
    }
    
    // Draw text with colors
    const startY = settings.padding + borderWidth;
    
    processedLines.forEach((lineSegments, lineIndex) => {
      const y = startY + (lineIndex * lineHeightPx);
      
      if (settings.rtlMode) {
        let x = canvas.width - settings.padding - borderWidth;
        
        lineSegments.forEach(segment => {
          ctx.fillStyle = segment.color;
          ctx.fillText(segment.text, x, y);
          x -= segment.width;
        });
      } else {
        let x = settings.padding + borderWidth;
        
        lineSegments.forEach(segment => {
          ctx.fillStyle = segment.color;
          ctx.fillText(segment.text, x, y);
          x += segment.width;
        });
      }
    });
    
    if (callback) {
      callback(canvas.toDataURL('image/png'));
    }
    
    return canvas;
    
  } catch (err) {
    console.error('Error generating image:', err);
    showToast('Error: ' + err.message, 'error');
    return null;
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  toastMessage.textContent = message;
  toast.className = 'toast ' + type;
  
  void toast.offsetWidth;
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Initialize color palette
function initColorPalette() {
  const colorGrid = document.getElementById('colorPaletteGrid');
  colorGrid.innerHTML = '';
  
  Object.entries(MATERIAL_COLORS).forEach(([colorName, shades]) => {
    shades.forEach(color => {
      const colorBtn = document.createElement('div');
      colorBtn.className = 'color-palette-item';
      colorBtn.style.backgroundColor = color;
      colorBtn.title = color;
      colorBtn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent losing selection
      });
      colorBtn.addEventListener('click', (e) => {
        e.preventDefault();
        applyColorToSelection(color);
      });
      colorGrid.appendChild(colorBtn);
    });
  });
}

// Apply color to selected text
function applyColorToSelection(color) {
  const editor = document.getElementById('textInput');
  
  // First try to restore saved selection
  if (!restoreSelection()) {
    showToast('Please select text to colorize!', 'error');
    return;
  }
  
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  
  if (range.collapsed) {
    showToast('Please select text to colorize!', 'error');
    return;
  }
  
  if (!editor.contains(range.commonAncestorContainer)) {
    showToast('Please select text in the editor!', 'error');
    return;
  }
  
  const span = document.createElement('span');
  span.style.color = color;
  
  try {
    range.surroundContents(span);
  } catch (e) {
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
  }
  
  saveEditorContent();
  showToast('Color applied!', 'success');
  
  // Clear selection and saved selection
  selection.removeAllRanges();
  savedSelection = null;
  
  // Close palette
  document.getElementById('colorPalettePanel').classList.remove('active');
}

// Custom color picker
document.getElementById('customColorPicker').addEventListener('mousedown', (e) => {
  e.preventDefault();
});

document.getElementById('customColorPicker').addEventListener('change', (e) => {
  applyColorToSelection(e.target.value);
});

// Reset color button
document.getElementById('resetColorBtn').addEventListener('mousedown', (e) => {
  e.preventDefault();
});

document.getElementById('resetColorBtn').addEventListener('click', () => {
  const editor = document.getElementById('textInput');
  
  if (!restoreSelection()) {
    showToast('Please select text to reset color!', 'error');
    return;
  }
  
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  
  if (range.collapsed) {
    showToast('Please select text to reset color!', 'error');
    return;
  }
  
  if (!editor.contains(range.commonAncestorContainer)) return;
  
  const fragment = range.extractContents();
  const tempDiv = document.createElement('div');
  tempDiv.appendChild(fragment);
  
  // Remove color styling
  const styledElements = tempDiv.querySelectorAll('[style*="color"]');
  styledElements.forEach(el => {
    el.style.color = '';
    if (!el.getAttribute('style')) {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    }
  });
  
  range.insertNode(tempDiv.firstChild || document.createTextNode(tempDiv.textContent));
  saveEditorContent();
  showToast('Color reset!', 'success');
  
  selection.removeAllRanges();
  savedSelection = null;
  
  document.getElementById('colorPalettePanel').classList.remove('active');
});

// Toggle color palette
document.getElementById('colorPaletteBtn').addEventListener('click', () => {
  const panel = document.getElementById('colorPalettePanel');
  const isActive = panel.classList.contains('active');
  
  if (!isActive) {
    // Save current selection before opening
    if (!saveSelection()) {
      showToast('Please select text first!', 'error');
      return;
    }
  }
  
  panel.classList.toggle('active');
  
  if (!isActive) {
    //showToast('Pick a color to apply', 'success');
  }
});

document.getElementById('closeColorPalette').addEventListener('click', () => {
  document.getElementById('colorPalettePanel').classList.remove('active');
  savedSelection = null;
});

// Save editor content
function saveEditorContent() {
  const editor = document.getElementById('textInput');
  settings.savedText = editor.innerHTML;
  saveSettings();
}

// Quick emoji buttons
function initQuickEmojis() {
  const container = document.getElementById('quickEmojiContainer');
  container.innerHTML = '';
  
  QUICK_EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'quick-emoji-btn';
    btn.textContent = emoji;
    btn.title = `Insert ${emoji}`;
    btn.addEventListener('click', () => {
      insertAtCursor(emoji);
      showToast('Inserted!', 'success');
    });
    container.appendChild(btn);
  });
}

// Insert at cursor
function insertAtCursor(text) {
  const editor = document.getElementById('textInput');
  editor.focus();
  
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
  
  saveEditorContent();
}

// Initialize emoji and unicode pickers
function initEmojiPicker() {
  const emojiGrid = document.getElementById('emojiGrid');
  emojiGrid.innerHTML = '';
  
  EMOJIS.forEach(emoji => {
    const item = document.createElement('div');
    item.className = 'picker-item';
    item.textContent = emoji;
    item.addEventListener('click', () => {
      insertAtCursor(emoji);
      document.getElementById('emojiPicker').classList.remove('active');
      showToast('Emoji inserted!', 'success');
    });
    emojiGrid.appendChild(item);
  });
}

function initUnicodePicker() {
  const unicodeGrid = document.getElementById('unicodeGrid');
  unicodeGrid.innerHTML = '';
  
  UNICODE_CHARS.forEach(char => {
    const item = document.createElement('div');
    item.className = 'picker-item';
    item.textContent = char;
    item.addEventListener('click', () => {
      insertAtCursor(char);
      document.getElementById('unicodePicker').classList.remove('active');
      showToast('Character inserted!', 'success');
    });
    unicodeGrid.appendChild(item);
  });
}

// Event Listeners
document.getElementById('fontWeight').addEventListener('input', (e) => {
  settings.fontWeight = parseInt(e.target.value);
  document.getElementById('fontWeightValue').textContent = settings.fontWeight;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('fontSizeInc').addEventListener('click', () => {
  settings.fontSize = Math.min(settings.fontSize + 1, 100);
  document.getElementById('fontSizeDisplay').textContent = settings.fontSize;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('fontSizeDec').addEventListener('click', () => {
  settings.fontSize = Math.max(settings.fontSize - 1, 8);
  document.getElementById('fontSizeDisplay').textContent = settings.fontSize;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('lineHeightInc').addEventListener('click', () => {
  settings.lineHeight = Math.min(parseFloat((settings.lineHeight + 0.1).toFixed(1)), 3);
  document.getElementById('lineHeightDisplay').textContent = settings.lineHeight;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('lineHeightDec').addEventListener('click', () => {
  settings.lineHeight = Math.max(parseFloat((settings.lineHeight - 0.1).toFixed(1)), 1);
  document.getElementById('lineHeightDisplay').textContent = settings.lineHeight;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('textColor').addEventListener('input', (e) => {
  settings.textColor = e.target.value;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('bgColor').addEventListener('input', (e) => {
  settings.bgColor = e.target.value;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('bgOpacity').addEventListener('input', (e) => {
  settings.bgOpacity = parseInt(e.target.value);
  document.getElementById('bgOpacityValue').textContent = settings.bgOpacity + '%';
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('fillBg').addEventListener('change', (e) => {
  settings.fillBg = e.target.checked;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('showBorder').addEventListener('change', (e) => {
  settings.showBorder = e.target.checked;
  saveSettings();
});

document.getElementById('borderColor').addEventListener('input', (e) => {
  settings.borderColor = e.target.value;
  saveSettings();
});

document.getElementById('borderWidthInc').addEventListener('click', () => {
  settings.borderWidth = Math.min(settings.borderWidth + 1, 20);
  document.getElementById('borderWidthDisplay').textContent = settings.borderWidth;
  saveSettings();
});

document.getElementById('borderWidthDec').addEventListener('click', () => {
  settings.borderWidth = Math.max(settings.borderWidth - 1, 0);
  document.getElementById('borderWidthDisplay').textContent = settings.borderWidth;
  saveSettings();
});

document.getElementById('paddingInc').addEventListener('click', () => {
  settings.padding = Math.min(settings.padding + 5, 100);
  document.getElementById('paddingDisplay').textContent = settings.padding;
  saveSettings();
});

document.getElementById('paddingDec').addEventListener('click', () => {
  settings.padding = Math.max(settings.padding - 5, 0);
  document.getElementById('paddingDisplay').textContent = settings.padding;
  saveSettings();
});

document.getElementById('wrapText').addEventListener('change', (e) => {
  settings.wrapText = e.target.checked;
  saveSettings();
  updateWrapControlState();
  updateTextareaStyle();
});

document.getElementById('rtlMode').addEventListener('change', (e) => {
  settings.rtlMode = e.target.checked;
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('autoPaste').addEventListener('change', (e) => {
  settings.autoPaste = e.target.checked;
  saveSettings();
});

document.getElementById('maxWidth').addEventListener('input', (e) => {
  settings.maxWidth = parseInt(e.target.value);
  document.getElementById('maxWidthValue').textContent = settings.maxWidth + 'px';
  saveSettings();
  updateTextareaStyle();
});

document.getElementById('recycleBtn').addEventListener('click', () => {
  document.getElementById('textInput').innerHTML = '';
  settings.savedText = '';
  saveSettings();
  showToast('Text cleared!', 'success');
});

document.getElementById('previewBtn').addEventListener('click', () => {
  const editor = document.getElementById('textInput');
  const segments = getTextSegments(editor);
  
  if (segments.length === 0 || segments.every(s => !s.text.trim())) {
    showToast('Please enter some text to preview!', 'error');
    return;
  }
  
  generateImage((dataUrl) => {
    document.getElementById('previewImage').src = dataUrl;
    document.getElementById('previewModal').classList.add('active');
  });
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const editor = document.getElementById('textInput');
  const segments = getTextSegments(editor);
  
  if (segments.length === 0 || segments.every(s => !s.text.trim())) {
    showToast('Please enter some text to download!', 'error');
    return;
  }
  
  generateImage((dataUrl) => {
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    link.download = `rtl-text-${timestamp}.png`;
    link.href = dataUrl;
    link.click();
    showToast('✓ Image downloaded!', 'success');
  });
});

document.getElementById('closePreview').addEventListener('click', () => {
  document.getElementById('previewModal').classList.remove('active');
});

document.getElementById('previewModal').addEventListener('click', (e) => {
  if (e.target.id === 'previewModal') {
    document.getElementById('previewModal').classList.remove('active');
  }
});

document.getElementById('textInput').addEventListener('input', () => {
  saveEditorContent();
});

document.getElementById('emojiBtn').addEventListener('click', () => {
  document.getElementById('emojiPicker').classList.add('active');
});

document.getElementById('unicodeBtn').addEventListener('click', () => {
  document.getElementById('unicodePicker').classList.add('active');
});

document.getElementById('closeEmojiPicker').addEventListener('click', () => {
  document.getElementById('emojiPicker').classList.remove('active');
});

document.getElementById('closeUnicodePicker').addEventListener('click', () => {
  document.getElementById('unicodePicker').classList.remove('active');
});

document.getElementById('emojiPicker').addEventListener('click', (e) => {
  if (e.target.id === 'emojiPicker') {
    document.getElementById('emojiPicker').classList.remove('active');
  }
});

document.getElementById('unicodePicker').addEventListener('click', (e) => {
  if (e.target.id === 'unicodePicker') {
    document.getElementById('unicodePicker').classList.remove('active');
  }
});

document.getElementById('insertBtn').addEventListener('click', async () => {
  const editor = document.getElementById('textInput');
  const segments = getTextSegments(editor);
  
  if (segments.length === 0 || segments.every(s => !s.text.trim())) {
    showToast('Please enter some text!', 'error');
    return;
  }
  
  const canvas = generateImage();
  if (!canvas) return;
  
  try {
    canvas.toBlob(async (blob) => {
      try {
        // Copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        
        console.log('✅ Image copied to clipboard');
        showToast('Image copied! Switching to page...', 'success');
        
        // Wait a moment for clipboard
        await new Promise(resolve => setTimeout(resolve, 150));
        
		// Send message to background script with autoPaste setting
			chrome.runtime.sendMessage({ 
			  action: 'triggerPaste',
			  autoPaste: settings.autoPaste 
			}, (response) => {
			  console.log('📡 Response from background:', response);
          
          // Close popup after showing notification on page
          setTimeout(() => {
            window.close();
          }, 800);
        });
        
      } catch (err) {
        console.error('❌ Clipboard error:', err);
        showToast('Error: ' + err.message, 'error');
      }
    }, 'image/png');
  } catch (err) {
    console.error('❌ Error:', err);
    showToast('Error: ' + err.message, 'error');
  }
});


document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('insertBtn').click();
  } else if (e.key === 'Escape') {
    document.getElementById('previewModal').classList.remove('active');
    document.getElementById('emojiPicker').classList.remove('active');
    document.getElementById('unicodePicker').classList.remove('active');
    document.getElementById('colorPalettePanel').classList.remove('active');
  }
});

// Initialize everything
loadSettings();
initQuickEmojis();
initEmojiPicker();
initUnicodePicker();
initColorPalette();