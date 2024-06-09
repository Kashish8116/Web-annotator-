document.addEventListener('DOMContentLoaded', () => {
    const colorInput = document.getElementById('HighlightColor');
    // Fetching already saved color from storage 
    chrome.storage.sync.get('HighlightColor', (data) => {
      colorInput.value = data.HighlightColor || '#ffff00'; // default yellow
    });
    // save selected color to storage
    document.getElementById('save').addEventListener('click', () => {
      const color = colorInput.value;
      chrome.storage.sync.set({ HighlightColor: color }, () => {
        alert('Highlight color Updated :)');
      });
    });
  });
  