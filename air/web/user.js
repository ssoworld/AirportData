console.log("At user.js start, global L:", window.L);

const mapInstance = window.L.map('map').setView([20, 0], 5);

window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(mapInstance);

let airportsData = [];
let manifest = [];
let markers = [];

const countryMap = {
  AFG: "Afghanistan", ALB: "Albania", DZA: "Algeria", AND: "Andorra",
  AGO: "Angola", AIA: "Anguilla", ATA: "Antarctica", ARG: "Argentina",
  ARM: "Armenia", ABW: "Aruba", AUS: "Australia", AUT: "Austria",
  AZE: "Azerbaijan", BHS: "Bahamas", BHR: "Bahrain", BGD: "Bangladesh",
  BRB: "Barbados", BLR: "Belarus", BEL: "Belgium", BLZ: "Belize",
  BEN: "Benin", BMU: "Bermuda", BTN: "Bhutan", BOL: "Bolivia",
  BIH: "Bosnia & Herzegovina", BWA: "Botswana", BRA: "Brazil",
  BRN: "Brunei", BGR: "Bulgaria", BFA: "Burkina Faso", BDI: "Burundi",
  KHM: "Cambodia", CMR: "Cameroon", CAN: "Canada", CPV: "Cape Verde",
  CAF: "Central African Republic", TCD: "Chad", CHL: "Chile", CHN: "China",
  COL: "Colombia", COM: "Comoros", COD: "DR Congo", COG: "Congo",
  CRI: "Costa Rica", CIV: "Ivory Coast", HRV: "Croatia", CUB: "Cuba",
  CYP: "Cyprus", CZE: "Czech Republic", DNK: "Denmark", DJI: "Djibouti",
  DMA: "Dominica", DOM: "Dominican Republic", ECU: "Ecuador", EGY: "Egypt",
  SLV: "El Salvador", GNQ: "Equatorial Guinea", ERI: "Eritrea",
  EST: "Estonia", SWZ: "eSwatini", ETH: "Ethiopia", FIN: "Finland",
  FRA: "France", GAB: "Gabon", GMB: "Gambia", GEO: "Georgia",
  DEU: "Germany", GHA: "Ghana", GRC: "Greece", GRD: "Grenada",
  GTM: "Guatemala", GIN: "Guinea", GNB: "Guinea‑Bissau", GUY: "Guyana",
  HTI: "Haiti", HND: "Honduras", HUN: "Hungary", ISL: "Iceland",
  IND: "India", IDN: "Indonesia", IRN: "Iran", IRQ: "Iraq", IRL: "Ireland",
  ISR: "Israel", ITA: "Italy", JAM: "Jamaica", JPN: "Japan", JOR: "Jordan",
  KAZ: "Kazakhstan", KEN: "Kenya", KIR: "Kiribati", KWT: "Kuwait",
  KGZ: "Kyrgyzstan", LAO: "Laos", LVA: "Latvia", LBN: "Lebanon",
  LSO: "Lesotho", LBR: "Liberia", LBY: "Libya", LIE: "Liechtenstein",
  LTU: "Lithuania", LUX: "Luxembourg", MDG: "Madagascar", MWI: "Malawi",
  MYS: "Malaysia", MDV: "Maldives", MLI: "Mali", MLT: "Malta",
  MRT: "Mauritania", MUS: "Mauritius", MEX: "Mexico", MDA: "Moldova",
  MCO: "Monaco", MNG: "Mongolia", MNE: "Montenegro", MAR: "Morocco",
  MOZ: "Mozambique", MMR: "Myanmar", NAM: "Namibia", NPL: "Nepal",
  NLD: "Netherlands", NZL: "New Zealand", NIC: "Nicaragua", NER: "Niger",
  NGA: "Nigeria", PRK: "North Korea", MKD: "North Macedonia", NOR: "Norway",
  OMN: "Oman", PAK: "Pakistan", PAN: "Panama", PNG: "Papua New Guinea",
  PRY: "Paraguay", PER: "Peru", PHL: "Philippines", POL: "Poland",
  PRT: "Portugal", QAT: "Qatar", ROU: "Romania", RUS: "Russia",
  RWA: "Rwanda", KNA: "Saint Kitts & Nevis", LCA: "Saint Lucia",
  VCT: "Saint Vincent & Grenadines", WSM: "Samoa", SMR: "San Marino",
  STP: "São Tomé & Príncipe", SAU: "Saudi Arabia", SEN: "Senegal",
  SRB: "Serbia", SYC: "Seychelles", SLE: "Sierra Leone", SGP: "Singapore",
  SVK: "Slovakia", SVN: "Slovenia", SLB: "Solomon Islands",
  SOM: "Somalia", ZAF: "South Africa", KOR: "South Korea",
  SSD: "South Sudan", ESP: "Spain", LKA: "Sri Lanka", SDN: "Sudan",
  SUR: "Suriname", SWE: "Sweden", CHE: "Switzerland", SYR: "Syria",
  TJK: "Tajikistan", TZA: "Tanzania", THA: "Thailand", TLS: "Timor-Leste",
  TGO: "Togo", TON: "Tonga", TTO: "Trinidad & Tobago", TUN: "Tunisia",
  TUR: "Turkey", TKM: "Turkmenistan", TUV: "Tuvalu", UGA: "Uganda",
  UKR: "Ukraine", ARE: "United Arab Emirates", GBR: "United Kingdom",
  USA: "United States", URY: "Uruguay", UZB: "Uzbekistan", VUT: "Vanuatu",
  VAT: "Vatican City", VEN: "Venezuela", VNM: "Vietnam", ZMB: "Zambia",
  ZWE: "Zimbabwe"
};

function createSVGIcon(hasA, hasD, hasL) {
  const svgParts = [];
  svgParts.push(`<circle cx="12" cy="12" r="10" stroke="black" fill="${hasL ? 'blue' : 'white'}" />`);
  svgParts.push(`<polygon points="12,5 5,12 19,12" fill="${hasD ? 'green' : 'white'}" stroke="black" />`);
  svgParts.push(`<polygon points="12,19 5,12 19,12" fill="${hasA ? 'red' : 'white'}" stroke="black" />`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">${svgParts.join('')}</svg>`;
  return window.L.divIcon({
    html: svg,
    className: 'svg-icon',
    iconSize: [24, 24],
  });
}

function parseALIST(text) {
  const visits = {};
  text.split('\n').forEach(line => {
    line = line.trim();
    if (line.startsWith('#') || line === '') return;
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const code = parts[0].toUpperCase();
      const types = parts.slice(1).join('');
      visits[code] = {
        A: types.includes('A'),
        D: types.includes('D'),
        L: types.includes('L'),
      };
    }
  });
  return visits;
}

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

  const params = new URLSearchParams(window.location.search);
  const selectedUser = params.get('user');

  if (selectedUser) {
    populateUserDropdown();
    document.getElementById('userHomeLink').style.display = '';
    document.getElementById('travelerSummaryContainer').style.display = 'none';
    document.getElementById('map').style.display = '';
    document.getElementById('airportTable').style.display = '';
    document.getElementById('userSelect').style.display = '';
    document.getElementById('showAllCheckbox').style.display = '';
  } else {
    showTravelerSummary();
    document.getElementById('userHomeLink').style.display = 'none';
    document.getElementById('map').style.display = 'none';
    document.getElementById('airportTable').style.display = 'none';
    document.getElementById('userSelect').style.display = 'none';
    document.getElementById('showAllCheckbox').style.display = 'none';
  }
}

function populateUserDropdown() {
  const select = document.getElementById('userSelect');
  select.innerHTML = '';
  manifest.forEach(user => {
    const option = document.createElement('option');
    option.value = user;
    option.textContent = user;
    select.appendChild(option);
  });
  select.addEventListener('change', () => loadUser(select.value));

  const params = new URLSearchParams(window.location.search);
  const selectedUser = params.get('user');
  if (selectedUser) select.value = selectedUser;

  loadUser(select.value);
}

async function loadUser(user) {
  if (!user) return;

  // Clear existing markers
  markers.forEach(m => mapInstance.removeLayer(m));
  markers = [];

  const res = await fetch(`../data/${user}.alist`);
  const text = await res.text();
  const visits = parseALIST(text);

  const showAll = document.getElementById('showAllCheckbox').checked;
  const filteredAirports = airportsData.filter(ap => showAll || visits[ap.iata]);

  // Update table body
  const tbody = document.querySelector('#airportTable tbody');
  tbody.innerHTML = '';

  filteredAirports.forEach(ap => {
    const visit = visits[ap.iata] || { A: false, D: false, L: false };

    // Add marker to map
    const icon = createSVGIcon(visit.A, visit.D, visit.L);
    const marker = window.L.marker([ap.lat, ap.lon], { icon });
    marker.bindPopup(`<strong>${ap.name}</strong><br>${countryMap[ap.country] || ap.country}<br>IATA: ${ap.iata}<br>Arrival: ${visit.A ? '✔️' : ''} Departure: ${visit.D ? '✔️' : ''} Layover: ${visit.L ? '✔️' : ''}`);
    marker.addTo(mapInstance);
    markers.push(marker);

    // Add row to table
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${countryMap[ap.country] || ap.country}</td>
      <td>${ap.iata}</td>
      <td>${ap.name}</td>
      <td>${visit.A ? '✔️' : ''}</td>
      <td>${visit.D ? '✔️' : ''}</td>
      <td>${visit.L ? '✔️' : ''}</td>
    `;
    tbody.appendChild(tr);
  });

  // Fit map to markers if any
  if (markers.length) {
    const group = window.L.featureGroup(markers);
    mapInstance.fitBounds(group.getBounds().pad(0.2));
  }

  // Update totals
  const totals = { A: 0, D: 0, L: 0 };
  Object.values(visits).forEach(v => {
    if (v.A) totals.A++;
    if (v.D) totals.D++;
    if (v.L) totals.L++;
  });
  document.getElementById('totalsDisplay').textContent = `Totals - Arrivals: ${totals.A}, Departures: ${totals.D}, Layovers: ${totals.L}`;
}

function showTravelerSummary() {
  // Build summary table for all users
  const tbody = document.querySelector('#travelerSummaryContainer tbody');
  tbody.innerHTML = '';

  manifest.forEach(user => {
    // For summary, we need to fetch user's .alist and count visits.
    // But for performance, let's assume you already have a cached summary in manifest.json
    // If not, you'd fetch and parse each .alist, but that is costly client side.
    // Here we'll just make a simplified placeholder:

    // This example skips fetching each .alist for speed:
    // We'll just show user with placeholders for counts
    // (You can implement server-side to provide summary if you want.)

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="?user=${encodeURIComponent(user)}">${user}</a></td>
      <td>–</td>
      <td>–</td>
      <td>–</td>
    `;
    tbody.appendChild(tr);
  });

  addSummarySorting();
}

function addSummarySorting() {
  const table = document.getElementById('travelerSummaryContainer');
  if (!table) return;
  const headers = table.querySelectorAll('th');
  headers.forEach((header, i) => {
    header.style.cursor = 'pointer';
    header.onclick = () => {
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.rows);
      const asc = !header.classList.contains('asc');
      headers.forEach(h => h.classList.remove('asc', 'desc'));
      header.classList.add(asc ? 'asc' : 'desc');
      rows.sort((a, b) => {
        let aText = a.cells[i].textContent.trim();
        let bText = b.cells[i].textContent.trim();
        const aNum = Number(aText);
        const bNum = Number(bText);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return asc ? aNum - bNum : bNum - aNum;
        }
        return asc ? aText.localeCompare(bText) : bText.localeCompare(aText);
      });
      rows.forEach(row => tbody.appendChild(row));
    };
  });
}

document.getElementById('showAllCheckbox').addEventListener('change', () => {
  const select = document.getElementById('userSelect');
  loadUser(select.value);
});

loadData();
