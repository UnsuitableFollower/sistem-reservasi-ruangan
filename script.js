// Kelas untuk Ruangan (Room)
class Room {
    constructor(number, capacity) {
        this.number = number; // Nomor ruangan (misal: 101, 102, dll)
        this.capacity = capacity; // Kapasitas awal ruangan (jumlah orang yang dapat masuk)
        this.reservations = []; // Array untuk menyimpan daftar reservasi ruangan
    }

    // Fungsi untuk memeriksa apakah ruangan tersedia pada waktu tertentu
    isAvailable(startTime, duration, date) {
        const start = new Date(`${date}T${startTime}`); // Waktu mulai reservasi
        const end = new Date(start.getTime() + duration * 60 * 60 * 1000); // Waktu akhir reservasi

        // Memeriksa apakah ada reservasi lain yang tumpang tindih dengan waktu yang diminta
        return this.reservations.every(reservation => {
            const resStart = new Date(`${reservation.date}T${reservation.startTime}`);
            const resEnd = new Date(resStart.getTime() + reservation.duration * 60 * 60 * 1000);
            return end <= resStart || start >= resEnd; // Jika tumpang tindih, return false
        });
    }

    // Fungsi untuk menambahkan reservasi pada ruangan
    addReservation(reservation) {
        this.reservations.push(reservation); // Menambahkan reservasi ke daftar reservasi
        this.capacity--; // Mengurangi kapasitas ruangan setiap kali reservasi berhasil dilakukan
    }

    // Fungsi untuk memeriksa status ruangan berdasarkan kapasitas yang tersisa
    getStatus() {
        return this.capacity > 0 ? "Tersedia" : "Penuh"; // Status berdasarkan kapasitas
    }
}

// Kelas untuk Reservasi (Reservation)
class Reservation {
    constructor(name, roomNumber, date, startTime, duration) {
        this.name = name; // Nama pemesan
        this.roomNumber = roomNumber; // Nomor ruangan yang dipesan
        this.date = date; // Tanggal reservasi
        this.startTime = startTime; // Waktu mulai reservasi
        this.duration = duration; // Durasi reservasi dalam jam
    }
}

// Menyimpan data ruangan ke localStorage
function saveRooms(rooms) {
    localStorage.setItem('rooms', JSON.stringify(rooms)); // Menyimpan objek rooms sebagai JSON di localStorage
}

// Memuat data ruangan dari localStorage
function loadRooms() {
    const roomsData = localStorage.getItem('rooms'); // Mengambil data ruangan dari localStorage
    if (roomsData) {
        const parsedRooms = JSON.parse(roomsData); // Mengubah data JSON menjadi objek JavaScript
        // Mengembalikan ruangan dan reservasi yang di-load dari localStorage
        return parsedRooms.map(room => {
            const r = new Room(room.number, room.capacity);
            r.reservations = room.reservations.map(reservation => new Reservation(
                reservation.name, reservation.roomNumber, reservation.date, reservation.startTime, reservation.duration
            ));
            return r;
        });
    }
    return null; // Jika tidak ada data di localStorage, kembalikan null
}

// Inisialisasi daftar ruangan (memuat data dari localStorage jika ada)
const rooms = loadRooms() || [
    new Room(101, 30),
    new Room(102, 25),
    new Room(103, 0),
    new Room(104, 10),
    new Room(105, 0),
    new Room(106, 19),
];

// Fungsi untuk menambahkan reservasi
function addReservation(event) {
    event.preventDefault(); // Mencegah halaman reload saat form disubmit

    // Mengambil nilai dari formulir
    const name = document.getElementById('name').value;
    const roomNumber = parseInt(document.getElementById('room-number').value);
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('start-time').value;
    const duration = parseInt(document.getElementById('duration').value);

    const room = rooms.find(r => r.number === roomNumber); // Menemukan ruangan yang dipilih

    // Validasi apakah ruangan tersedia dan kapasitas cukup
    if (room && room.capacity > 0 && room.isAvailable(startTime, duration, date)) {
        const reservation = new Reservation(name, roomNumber, date, startTime, duration);
        room.addReservation(reservation); // Menambahkan reservasi ke ruangan
        saveRooms(rooms); // Menyimpan data ruangan yang terbaru ke localStorage
        updateReservationList(); // Memperbarui tampilan daftar reservasi
        updateRoomList(); // Memperbarui tampilan daftar ruangan
        alert("Reservasi berhasil!"); // Menampilkan pesan sukses
    } else {
        alert("Ruangan sudah dipesan atau kapasitas penuh."); // Menampilkan pesan error jika ruangan tidak tersedia
    }
}

// Event listener untuk submit form reservasi
document.getElementById('reserve-room-form').addEventListener('submit', addReservation);

// Memperbarui daftar ruangan
function updateRoomList() {
    const roomTable = document.getElementById('room-table').querySelector('tbody');
    roomTable.innerHTML = ''; // Bersihkan isi tabel sebelum memperbarui

    // Loop untuk memeriksa setiap ruangan dan menampilkan statusnya
    rooms.forEach(room => {
        const row = document.createElement('tr');

        // Mengambil status berdasarkan kapasitas ruangan
        const status = room.getStatus();

        // Menampilkan nomor ruangan, kapasitas, dan status
        row.innerHTML = `
            <td>${room.number}</td>
            <td>${room.capacity}</td>
            <td>${status}</td>
        `;
        
        roomTable.appendChild(row); // Menambahkan row ke tabel
    });
}

// Memperbarui daftar reservasi
function updateReservationList() {
    const reservationsList = document.getElementById('reservations');
    reservationsList.innerHTML = ''; // Bersihkan daftar reservasi

    // Menampilkan setiap reservasi yang ada
    rooms.forEach(room => {
        room.reservations.forEach(reservation => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            li.textContent = `${reservation.name} - Ruangan ${reservation.roomNumber} pada ${reservation.date} ${reservation.startTime} selama ${reservation.duration} jam`;

            // Menambahkan tombol batal untuk setiap reservasi
            const cancelButton = document.createElement('button');
            cancelButton.classList.add('btn', 'btn-danger', 'btn-sm');
            cancelButton.textContent = "Batal";
            cancelButton.onclick = () => cancelReservation(room, reservation);
            li.appendChild(cancelButton);

            reservationsList.appendChild(li); // Menambahkan reservasi ke daftar
        });
    });
}

// Membatalkan reservasi
function cancelReservation(room, reservation) {
    room.reservations = room.reservations.filter(r => r !== reservation); // Menghapus reservasi
    room.capacity++; // Menambah kapasitas ruangan setelah reservasi dibatalkan
    saveRooms(rooms); // Menyimpan data ruangan yang terbaru ke localStorage
    updateReservationList(); // Memperbarui daftar reservasi
    updateRoomList(); // Memperbarui daftar ruangan
}

// Memuat data dan memperbarui tampilan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateRoomList(); // Memperbarui daftar ruangan
    updateReservationList(); // Memperbarui daftar reservasi
});
