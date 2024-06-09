document.getElementById('startAnnotating').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        files: ['content.js']
      });
    });
  });
  
  document.getElementById('clearAnnotations').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          document.querySelectorAll('.annotation').forEach(el => el.remove());
          const url = window.location.href;
          chrome.storage.local.remove(url, () => {
            alert('Annotations are cleared');
          });
        }
      });
    });
  });
  
  document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  document.getElementById('searchAnnotations').addEventListener('click', () => {
    const keyword = document.getElementById('searchKeyword').value.toLowerCase();
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      chrome.storage.local.get([url], (result) => {
        const annotations = result[url] || [];
        const filteredAnnotations = annotations.filter(annotation => {
          const matchesKeyword = keyword ? annotation.text.toLowerCase().includes(keyword) || annotation.note.toLowerCase().includes(keyword) : true;
         
          
          return matchesKeyword;
        });
        displayResults(filteredAnnotations);
    });
  });
});
document.getElementById('downloadBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: exportHighlights
    });
  });
});

function exportHighlights() {
  const highlights = Array.from(document.querySelectorAll('.highlight')).map(highlight => ({
    text: highlight.textContent,
    note: highlight.getAttribute('data-note') || ''
  }));
  chrome.runtime.sendMessage({ action: 'export_highlights_to_pdf', highlights });
}

function displayResults(annotations) {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '';

  if (annotations.length === 0) {
    resultsContainer.textContent = 'No annotations found :(';
  } else {
    annotations.forEach(annotation => {
      const annotationEl = document.createElement('div');
      annotationEl.className = 'search-result';
      annotationEl.textContent = `${annotation.text} - ${annotation.note}`;
      resultsContainer.appendChild(annotationEl);
    });
  }
}