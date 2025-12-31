// ============================================
// DEVELOPER OPTIONS
// ============================================
const SHOW_NOTIFICATION = false;    // Set to true to show "Image Ready" notification
// ============================================

// Listen for messages from background script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'paste') {
    console.log('🎨 Paste action received in content script');
    
    // Show notification if enabled
    if (SHOW_NOTIFICATION) {
      showPasteNotification();
    }
    
    // Auto-paste if enabled by user
    if (request.autoPaste) {
      // Focus the drawing area first
      focusDrawingArea();
      
      // Wait a bit for focus, then attempt paste
      setTimeout(() => {
        attemptPaste();
      }, 100);
    }
    
    sendResponse({ success: true });
  }
  return true;
});

function showPasteNotification() {
  // Remove any existing notification first
  const existing = document.getElementById('rtl-paste-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'rtl-paste-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px 48px;
      border-radius: 16px;
      font-family: Arial, sans-serif;
      font-size: 24px;
      font-weight: 700;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      z-index: 2147483647;
      text-align: center;
      animation: rtlPulse 0.5s ease;
      border: 4px solid rgba(255,255,255,0.3);
    ">
      <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
      <div style="margin-bottom: 12px;">Image Ready!</div>
      <div style="
        font-size: 32px;
        background: rgba(255,255,255,0.2);
        padding: 16px 32px;
        border-radius: 12px;
        letter-spacing: 4px;
        border: 3px solid rgba(255,255,255,0.4);
        animation: rtlBounce 1s ease infinite;
      ">
        Press <span style="color: #FFD700;">Ctrl+V</span>
      </div>
      <div style="font-size: 14px; margin-top: 16px; opacity: 0.9;">
        Click anywhere to dismiss
      </div>
    </div>
  `;
  
  // Add click to dismiss
  notification.addEventListener('click', () => {
    notification.style.animation = 'rtlFadeOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  });
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.getElementById('rtl-paste-notification')) {
      notification.style.animation = 'rtlFadeOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }
  }, 10000);
}

function focusDrawingArea() {
  console.log('🎯 Attempting to focus drawing area...');
  
  // Common selectors for drawing canvases and containers
  const selectors = [
    // Kleki specific
    'canvas.main-canvas',
    'canvas[data-canvas="main"]',
    '.kleki-canvas',
    
    // TradingView specific
    'canvas.chart-canvas',
    'canvas[data-name="canvases"]',
    '.chart-container canvas',
    
    // Generic drawing apps
    'canvas#canvas',
    'canvas.canvas',
    '.drawing-canvas',
    '.paint-canvas',
    'canvas[width][height]',
    
    // Fallback to any canvas
    'canvas'
  ];
  
  let focused = false;
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    
    if (elements.length > 0) {
      // Try each matching element
      elements.forEach(element => {
        try {
          // Make it focusable if needed
          if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '-1');
          }
          
          // Click on it first (some apps require this)
          element.click();
          
          // Then focus it
          element.focus();
          
          console.log('✅ Focused element:', element.tagName, element.className, selector);
          focused = true;
        } catch (e) {
          console.log('Failed to focus:', selector, e.message);
        }
      });
      
      if (focused) break;
    }
  }
  
  if (!focused) {
    console.log('⚠️ Could not find drawing canvas, trying document.body');
    document.body.focus();
  }
  
  // Also try to focus the window
  try {
    window.focus();
  } catch (e) {
    console.log('Window focus failed:', e.message);
  }
}

function attemptPaste() {
  console.log('📋 Attempting paste on:', document.activeElement.tagName, document.activeElement.className);
  
  const activeElement = document.activeElement;
  
  // Method 1: Try execCommand on active element
  try {
    const result = document.execCommand('paste');
    console.log('📋 execCommand paste result:', result);
  } catch (e) {
    console.log('❌ execCommand failed:', e.message);
  }
  
  // Method 2: Dispatch keyboard events (Ctrl+V)
  try {
    // Keydown
    activeElement.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'v',
      code: 'KeyV',
      keyCode: 86,
      which: 86,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
      composed: true
    }));
    
    // Keypress
    activeElement.dispatchEvent(new KeyboardEvent('keypress', {
      key: 'v',
      code: 'KeyV',
      keyCode: 86,
      which: 86,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
      composed: true
    }));
    
    // Keyup
    activeElement.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'v',
      code: 'KeyV',
      keyCode: 86,
      which: 86,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
      composed: true
    }));
    
    console.log('⌨️ Keyboard events dispatched on active element');
  } catch (e) {
    console.log('❌ Keyboard events failed:', e.message);
  }
  
  // Method 3: Dispatch paste event with clipboard data
  try {
    navigator.clipboard.read().then(clipboardItems => {
      clipboardItems.forEach(clipboardItem => {
        clipboardItem.types.forEach(type => {
          if (type.startsWith('image/')) {
            clipboardItem.getType(type).then(blob => {
              const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                composed: true,
                clipboardData: new DataTransfer()
              });
              
              // Try to add the image to clipboard data
              try {
                const file = new File([blob], 'image.png', { type: 'image/png' });
                pasteEvent.clipboardData.items.add(file);
              } catch (e) {
                console.log('Could not add to clipboard data:', e.message);
              }
              
              activeElement.dispatchEvent(pasteEvent);
              document.dispatchEvent(pasteEvent);
              
              console.log('🔎 Paste event with clipboard data dispatched');
            });
          }
        });
      });
    }).catch(e => {
      console.log('❌ Clipboard read failed:', e.message);
    });
  } catch (e) {
    console.log('❌ Clipboard paste event failed:', e.message);
  }
  
  // Method 4: Try on document as well
  try {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'v',
      code: 'KeyV',
      keyCode: 86,
      which: 86,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
      composed: true
    }));
    
    document.dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      composed: true
    }));
    
    console.log('📄 Events also dispatched on document');
  } catch (e) {
    console.log('❌ Document events failed:', e.message);
  }
  
  // Show instruction to user
  console.log('💡 If automatic paste didn\'t work, manually press Ctrl+V');
}

// Add animation styles
if (!document.getElementById('rtl-paste-styles')) {
  const style = document.createElement('style');
  style.id = 'rtl-paste-styles';
  style.textContent = `
    @keyframes rtlSlideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes rtlSlideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
    @keyframes rtlPulse {
      0% {
        transform: translate(-50%, -50%) scale(0.9);
        opacity: 0;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.05);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
    @keyframes rtlBounce {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
    @keyframes rtlFadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ RTL Text to Image - Content script loaded [V3 - Firefox]');