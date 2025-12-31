console.log('✅ RTL Text to Image - Background script loaded (Firefox)');

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'triggerPaste') {
    console.log('🎨 Trigger paste received in background');
    
    // Query the active tab
    browser.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        console.log('Active tab found:', activeTab.id, activeTab.url);
        
        try {
          // Focus the window first
          await browser.windows.update(activeTab.windowId, { focused: true });
          console.log('Window focused');
          
          // Focus the tab
          await browser.tabs.update(activeTab.id, { active: true });
          console.log('Tab activated');
          
          // Wait a bit for focus to settle
          setTimeout(async () => {
            try {
              // Send message to content script with autoPaste setting
              const response = await browser.tabs.sendMessage(activeTab.id, { 
                action: 'paste',
                autoPaste: request.autoPaste || false
              });
              console.log('✔ Message sent to content script, response:', response);
              sendResponse({ success: true, response });
            } catch (error) {
              console.error('❌ Error sending message to content script:', error);
              sendResponse({ success: false, error: error.message });
            }
          }, 150);
          
        } catch (error) {
          console.error('❌ Error in background script:', error);
          sendResponse({ success: false, error: error.message });
        }
      } else {
        console.error('❌ No active tab found');
        sendResponse({ success: false, error: 'No active tab' });
      }
    }).catch(error => {
      console.error('❌ Error querying tabs:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Keep the message channel open for async response
  }
});