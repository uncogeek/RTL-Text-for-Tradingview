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
  savedText: ''
};

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
  document.getElementById('textInput').value = settings.savedText || '';
  
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
  const textarea = document.getElementById('textInput');
  
  textarea.style.fontFamily = 'Vazirmatn, Arial, sans-serif';
  textarea.style.fontWeight = settings.fontWeight;
  textarea.style.fontSize = settings.fontSize + 'px';
  textarea.style.lineHeight = settings.lineHeight;
  textarea.style.color = settings.textColor;
  
  // Apply width if wrapping is enabled
  if (settings.wrapText) {
    textarea.style.width = settings.maxWidth + 'px';
    textarea.style.maxWidth = settings.maxWidth + 'px';
    textarea.style.whiteSpace = 'pre-wrap';
    textarea.style.margin = '0';
  } else {
    textarea.style.width = '';
    textarea.style.maxWidth = 'none';
    textarea.style.whiteSpace = 'pre';
    textarea.style.margin = '0';
  }
  
  if (settings.fillBg) {
    const opacity = settings.bgOpacity / 100;
    const rgb = hexToRgb(settings.bgColor);
    textarea.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  } else {
    textarea.style.backgroundColor = 'transparent';
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

// Helper function to generate image
function generateImage(callback) {
  const text = document.getElementById('textInput').value;
  
  if (!text.trim()) {
    return;
  }
  
  try {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set font for measurement
    ctx.font = `${settings.fontWeight} ${settings.fontSize}px Vazirmatn, Arial`;
    ctx.direction = 'rtl';
    
    let allLines = [];
    
    if (settings.wrapText) {
      // Process with wrapping
      const inputLines = text.split('\n');
      const effectiveMaxWidth = settings.maxWidth - (settings.padding * 2) - (settings.showBorder ? settings.borderWidth * 2 : 0);
      
      inputLines.forEach(line => {
        if (line.trim() === '') {
          allLines.push('');
        } else {
          const wrappedLines = wrapTextLines(ctx, line, effectiveMaxWidth);
          allLines.push(...wrappedLines);
        }
      });
    } else {
      // No wrapping - use original lines
      allLines = text.split('\n');
    }
    
    // Measure text dimensions
    let maxWidth = 0;
    const lineHeightPx = settings.fontSize * settings.lineHeight;
    
    allLines.forEach(line => {
      const metrics = ctx.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    });
    
    // If wrapping is enabled, use the max width setting
    if (settings.wrapText) {
      maxWidth = Math.min(maxWidth, settings.maxWidth - (settings.padding * 2) - (settings.showBorder ? settings.borderWidth * 2 : 0));
    }
    
    // Calculate canvas size
    const borderWidth = settings.showBorder ? settings.borderWidth : 0;
    const totalPadding = settings.padding * 2;
    const totalBorder = borderWidth * 2;
    
    canvas.width = maxWidth + totalPadding + totalBorder;
    canvas.height = (allLines.length * lineHeightPx) + totalPadding + totalBorder;
    
    // Reset context after resize
    ctx.font = `${settings.fontWeight} ${settings.fontSize}px Vazirmatn, Arial`;
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    
    // Fill background if enabled
    if (settings.fillBg) {
      const rgb = hexToRgb(settings.bgColor);
      const opacity = settings.bgOpacity / 100;
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw border if enabled
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
    
    // Draw text
    ctx.fillStyle = settings.textColor;
    const startX = canvas.width - settings.padding - borderWidth;
    const startY = settings.padding + borderWidth;
    
    allLines.forEach((line, i) => {
      const y = startY + (i * lineHeightPx);
      ctx.fillText(line, startX, y);
    });
    
    // Call callback with data URL or blob
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
  
  // Trigger reflow
  void toast.offsetWidth;
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Font weight slider
document.getElementById('fontWeight').addEventListener('input', (e) => {
  settings.fontWeight = parseInt(e.target.value);
  document.getElementById('fontWeightValue').textContent = settings.fontWeight;
  saveSettings();
  updateTextareaStyle();
});

// Font size controls
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

// Line height controls
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

// Text color
document.getElementById('textColor').addEventListener('input', (e) => {
  settings.textColor = e.target.value;
  saveSettings();
  updateTextareaStyle();
});

// Background color
document.getElementById('bgColor').addEventListener('input', (e) => {
  settings.bgColor = e.target.value;
  saveSettings();
  updateTextareaStyle();
});

// Background opacity
document.getElementById('bgOpacity').addEventListener('input', (e) => {
  settings.bgOpacity = parseInt(e.target.value);
  document.getElementById('bgOpacityValue').textContent = settings.bgOpacity + '%';
  saveSettings();
  updateTextareaStyle();
});

// Fill background checkbox
document.getElementById('fillBg').addEventListener('change', (e) => {
  settings.fillBg = e.target.checked;
  saveSettings();
  updateTextareaStyle();
});

// Show border checkbox
document.getElementById('showBorder').addEventListener('change', (e) => {
  settings.showBorder = e.target.checked;
  saveSettings();
});

// Border color
document.getElementById('borderColor').addEventListener('input', (e) => {
  settings.borderColor = e.target.value;
  saveSettings();
});

// Border width controls
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

// Padding controls
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

// Wrap text checkbox
document.getElementById('wrapText').addEventListener('change', (e) => {
  settings.wrapText = e.target.checked;
  saveSettings();
  updateWrapControlState();
  updateTextareaStyle();
});

// Max width slider
document.getElementById('maxWidth').addEventListener('input', (e) => {
  settings.maxWidth = parseInt(e.target.value);
  document.getElementById('maxWidthValue').textContent = settings.maxWidth + 'px';
  saveSettings();
  updateTextareaStyle();
});

// Recycle button - Clear text
document.getElementById('recycleBtn').addEventListener('click', () => {
  document.getElementById('textInput').value = '';
  settings.savedText = '';
  saveSettings();
  showToast('Text cleared!', 'success');
});

// Preview button - Show preview modal
document.getElementById('previewBtn').addEventListener('click', () => {
  const text = document.getElementById('textInput').value;
  
  if (!text.trim()) {
    showToast('Please enter some text to preview!', 'error');
    return;
  }
  
  generateImage((dataUrl) => {
    document.getElementById('previewImage').src = dataUrl;
    document.getElementById('previewModal').classList.add('active');
  });
});

// Download button - Download image
document.getElementById('downloadBtn').addEventListener('click', () => {
  const text = document.getElementById('textInput').value;
  
  if (!text.trim()) {
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

// Close preview modal
document.getElementById('closePreview').addEventListener('click', () => {
  document.getElementById('previewModal').classList.remove('active');
});

// Close preview when clicking outside
document.getElementById('previewModal').addEventListener('click', (e) => {
  if (e.target.id === 'previewModal') {
    document.getElementById('previewModal').classList.remove('active');
  }
});

// Save text when typing
document.getElementById('textInput').addEventListener('input', (e) => {
  settings.savedText = e.target.value;
  saveSettings();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('insertBtn').click();
  } else if (e.key === 'Escape') {
    document.getElementById('previewModal').classList.remove('active');
  }
});

// Insert button
document.getElementById('insertBtn').addEventListener('click', async () => {
  const text = document.getElementById('textInput').value;
  
  if (!text.trim()) {
    showToast('Please enter some text!', 'error');
    return;
  }
  
  const canvas = generateImage();
  if (!canvas) return;
  
  try {
    // Convert canvas to blob and copy to clipboard
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('✓ Image copied! Paste in TradingView', 'success');
      } catch (err) {
        console.error('Clipboard error:', err);
        showToast('Error: ' + err.message, 'error');
      }
    }, 'image/png');
  } catch (err) {
    console.error('Error:', err);
    showToast('Error: ' + err.message, 'error');
  }
});

// Initialize
loadSettings();