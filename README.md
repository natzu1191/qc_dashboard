# QC Dashboard - Full Stack Application

A modern, full-stack Quality Control Dashboard with statistical visualizations and real-time data.

![QC Dashboard](https://img.shields.io/badge/Status-Ready-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18.2-blue)

## 🚀 Features

- **Interactive Dashboard** - Real-time QC statistics and metrics
- **Beautiful Visualizations** - Bar charts, pie charts, and gauges
- **Dark Theme** - Modern, professional dark mode interface
- **Responsive Design** - Works on desktop, tablet, and mobile
- **REST API** - FastAPI backend with type validation
- **Fast Development** - Vite for lightning-fast HMR

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📊 API Endpoints

- `GET /api/dashboard` - Returns all dashboard data
- `GET /` - Health check endpoint
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

## 🎨 Design Features

- **Custom Typography** - Rajdhani for headers, JetBrains Mono for body
- **Gradient Accents** - Purple, yellow, and teal color scheme
- **Smooth Animations** - Fade-in, slide-in, and glow effects
- **Interactive Elements** - Hover states and transitions
- **Glassmorphism** - Modern translucent card designs

## 📁 Project Structure

```
qc-dashboard/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── README.md           # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Component styles
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite configuration
│   ├── package.json        # Node dependencies
│   └── README.md           # Frontend documentation
└── README.md               # This file
```

## 🔧 Configuration

### Backend Configuration

The backend runs on port 8000 by default. To change this, modify the `uvicorn.run()` call in `backend/main.py`:

```python
uvicorn.run(app, host="0.0.0.0", port=YOUR_PORT)
```

### Frontend Configuration

The frontend uses Vite's proxy to connect to the backend. To change the backend URL, modify `frontend/vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:YOUR_PORT',
    changeOrigin: true,
  }
}
```

## 📦 Production Build

### Backend

The backend is production-ready as-is. For deployment, consider using:
- Gunicorn with Uvicorn workers
- Docker containerization
- Environment variables for configuration

### Frontend

Build the frontend for production:

```bash
cd frontend
npm run build
```

The optimized build will be in the `dist` folder. You can preview it with:

```bash
npm run preview
```

## 🎯 Dashboard Widgets

1. **Quality Issues** - Bar chart showing monthly quality issue counts
2. **Resample Percentage** - Gauge charts for monthly resample rates
3. **Pending Resamples** - Pie chart with categorized pending items
4. **Customer Complaints** - Badge display of monthly complaint counts
5. **QS Ratings** - Horizontal bar chart of quality scores

## 🌟 Technologies Used

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation using Python type hints
- **Uvicorn** - Lightning-fast ASGI server

### Frontend
- **Vite** - Next generation frontend tooling
- **React** - Component-based UI library
- **Recharts** - Composable charting library
- **CSS3** - Modern styling with variables and animations

## 📝 Customization

### Changing Colors

Edit the CSS variables in `frontend/src/index.css`:

```css
:root {
  --bg-primary: #0a0e1a;
  --accent-yellow: #f4c430;
  --accent-purple: #8b5cf6;
  /* ... */
}
```

### Adding Data

Modify the placeholder data in `backend/main.py` in the `get_dashboard_data()` function.

### Adding New Widgets

1. Add new data models in `backend/main.py`
2. Update the API response
3. Create new components in `frontend/src/App.jsx`
4. Add corresponding styles in `frontend/src/App.css`

## 🐛 Troubleshooting

**Backend won't start:**
- Make sure port 8000 is not in use
- Check that all dependencies are installed
- Verify Python version is 3.8+

**Frontend can't connect to backend:**
- Ensure the backend is running on port 8000
- Check browser console for CORS errors
- Verify proxy settings in `vite.config.js`

**Charts not rendering:**
- Check that data is loading correctly
- Verify Recharts is installed
- Look for console errors in browser dev tools

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📧 Support

For issues or questions, please check the README files in the backend and frontend directories for more detailed documentation.

---

Built with ❤️ using Python, React, and Vite
