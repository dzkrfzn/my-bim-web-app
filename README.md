# my-bim-web-app

## Tujuan Proyek

Proyek ini bertujuan untuk membangun website dengan kemampuan kompleks yang mencakup:

- **3D Visualization Engine**
- **Integrasi Geospatial/GIS**
- **Visual Programming Interface**
- **AI Integration**

---

## Roadmap Pengembangan

1. **Tahap 1**: Persiapan lingkungan dan struktur dasar.
2. **Tahap 2**: Implementasi modul inti (core).
3. **Tahap 3**: Integrasi 3D Visualization Engine.
4. **Tahap 4**: Pengembangan antarmuka GIS.
5. **Tahap 5**: Penambahan Visual Programming Interface.
6. **Tahap 6**: Integrasi AI dan optimasi performa.

---

## Tahap 3 - 3D IFC on Visualization Engine

Modul ini bertugas membaca file `.ifc` dan mengubahnya menjadi struktur data yang dapat dirender oleh engine WebGL.

### Fitur Utama:

- Membaca dan mem-parsing file `.ifc` (Industry Foundation Classes) secara manual.
- Mengonversi entitas geometri dasar seperti `IFCCARTESIANPOINT` dan `IFCPOLYLOOP` ke format yang dapat dirender.
- Menyimpan dan menampilkan metadata elemen BIM (seperti tipe dan nama elemen).
- Memuat dan merender geometri sederhana dari file IFC langsung di canvas WebGL.
- Menampilkan informasi elemen BIM di console browser.

### Teknologi & Pendekatan yang Digunakan:

- JavaScript Murni + WebGL API
- Parsing file IFC tanpa library seperti `ifcopenshell`
- Modularisasi kode:
  - `/src/data/ifc/` terdiri dari:
    - `ifc-parser.js` – Mem-parsing file IFC
    - `ifc-geometry.js` – Ekstraksi geometri
    - `ifc-entity.js` – Ekstraksi metadata elemen
- Validasi parsing dan rendering berbasis file input
- Debugging visual dan logika parsing
- Arsitektur modular untuk pengembangan lanjutan

### Catatan:

- ***

## Authors

- dzkrfzn
