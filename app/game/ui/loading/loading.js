let timer = setInterval(() => {

    const psyna = window['psyna'] ?? false;
    if (!psyna) return;

    if (psyna.runtimeIsReady) {
        clearInterval(timer);
        return;
    }
    
    const status = psyna?.status ?? 'Loading...';
    const element = document.querySelector('#status');
    if (element) element.innerHTML = status;

});