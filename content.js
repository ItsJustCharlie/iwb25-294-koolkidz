(function () {
  console.log('Injector content.js started');
  if (document.getElementById('muffin-extension-popup')) {
    console.log('Popup already exists, exiting');
    return;
  }

  console.log('Creating app container');
  const appContainer = document.createElement('div');
  appContainer.id = 'muffin-extension-popup';
  appContainer.className = 'app-container';
  appContainer.style.position = 'fixed';
  appContainer.style.top = '10px';
  appContainer.style.right = '20px';
  appContainer.style.zIndex = '10000';

  document.body.appendChild(appContainer);
  console.log('App container added to body');

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('style.css');
  document.head.appendChild(link);
  console.log('Style sheet loaded');

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('react-bundle.js');
  script.type = 'module';
  document.head.appendChild(script);
  console.log('React bundle script loaded');

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style = 'position: absolute; top: 5px; right: 5px;';
  closeButton.addEventListener('click', () => {
    appContainer.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(appContainer);
      document.head.removeChild(link);
      document.head.removeChild(script);
    }, 300);
  });
  appContainer.appendChild(closeButton);
  console.log('Close button added');
})();