const events = window['psyna']?.events ?? null;

if (events) {    
    events.addEventListener('engine_status', event => {
        const status = event?.detail ?? 'loading';
        const ele = document.getElementById('status');
        if (ele) ele.innerHTML = status;
    });
}