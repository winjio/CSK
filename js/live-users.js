const fakeUsers = [
  { name: 'Rahul', avatar: 'https://i.pravatar.cc/100?img=1' }, { name: 'Priya', avatar: 'https://i.pravatar.cc/100?img=5' },
  { name: 'Amit', avatar: 'https://i.pravatar.cc/100?img=11' }, { name: 'Sneha', avatar: 'https://i.pravatar.cc/100?img=9' },
  { name: 'Vikram', avatar: 'https://i.pravatar.cc/100?img=12' }, { name: 'Anjali', avatar: 'https://i.pravatar.cc/100?img=10' }
];

document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.querySelector('.main-area') || document.querySelector('.app');
  if(!gameContainer) return;

  const usersPanel = document.createElement('div'); 
  usersPanel.className = 'live-users-container';
  let avatarsHTML = '<div class="live-avatars">';
  for(let i=0; i<3; i++) avatarsHTML += `<img src="${fakeUsers[i].avatar}">`;
  avatarsHTML += '</div>';
  usersPanel.innerHTML = `${avatarsHTML}<div class="live-count">${Math.floor(Math.random() * 40) + 60} Online</div>`;
  gameContainer.appendChild(usersPanel);

  setInterval(() => {
    const user = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
    const amounts = [10, 50, 100, 500];
    const betAmt = amounts[Math.floor(Math.random() * amounts.length)];
    const betZones = document.querySelectorAll('.zone, .num-zone, .exact-zone, .bet-zone, .cell, .single-zone, .color-zone');
    
    if(betZones.length > 0) {
      const randomZone = betZones[Math.floor(Math.random() * betZones.length)];
      const chip = document.createElement('div'); chip.className = `fake-chip c${betAmt}`; chip.textContent = betAmt;
      randomZone.style.position = 'relative'; randomZone.appendChild(chip);
      
      const toast = document.createElement('div'); toast.className = 'live-feed-toast';
      toast.innerHTML = `<img src="${user.avatar}"> <span><b>${user.name}</b> bet ₹${betAmt}</span>`;
      document.body.appendChild(toast); setTimeout(() => toast.remove(), 3000);
    }
  }, Math.random() * 2000 + 1500);

  setInterval(() => { document.querySelectorAll('.fake-chip').forEach(c => c.remove()); }, 20000);
});
