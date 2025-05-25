# Event Dashboard

A modern, responsive dashboard for managing, filtering, and showcasing events. Built with Node.js, Express, MongoDB, and Bootstrap.

![Event Dashboard Screenshot](./screenshot.png)

## 🚀 Features

- **Create, Edit, Delete Events**
- **Upload and display event images**
- **Filter events by name, location, date, and type**
- **Trending events sidebar**
- **Event detail view**
- **Dark mode toggle**
- **Responsive and modern UI**

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS (with dark mode), JavaScript, Bootstrap 5
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Image Uploads:** Multer

## 📦 Installation

1. **Clone the repository:**
    ```
    git clone https://github.com/ritikanuragi-23/eventdashboard.git
    cd eventdashboard
    ```

2. **Install backend dependencies:**
    ```
    npm install
    ```

3. **Start MongoDB:**  
   Ensure MongoDB is running locally (`mongodb://localhost:27017/eventDB`).

4. **Start the server:**
    ```
    node server.js
    ```

5. **Open `index.html` in your browser.**

## 🖼️ Screenshots

_Add a screenshot named `screenshot.png` in your project root to display above._

## 🌟 Usage

- Click **Add Event** to create a new event (with optional image).
- Use the filter panel to search and filter events.
- Click **Edit** on any event to update its details.
- Click **Delete** to remove an event.
- Click on a trending event to view its details.
- Toggle **Dark Mode** from the header.

## 📁 Project Structure

eventdashboard/
├── server.js
├── script.js
├── index.html
├── styles.css
├── uploads/ # Event images (auto-created)
└── README.md

text

## ✨ Customization

- Change the MongoDB URI in `server.js` if needed.
- Update styles in `styles.css` for branding.

## 📝 License

This project is open source and free to use.

---
