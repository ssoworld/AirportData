// ... (your original code remains unchanged up to `loadData()`)

async function loadData() {
  const airportsRes = await fetch('../data/airports.csv');
  const airportsText = await airportsRes.text();
  airportsData = airportsText.trim().split('\n').slice(1).map(line => {
    const [country, iata, name, lat, lon] = line.split(';');
    return {
      country,
      iata,
      name,
      lat: parseFloat(lat),
      lon: parseFloat(lon)
    };
  });

  const manifestRes = await fetch('../data/manifest.json');
  manifest = await manifestRes.json();

  // 🔽 New: decide view mode
  const params = new URLSearchParams(window.location.search);
  const selectedUser = params.get('user');

  if (selectedUser) {
    populateUserDropdown();
    document.getElementById('userHomeLink').style.display = '';
    document.getElementById('travelerSummaryContainer').style.display = 'none';
  } else {
    showTravelerSummary();
    document.getElementById('userHomeLink').style.display = 'none';
    document.getElementById('map').style.display = 'none';
    document.getElementById('airportTable').style.display = 'none';
    document.getElementById('userSelect').style.display = 'none';
    document.getElementById('showAllCheckbox').style.display = 'none';
  }
}

// 🔽 New: summary builder
async function showTravelerSummary() {
  const tbody = document.querySelector('#travelerSummaryTable tbody');
  tbody.innerHTML = '';

  for (const user of manifest) {
    const res = await fetch(`../data/${user}.alist`);
    const text = await res.text();
    const visits = parseALIST(text);

    const counts = { A: 0, D: 0, L: 0 };
    for (const v of Object.values(visits)) {
      if (v.A) counts.A++;
      if (v.D) counts.D++;
      if (v.L) counts.L++;
    }
    const total = Object.keys(visits).length;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><a href="?user=${user}">${user}</a></td>
      <td>${total}</td>
      <td>${counts.A}</td>
      <td>${counts.D}</td>
      <td>${counts.L}</td>
    `;
    tbody.appendChild(row);
  }

  document.getElementById('travelerSummaryContainer').style.display = '';
  addSummarySorting();
}

// 🔽 New: sorting for summary table
function addSummarySorting() {
  const headers = document.querySelectorAll('#travelerSummaryTable th');
  headers.forEach((th, colIndex) => {
    th.addEventListener('click', () => {
      const tbody = th.closest('table').querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const numeric = colIndex > 0;
      const asc = !th.classList.contains('asc');

      rows.sort((a, b) => {
        const aText = a.children[colIndex].textContent.trim();
        const bText = b.children[colIndex].textContent.trim();
        const aVal = numeric ? parseInt(aText, 10) : aText.toLowerCase();
        const bVal = numeric ? parseInt(bText, 10) : bText.toLowerCase();
        return asc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });

      th.classList.toggle('asc', asc);
      th.classList.toggle('desc', !asc);
      tbody.innerHTML = '';
      rows.forEach(row => tbody.appendChild(row));
    });
  });
}
