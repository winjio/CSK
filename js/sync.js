// 🔥 UNIVERSAL GAME SYNC (Har game me balance auto-update karega)
const socket = io('https://jio-site.onrender.com');
const email = localStorage.getItem('jiowin_email');

if(email && window.dbFuncs) {
    const { doc, onSnapshot, getDoc } = window.dbFuncs;

    // 1. Firebase se live balance sunna
    onSnapshot(doc(window.db, "users", email), (snap) => {
        if(snap.exists()) {
            let newBal = snap.data().balance;
            
            // Game ke balance variable ko update karo
            if(typeof balance !== 'undefined') {
                balance = newBal; 
            }
            
            // Game ke UI (screen) ko update karo
            if(typeof updateUI === 'function') {
                updateUI();
            } else {
                // Agar game me updateUI function nahi hai, toh direct screen par dikhao
                let el1 = document.getElementById('balanceUI');
                let el2 = document.getElementById('balanceUI2');
                if(el1) el1.textContent = newBal;
                if(el2) el2.textContent = newBal;
            }
        }
    });

    // 2. Telegram Approval sunna
    socket.on('connect', () => { socket.emit('register_user', email); });
    socket.on('transaction_approved', (txId) => {
        alert(`✅ Deposit Approved! Balance will update automatically.`);
        getDoc(doc(window.db, "users", email)).then(snap => {
            if(snap.exists()){
                if(typeof balance !== 'undefined') balance = snap.data().balance;
                if(typeof updateUI === 'function') updateUI();
            }
        });
    });
}
