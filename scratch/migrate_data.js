const fs = require('fs');

async function main() {
  const GAS_URL = "https://script.google.com/macros/s/AKfycby4kKjyCk59Dgaw9HeWc15mAN3Isy_Aksq68Z8G_FmdqLnaRcF2SGz4CZ7h431nV1mNTw/exec";
  
  async function fetchGas(action) {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action }),
      headers: { 'Content-Type': 'text/plain' },
      redirect: 'follow'
    });
    return await res.json();
  }

  console.log("Fetching observations...");
  const obs = await fetchGas('getAllObservations');
  console.log("Observations:", obs.length);

  console.log("Fetching guest comments...");
  const comments = await fetchGas('getAllGuestComments');
  console.log("Guest comments:", comments.length);

  console.log("Fetching schedules...");
  const scheds = await fetchGas('getAllSchedules');
  console.log("Schedules:", Object.keys(scheds).length);

  fs.writeFileSync('scratch/gas_data.json', JSON.stringify({
    observations: obs,
    guestComments: comments,
    schedules: scheds
  }, null, 2));

  console.log("Data saved to scratch/gas_data.json");
}

main().catch(console.error);
