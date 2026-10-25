document.addEventListener('DOMContentLoaded', () => {
    const email = localStorage.getItem('jiowin_email');
    if(!email || !window.dbFuncs) return;

    const { doc, onSnapshot } = window.dbFuncs;
    onSnapshot(doc(window.db, "users", email), (snap) => {
        if(snap.exists()) {
            let bal = snap.data().balance;
            let bEl = document.getElementById('balanceUI');
            if(bEl) bEl.textContent = bal;
            
            if(typeof balance !== 'undefined' && balance !== bal) {
                balance = bal;
                if(typeof updateUI === 'function') updateUI();
            }
        }
    });
});
