chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      switch (command) {
          case "start_annotating":
              chrome.scripting.executeScript({
                  target: { tabId},
                  function: startAnnotating
              });
              break;
          case "clear_annotations":
              chrome.scripting.executeScript({
                  target: { tabId },
                  function: clearAnnotations
              });
              break;
          case "search_annotations":
              chrome.scripting.executeScript({
                  target: { tabId },
                  function: openSearchPopup
              });
              break;
      }
  });
});

function startAnnotating() {
  document.addEventListener('mouseup', handleMouseUp);
  alert("Annotation mode is activated. Select the text you want to highlight.");
}

function clearAnnotations() {
  document.querySelectorAll('.highlight').forEach(el => el.remove());
  const url = window.location.href;
  chrome.storage.local.remove(url, () => {
      alert('All your previously marked annotations are cleared');
  });
}

function openSearchPopup() {
  alert('Press Ctrl+Shift+S to search annotations in the extension popup.');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'export_annotations') {
      generatePDF(request.annotations);
  }
});

function generatePDF(highlights) {
  const doc = new jsPDF();
  let y = 10;
  highlights.forEach((highlight, index) => {
      doc.text(`${index + 1}. ${highlight.text} - ${highlight.note}`, 10, y);
      y += 10;
  });
  doc.save('highlights.pdf');
}
