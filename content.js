document.addEventListener('mouseup', () => {
    const selection = window.getSelection().toString();
    if (selection.length > 0) {
      // Retrieve  saved Highlight color
      chrome.storage.sync.get('HighlightColor', (data) => {
        const HighlightColor = data.HighlightColor || 'yellow';
        const span = document.createElement('span');
        span.textContent = selection;
        span.className = 'annotation';
        span.style.backgroundColor = HighlightColor;
        
        const range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        range.insertNode(span);
        window.getSelection().removeAllRanges();
        
        const note = prompt('Add a note to this highlight :)', '');
        if (note) {
          const noteEl = document.createElement('div');
          noteEl.className = 'note';
          noteEl.textContent = note;
          span.appendChild(noteEl);
        }
  
        saveAnnotations();
      });
    }
  });
  
  function saveAnnotations() {
    const annotations = Array.from(document.querySelectorAll('.annotation')).map(annotation => ({
      text: annotation.textContent,
      note: annotation.querySelector('.note') ? annotation.querySelector('.note').textContent : '',
      color: annotation.style.backgroundColor,
      offset: getOffset(annotation),
      date : annotation.dataset.date,
    }));
  
    const url = window.location.href;
    chrome.storage.local.set({ [url]: annotations }, () => {
      console.log('Annotations are saved');
    });
  }
  
  function getOffset(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX
    };
  }
  
  function loadAnnotations() {
    const url = window.location.href;
    chrome.storage.local.get([url], (result) => {
      if (result[url]) {
        result[url].forEach(annotation => {
          const span = document.createElement('span');
          span.textContent = annotation.text;
          span.className = 'annotation';
          span.style.backgroundColor = annotation.color;
          span.style.position = 'absolute';
          span.style.top = annotation.offset.top + 'px';
          span.style.left = annotation.offset.left + 'px';
  
          if (annotation.note) {
            const noteEl = document.createElement('div');
            noteEl.className = 'note';
            noteEl.textContent = annotation.note;
            span.appendChild(noteEl);
          }
  
          document.body.appendChild(span);
        });
      }
    });
  }
  // Collect annotations
function getAnnotations() {
  const annotations = Array.from(document.querySelectorAll('.annotation')).map(annotation => ({
      text: annotation.textContent,
      note: annotation.querySelector('.note') ? annotation.querySelector('.note').textContent : ''
  }));
  return annotations;
}

// Send annotations to background script
function exportAnnotations(format) {
  const annotations = getAnnotations();
  chrome.runtime.sendMessage({ action: 'export_annotations', format, annotations });
}
  
    
  window.addEventListener('load', loadAnnotations);