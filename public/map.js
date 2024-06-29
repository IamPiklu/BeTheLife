// Initialize the map
var map = L.map('map').setView([22.5707, 88.4174], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to fetch and add markers for each collection
function addMarkers(url, iconUrl) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                if (item.coordinates && item.coordinates.latitude && item.coordinates.longitude) {
                    L.marker([item.coordinates.latitude, item.coordinates.longitude], {
                        icon: L.icon({
                            iconUrl: iconUrl,
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                            shadowSize: [41, 41]
                        })
                    }).addTo(map)
                    .bindPopup(`
                        <b>${item.name}</b><br>
                        Address: ${item.address}<br>
                        Contact: ${item.contact ? item.contact : item.phone}<br>
                        ${item.website ? 'Website: <a href="' + item.website + '" target="_blank">' + item.website + '</a>' : ''}
                    `);
                } else {
                    console.warn(`Missing coordinates for: ${item.name}`);
                }
            });

            if (url.includes('bloodbanks')) displayList(data, 'bloodbank-list');
            else if (url.includes('ngos')) displayList(data, 'ngo-list');
            else if (url.includes('hospitals')) displayList(data, 'hospital-list');
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Function to display list of items
function displayList(items, listId) {
    const list = document.getElementById(listId);
    list.innerHTML = ''; // Clear any existing items
    items.forEach(item => {
        const li = document.createElement('li');
        li.className = "mb-2";
        li.innerHTML = `
            <div class="p-2 bg-gray-700 rounded">
                <h3 class="text-lg font-bold">${item.name}</h3>
                <p>Address: ${item.address}</p>
                <p>Contact: ${item.contact ? item.contact : item.phone}</p>
                ${item.website ? `<p>Website: <a href="${item.website}" target="_blank" class="text-blue-400 hover:text-blue-300">${item.website}</a></p>` : ''}
            </div>
        `;
        list.appendChild(li);
    });
}

// Fetch and add markers for Blood Banks
addMarkers('/api/bloodbanks', 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png');

// Fetch and add markers for NGOs
addMarkers('/api/ngos', 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png');

// Fetch and add markers for Hospitals
addMarkers('/api/hospitals', 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png');

// Fetch and display donars
fetch('/api/donars')
    .then(response => response.json())
    .then(data => {
        const donarList = document.getElementById('donar-list');
        donarList.innerHTML = ''; // Clear existing items
        data.forEach(donar => {
            const li = document.createElement('li');
            li.className = "mb-2";
            li.innerHTML = `
                <div class="p-2 bg-gray-700 rounded">
                    <h3 class="text-lg font-bold">${donar.name}</h3>
                    <p>Contact: ${donar.contact_number}</p>
                    <p>Address: ${donar.address}</p>
                    <p>Blood Type: ${donar.blood_type}</p>
                    <p>Donation Type: ${donar.donation_type}</p>
                </div>
            `;
            donarList.appendChild(li);
        });
    })
    .catch(error => console.error('Error fetching donars:', error));

// Tab navigation
document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(button.dataset.target).classList.add('active');
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('bg-gray-700');
            tab.classList.add('bg-gray-800');
        });
        button.classList.add('bg-gray-700');
    });
});