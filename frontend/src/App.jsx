import React, { useState, useEffect, useRef } from 'react';

// API Configuration
const API_BASE = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiOffline, setApiOffline] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  
  // Database States (Synced with API or simulated locally)
  const [temples, setTemples] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reports, setReports] = useState([]);
  const [profile, setProfile] = useState({ name: 'Sachin Jha', points: 350, history: [] });
  const [vendors, setVendors] = useState([]);
  
  // Chat States
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'agent',
      text: "Namaste! I am Dharma AI, your virtual guide for DivyaPath. I can check temple wait times, book Darshan tickets, log green eco-actions, and find local community services. How can I assist your spiritual journey today?",
      isSimulated: false
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    templeId: 'kedarnath',
    timeSlot: '08:00 AM - 09:00 AM',
    pilgrimName: 'Sachin Jha'
  });

  // Waste Reporting Form State
  const [selectedMockPhoto, setSelectedMockPhoto] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [wasteLocation, setWasteLocation] = useState('');
  const [wasteDescription, setWasteDescription] = useState('');
  
  const chatEndRef = useRef(null);

  // Initial setup: Check API status and load data
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoadingChat]);

  const checkBackendConnection = async () => {
    try {
      // 1. Check API status
      const statusRes = await fetch(`${API_BASE}/api/status`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setApiKeyConfigured(statusData.has_api_key);
        setApiOffline(false);
        
        // 2. Fetch data from backend
        fetchBackendData();
      } else {
        throw new Error("Status endpoint error");
      }
    } catch (err) {
      console.warn("Backend API offline. Running in simulated offline mode.");
      setApiOffline(true);
      setApiKeyConfigured(false);
      loadSimulatedData();
    }
  };

  const fetchBackendData = async () => {
    try {
      const [templeRes, ticketRes, reportRes, profileRes, vendorRes] = await Promise.all([
        fetch(`${API_BASE}/api/temples`),
        fetch(`${API_BASE}/api/tickets`),
        fetch(`${API_BASE}/api/reports`),
        fetch(`${API_BASE}/api/profile`),
        fetch(`${API_BASE}/api/vendors`)
      ]);

      const templesData = await templeRes.json();
      const ticketsData = await ticketRes.json();
      const reportsData = await reportRes.json();
      const profileData = await profileRes.json();
      const vendorsData = await vendorRes.json();

      setTemples(templesData);
      setTickets(ticketsData);
      setReports(reportsData);
      setProfile(profileData);
      setVendors(vendorsData);
    } catch (err) {
      console.error("Error fetching backend data", err);
      setApiOffline(true);
      loadSimulatedData();
    }
  };

  // Fallback data loading for browser-only mode
  const loadSimulatedData = () => {
    // These mock objects mirror backend/database.py DEFAULT_DB
    setTemples([
      { id: 'kedarnath', name: 'Kedarnath Temple', crowd_status: 'Busy', wait_time_mins: 180, active_pilgrims: 4500, max_capacity: 6000, next_aarti: '18:30 PM', weather: 'Cold (8°C), Clear Sky', latitude: 30.7352, longitude: 79.0669 },
      { id: 'badrinath', name: 'Badrinath Temple', crowd_status: 'Moderate', wait_time_mins: 60, active_pilgrims: 2100, max_capacity: 5000, next_aarti: '19:00 PM', weather: 'Cool (14°C), Partly Cloudy', latitude: 30.7448, longitude: 79.4912 },
      { id: 'gangotri', name: 'Gangotri Temple', crowd_status: 'Low', wait_time_mins: 15, active_pilgrims: 450, max_capacity: 3000, next_aarti: '18:45 PM', weather: 'Cool (12°C), Sunny', latitude: 30.9947, longitude: 78.9398 },
      { id: 'yamunotri', name: 'Yamunotri Temple', crowd_status: 'Low', wait_time_mins: 20, active_pilgrims: 320, max_capacity: 2500, next_aarti: '18:15 PM', weather: 'Mild (15°C), Wind 10km/h', latitude: 31.0140, longitude: 78.4600 }
    ]);
    
    setReports([
      { id: 'rep_101', location: 'Kedarnath Trek Path - 4km mark', description: 'Large pile of plastic water bottles near the resting shed.', waste_type: 'Plastic Bottles', severity: 'High', status: 'Open', reporter: 'Devansh Singh', timestamp: new Date().toISOString() },
      { id: 'rep_102', location: 'Badrinath Temple Complex - East Gate', description: 'Discarded organic waste bags spilling over.', waste_type: 'Organic Waste', severity: 'Medium', status: 'Open', reporter: 'Sujit Thakur', timestamp: new Date().toISOString() }
    ]);

    setProfile({
      name: 'Sachin Jha',
      points: 350,
      history: [
        { action: 'Returned 5 plastic water bottles to smart bin', points: 50, date: new Date().toISOString() },
        { action: 'Opted for eco-friendly battery vehicle', points: 100, date: new Date().toISOString() },
        { action: 'Completed Uttarakhand green pilgrimage survey', points: 200, date: new Date().toISOString() }
      ]
    });

    setVendors([
      { id: 'vendor_1', name: 'Himalayan Homestays & Cottages', category: 'Homestay', contact: '+91 9876543210', rating: 4.8, description: 'Locally-run eco-friendly stay. Supports local mountain families.' },
      { id: 'vendor_2', name: 'Guide Kedar: Local Trekking Guides Association', category: 'Guide', contact: '+91 9998887776', rating: 4.9, description: 'Certified local guides trained in regional safety.' },
      { id: 'vendor_3', name: 'Chhoti Ganga Organic Eatery', category: 'Eatery', contact: '+91 8887776665', rating: 4.6, description: 'Pure vegetarian satvik food cooked using organic ingredients.' },
      { id: 'vendor_4', name: 'Yamuna Heritage Wooden Handicrafts', category: 'Handicrafts', contact: '+91 7776665554', rating: 4.7, description: 'Support local artisans by purchasing hand-carved wood models.' }
    ]);
  };

  // -------------------------------------------------------------
  // Form Operations & Action Handlers
  // -------------------------------------------------------------

  // Send Chat Message
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessageText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMessageText }]);
    setChatInput('');
    setIsLoadingChat(true);

    if (!apiOffline) {
      try {
        const response = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessageText,
            conversation_id: conversationId
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setConversationId(data.conversation_id);
          setChatMessages(prev => [...prev, { 
            role: 'agent', 
            text: data.response, 
            isSimulated: data.is_simulated 
          }]);
          
          // Re-fetch backend data because the agent might have run a tool (e.g. booked a ticket, filed a report, awarded points)
          fetchBackendData();
        } else {
          throw new Error("Chat api failed");
        }
      } catch (err) {
        console.error("Chat API error:", err);
        // Instant simulated response fallback
        runLocalSimulatedChat(userMessageText);
      }
    } else {
      // Local client-side chat simulation
      setTimeout(() => {
        runLocalSimulatedChat(userMessageText);
      }, 1000);
    }
  };

  const runLocalSimulatedChat = (messageText) => {
    setIsLoadingChat(false);
    const msgLower = messageText.lower || messageText.toLowerCase();
    
    // Simulate tool actions on local states
    if (msgLower.includes('book') || msgLower.includes('ticket') || msgLower.includes('slot')) {
      const selectedTemple = temples.find(t => msgLower.includes(t.id)) || temples[0];
      const timeSlot = "10:00 AM - 11:00 AM";
      const ticketId = `TX_${new Date().getMonth() + 1}${new Date().getDate()}_${tickets.length + 1001}`;
      
      const newTicket = {
        id: ticketId,
        temple_id: selectedTemple.id,
        temple_name: selectedTemple.name,
        time_slot: timeSlot,
        pilgrim_name: profile.name,
        status: 'Active',
        timestamp: new Date().toISOString()
      };
      
      setTickets(prev => [...prev, newTicket]);
      setChatMessages(prev => [...prev, {
        role: 'agent',
        text: `[Client Simulation] Calling book_darshan_pass(temple_name='${selectedTemple.name}', time_slot='${timeSlot}', pilgrim_name='${profile.name}')...\n\nSuccessfully booked Darshan slot!\n- Ticket ID: ${ticketId}\n- Temple: ${selectedTemple.name}\n- Time Slot: ${timeSlot}\n- Pilgrim: ${profile.name}\n- Status: Active. Open the Booking tab to view your pass!`,
        isSimulated: true
      }]);
      return;
    }

    if (msgLower.includes('crowd') || msgLower.includes('status') || msgLower.includes('wait') || msgLower.includes('weather')) {
      const selectedTemple = temples.find(t => msgLower.includes(t.id)) || temples[0];
      setChatMessages(prev => [...prev, {
        role: 'agent',
        text: `[Client Simulation] Calling check_temple_status(temple_name='${selectedTemple.name}')...\n\nReal-time status for ${selectedTemple.name}:\n- Crowd Level: ${selectedTemple.crowd_status}\n- Wait Time: ${selectedTemple.wait_time_mins} minutes\n- Current Pilgrims: ${selectedTemple.active_pilgrims}/${selectedTemple.max_capacity}\n- Next Aarti: ${selectedTemple.next_aarti}\n- Weather: ${selectedTemple.weather}`,
        isSimulated: true
      }]);
      return;
    }

    if (msgLower.includes('points') || msgLower.includes('punya') || msgLower.includes('recycle') || msgLower.includes('reward')) {
      const pointsToAdd = msgLower.includes('bottle') ? 50 : 100;
      const actionText = msgLower.includes('bottle') ? 'Returned water bottle in recycling bin' : 'Walked to holy temple instead of riding mule';
      
      const updatedProfile = {
        ...profile,
        points: profile.points + pointsToAdd,
        history: [{ action: actionText, points: pointsToAdd, date: new Date().toISOString() }, ...profile.history]
      };
      setProfile(updatedProfile);
      
      setChatMessages(prev => [...prev, {
        role: 'agent',
        text: `[Client Simulation] Calling claim_eco_points(action='${actionText}', points=${pointsToAdd})...\n\nExcellent job! Your action has been recorded in the Punya Points ledger.\n- Action logged: '${actionText}'\n- Points awarded: +${pointsToAdd}\n- New Balance: ${updatedProfile.points} Punya Points`,
        isSimulated: true
      }]);
      return;
    }

    if (msgLower.includes('clean') || msgLower.includes('waste') || msgLower.includes('litter') || msgLower.includes('report')) {
      const newReportId = `REP_${reports.length + 101}`;
      const newReport = {
        id: newReportId,
        location: 'Kedarnath Trek Trail (Reported via Chat)',
        description: 'Trash pile identified on trekking path.',
        waste_type: 'Plastic Bottles',
        severity: 'Medium',
        status: 'Open',
        reporter: 'Pilgrim (via Chat)',
        timestamp: new Date().toISOString()
      };
      setReports(prev => [...prev, newReport]);
      setChatMessages(prev => [...prev, {
        role: 'agent',
        text: `[Client Simulation] Calling report_cleanliness_issue()...\n\nThank you for keeping our sacred trails clean!\n- Report ID: ${newReportId}\n- Location: ${newReport.location}\n- Categorized Waste: ${newReport.waste_type}\n- Severity: Medium\n- Status: Open. The local volunteer group has been alerted.`,
        isSimulated: true
      }]);
      return;
    }

    if (msgLower.includes('local') || msgLower.includes('homestay') || msgLower.includes('guide') || msgLower.includes('eat') || msgLower.includes('shop')) {
      let category = 'Homestay';
      if (msgLower.includes('guide')) category = 'Guide';
      if (msgLower.includes('eat') || msgLower.includes('food')) category = 'Eatery';
      if (msgLower.includes('shop') || msgLower.includes('craft')) category = 'Handicrafts';

      const filtered = vendors.filter(v => v.category === category);
      let textRes = `Verified local community services for category '${category}':\n`;
      filtered.forEach(m => {
        textRes += `- ${m.name} (${m.rating}⭐)\n  Contact: ${m.contact}\n  Details: {m.description}\n\n`;
      });
      setChatMessages(prev => [...prev, {
        role: 'agent',
        text: `[Client Simulation] Calling get_local_services(category='${category}')...\n\n${textRes}`,
        isSimulated: true
      }]);
      return;
    }

    // Default chat fallback
    setChatMessages(prev => [...prev, {
      role: 'agent',
      text: "I am Dharma AI. Tell me what you want to do (e.g. 'book a slot for Badrinath', 'check Kedarnath crowd status', 'I recycled a bottle', or 'show me local homestays') and I will invoke my internal tools to execute the task.",
      isSimulated: true
    }]);
  };

  // Submit Booking Form
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    const selectedTemple = temples.find(t => t.id === bookingForm.templeId);
    
    if (!apiOffline) {
      try {
        const response = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Book a Darshan slot for ${selectedTemple.name} at ${bookingForm.timeSlot} for ${bookingForm.pilgrimName}`
          })
        });
        if (response.ok) {
          fetchBackendData();
          setActiveTab('chat');
          setChatMessages(prev => [...prev, {
            role: 'user',
            text: `Book a slot for ${selectedTemple.name} at ${bookingForm.timeSlot}`
          }]);
          const data = await response.json();
          setChatMessages(prev => [...prev, {
            role: 'agent',
            text: data.response,
            isSimulated: data.is_simulated
          }]);
        }
      } catch (err) {
        console.error("Booking API error:", err);
      }
    } else {
      // Local simulation
      const ticketId = `TX_${new Date().getMonth() + 1}${new Date().getDate()}_${tickets.length + 1001}`;
      const newTicket = {
        id: ticketId,
        temple_id: bookingForm.templeId,
        temple_name: selectedTemple.name,
        time_slot: bookingForm.timeSlot,
        pilgrim_name: bookingForm.pilgrimName,
        status: 'Active',
        timestamp: new Date().toISOString()
      };
      setTickets(prev => [...prev, newTicket]);
      
      // Feed to Chat
      setChatMessages(prev => [...prev, 
        { role: 'user', text: `Book a slot for ${selectedTemple.name} at ${bookingForm.timeSlot}` },
        {
          role: 'agent',
          text: `[Form submission] Successfully booked Darshan slot!\n- Ticket ID: ${ticketId}\n- Temple: ${selectedTemple.name}\n- Time Slot: ${bookingForm.timeSlot}\n- Pilgrim: ${bookingForm.pilgrimName}\n- Status: Active (QR Code generated)`,
          isSimulated: true
        }
      ]);
      setActiveTab('chat');
    }
  };

  // Swachh Vision AI Scan Simulation
  const handleSelectMockPhoto = (type) => {
    setSelectedMockPhoto(type);
    setIsScanning(true);
    setScanResult(null);

    // Simulate AI Scanner execution
    setTimeout(() => {
      setIsScanning(false);
      if (type === 'plastic') {
        setScanResult({
          wasteType: 'Plastic Bottles',
          detected: '5 Plastic Water Bottles, 2 Cola Cans',
          severity: 'High',
          confidence: '94.2%'
        });
        setWasteDescription('Litter pile containing high density plastic items on trekking route.');
      } else {
        setScanResult({
          wasteType: 'Organic Waste',
          detected: 'Food waste packaging, flowers, bio-waste',
          severity: 'Medium',
          confidence: '88.5%'
        });
        setWasteDescription('Discarded compost/food waste near the entry pavilion.');
      }
    }, 1500);
  };

  // Submit Waste Report
  const handleSubmitWasteReport = async (e) => {
    e.preventDefault();
    if (!wasteLocation || !scanResult) return;

    if (!apiOffline) {
      try {
        const response = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Report ${scanResult.wasteType} at ${wasteLocation} described as: ${wasteDescription}`
          })
        });
        if (response.ok) {
          fetchBackendData();
          setActiveTab('chat');
          setChatMessages(prev => [...prev, {
            role: 'user',
            text: `Report ${scanResult.wasteType} at ${wasteLocation}`
          }]);
          const data = await response.json();
          setChatMessages(prev => [...prev, {
            role: 'agent',
            text: data.response,
            isSimulated: data.is_simulated
          }]);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Local simulation
      const newReportId = `REP_${reports.length + 101}`;
      const newReport = {
        id: newReportId,
        location: wasteLocation,
        description: wasteDescription,
        waste_type: scanResult.wasteType,
        severity: scanResult.severity,
        status: 'Open',
        reporter: 'Pilgrim (via Swachh Vision)',
        timestamp: new Date().toISOString()
      };
      setReports(prev => [newReport, ...reports]);
      
      setChatMessages(prev => [...prev,
        { role: 'user', text: `Reported ${scanResult.wasteType} litter at ${wasteLocation}` },
        {
          role: 'agent',
          text: `[AI Vision submission] Thank you for your report. A Swachh Task has been created!\n- Report ID: ${newReportId}\n- Location: ${wasteLocation}\n- Categorized Waste: ${scanResult.wasteType}\n- Estimated Severity: ${scanResult.severity}\n- Status: Open (Local volunteer team notified)`,
          isSimulated: true
        }
      ]);
      setActiveTab('chat');
    }

    // Reset Form
    setSelectedMockPhoto(null);
    setScanResult(null);
    setWasteLocation('');
    setWasteDescription('');
  };

  // Add Punya Points manually (Eco-Action logger)
  const handleEarnPoints = async (action, points) => {
    if (!apiOffline) {
      try {
        const response = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `I did the following: ${action} which earns me ${points} points`
          })
        });
        if (response.ok) {
          fetchBackendData();
          setActiveTab('chat');
          setChatMessages(prev => [...prev, {
            role: 'user',
            text: `Log eco action: ${action}`
          }]);
          const data = await response.json();
          setChatMessages(prev => [...prev, {
            role: 'agent',
            text: data.response,
            isSimulated: data.is_simulated
          }]);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Local simulation
      const updatedProfile = {
        ...profile,
        points: profile.points + points,
        history: [{ action: action, points: points, date: new Date().toISOString() }, ...profile.history]
      };
      setProfile(updatedProfile);
      
      setChatMessages(prev => [...prev,
        { role: 'user', text: `Log eco activity: ${action}` },
        {
          role: 'agent',
          text: `[Eco Rewards claim] Excellent work! +${points} Punya Points awarded. Total Balance: ${updatedProfile.points} points.`,
          isSimulated: true
        }
      ]);
      setActiveTab('chat');
    }
  };

  // Admin resolves report
  const handleResolveReport = async (reportId) => {
    if (!apiOffline) {
      try {
        const response = await fetch(`${API_BASE}/api/reports/resolve/${reportId}`, {
          method: 'POST'
        });
        if (response.ok) {
          fetchBackendData();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Local simulation
      setReports(reports.map(r => r.id === reportId ? { ...r, status: 'Resolved' } : r));
    }
  };

  // Render simulated QR code
  const renderQR = (text) => {
    // Standard mock QR code layout using SVGs
    return (
      <svg className="qr-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" fill="white" />
        {/* Corners */}
        <rect x="10" y="10" width="25" height="25" fill="black" />
        <rect x="15" y="15" width="15" height="15" fill="white" />
        <rect x="18" y="18" width="9" height="9" fill="black" />
        
        <rect x="65" y="10" width="25" height="25" fill="black" />
        <rect x="70" y="15" width="15" height="15" fill="white" />
        <rect x="73" y="18" width="9" height="9" fill="black" />
        
        <rect x="10" y="65" width="25" height="25" fill="black" />
        <rect x="15" y="70" width="15" height="15" fill="white" />
        <rect x="18" y="73" width="9" height="9" fill="black" />
        
        {/* Center random data patterns */}
        <rect x="45" y="10" width="5" height="10" fill="black" />
        <rect x="55" y="15" width="5" height="15" fill="black" />
        <rect x="40" y="30" width="15" height="5" fill="black" />
        <rect x="45" y="45" width="10" height="10" fill="black" />
        
        <rect x="65" y="45" width="10" height="5" fill="black" />
        <rect x="80" y="50" width="10" height="15" fill="black" />
        
        <rect x="45" y="65" width="15" height="5" fill="black" />
        <rect x="50" y="75" width="5" height="15" fill="black" />
        <rect x="65" y="75" width="20" height="5" fill="black" />
        <rect x="75" y="65" width="10" height="10" fill="black" />
      </svg>
    );
  };

  return (
    <div className="app-container">
      
      {/* -------------------------------------------------------------
          SIDEBAR NAVIGATION
         ------------------------------------------------------------- */}
      <aside className="sidebar">
        <div className="logo-container">
          <span className="logo-icon">🕉️</span>
          <div className="logo-text">
            <h1>DivyaPath</h1>
            <p>Smart Pilgrimage</p>
          </div>
        </div>

        <nav className="nav-links">
          <li 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">🗺️</span>
            <span>Dashboard & Map</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="nav-icon">💬</span>
            <span>Dharma AI Chat</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveTab('booking')}
          >
            <span className="nav-icon">🎟️</span>
            <span>Darshan Booking</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'swachh' ? 'active' : ''}`}
            onClick={() => setActiveTab('swachh')}
          >
            <span className="nav-icon">👁️</span>
            <span>Swachh Vision</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            <span className="nav-icon">🌟</span>
            <span>Eco-Rewards</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'local' ? 'active' : ''}`}
            onClick={() => setActiveTab('local')}
          >
            <span className="nav-icon">🤝</span>
            <span>Community Hub</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <span className="nav-icon">📊</span>
            <span>Admin Portal</span>
          </li>
        </nav>

        <div className="user-profile-summary">
          <div className="user-avatar">
            {profile.name ? profile.name.charAt(0) : 'S'}
          </div>
          <div className="user-info">
            <h4>{profile.name}</h4>
            <p>🌟 {profile.points} Punya</p>
          </div>
        </div>
      </aside>

      {/* -------------------------------------------------------------
          MAIN CONTENT AREA
         ------------------------------------------------------------- */}
      <main className="main-content">
        
        {/* API status notification banner */}
        {!apiKeyConfigured && (
          <div className="alert-card">
            <div className="alert-message">
              ⚠️ <strong>Google Antigravity SDK Notice</strong>: <code>GEMINI_API_KEY</code> is not configured. 
              The application is running in <strong>Smart Simulation Mode</strong>. 
              To enable real Agentic LLM interactions, paste your API key in the backend <code>.env</code> file.
            </div>
            <button className="alert-action-btn" onClick={checkBackendConnection}>Retry Connection</button>
          </div>
        )}

        <header className="content-header">
          <div className="header-title">
            {activeTab === 'dashboard' && (
              <>
                <h2>DivyaPath Smart Portal</h2>
                <p>Real-time updates, route mapping, and predictive crowd control.</p>
              </>
            )}
            {activeTab === 'chat' && (
              <>
                <h2>Dharma AI</h2>
                <p>Chat with our autonomous Agentic guide executing requests via real backend tools.</p>
              </>
            )}
            {activeTab === 'booking' && (
              <>
                <h2>Darshan Slot Booking</h2>
                <p>Schedule your holy visit, register virtual queue slots, and generate access passes.</p>
              </>
            )}
            {activeTab === 'swachh' && (
              <>
                <h2>Swachh Vision (SDG 12)</h2>
                <p>Crowdsourced waste detection. Scan litter with AI to automate cleanliness requests.</p>
              </>
            )}
            {activeTab === 'rewards' && (
              <>
                <h2>Eco-Rewards (SDG 11 & 12)</h2>
                <p>Promoting sustainable pilgrimage. Complete green tasks to earn sacred Punya Points.</p>
              </>
            )}
            {activeTab === 'local' && (
              <>
                <h2>Local Community Directory</h2>
                <p>Supporting local economies by directing tourism revenue to regional vendors.</p>
              </>
            )}
            {activeTab === 'admin' && (
              <>
                <h2>Temple Management Portal</h2>
                <p>Authority analytics, crowd forecasts, and volunteer cleanup coordinate boards.</p>
              </>
            )}
          </div>

          <div className="status-badge">
            <span className={`status-dot ${apiOffline ? 'offline' : 'online'}`}></span>
            <span>{apiOffline ? 'Demo Mode (Simulated)' : 'Agentic API Connected'}</span>
          </div>
        </header>

        {/* -------------------------------------------------------------
            TAB: DASHBOARD & MAP
           ------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="dashboard-grid">
              {temples.map(t => (
                <div key={t.id} className={`glass-card temple-card ${t.crowd_status.toLowerCase()}`}>
                  <div className="temple-header">
                    <h3>{t.name}</h3>
                    <span className={`badge ${t.crowd_status.toLowerCase()}`}>
                      {t.crowd_status}
                    </span>
                  </div>
                  <div className="temple-stats">
                    <div className="stat-item">
                      <span>Wait Time</span>
                      <p>{t.wait_time_mins} mins</p>
                    </div>
                    <div className="stat-item">
                      <span>Active Pilgrims</span>
                      <p>{t.active_pilgrims} / {t.max_capacity}</p>
                    </div>
                  </div>
                  <div className="temple-footer">
                    <span>⛅ {t.weather}</span>
                    <span>🔔 Aarti: {t.next_aarti}</span>
                  </div>
                </div>
              ))}
              
              <div className="map-section">
                <div className="map-placeholder" style={{ backgroundColor: '#0f172a' }}>
                  <div className="map-lines"></div>
                  
                  {/* Drawing simulated topographic pilgrim paths */}
                  <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <path d="M 150 250 Q 250 180 350 280 T 550 150" fill="none" stroke="rgba(249, 115, 22, 0.25)" strokeWidth="4" strokeDasharray="6,6" />
                    <path d="M 350 280 Q 450 310 650 220" fill="none" stroke="rgba(13, 148, 136, 0.2)" strokeWidth="3" />
                  </svg>

                  {temples.map((t, index) => {
                    // Map lat/long coordinates dynamically to box coordinates
                    // Kedarnath is top center-right, Badrinath is right, Gangotri top left, Yamunotri left
                    const positions = [
                      { top: '35%', left: '55%' }, // Kedarnath
                      { top: '45%', left: '75%' }, // Badrinath
                      { top: '25%', left: '35%' }, // Gangotri
                      { top: '55%', left: '20%' }  // Yamunotri
                    ];
                    const pos = positions[index] || { top: '50%', left: '50%' };
                    return (
                      <div 
                        key={t.id} 
                        className="map-marker" 
                        style={{ top: pos.top, left: pos.left }}
                        onClick={() => {
                          setActiveTab('chat');
                          setChatMessages(prev => [...prev, {
                            role: 'user',
                            text: `Check status for ${t.name}`
                          }]);
                          runLocalSimulatedChat(`check status for ${t.id}`);
                        }}
                      >
                        <div className="marker-icon" style={{ backgroundColor: t.crowd_status === 'Busy' ? 'var(--accent-saffron)' : t.crowd_status === 'Moderate' ? 'var(--accent-gold)' : 'var(--accent-teal)' }}></div>
                        <div className="marker-label">{t.name} ({t.wait_time_mins}m wait)</div>
                      </div>
                    );
                  })}
                  
                  <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'rgba(9, 13, 22, 0.8)', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', border: '1px solid var(--border-color)' }}>
                    <h5 style={{ color: 'var(--accent-saffron)', marginBottom: '6px' }}>Interactive Map Guide</h5>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-saffron)' }}></span> Busy</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)' }}></span> Moderate</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)' }}></span> Low</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: DHARMA AI CHAT (AGENTIC UI)
           ------------------------------------------------------------- */}
        {activeTab === 'chat' && (
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.role} ${msg.isSimulated ? 'simulated' : ''}`}>
                  {msg.isSimulated && <span className="simulated-tag">Simulated Tool Call</span>}
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoadingChat && (
                <div className="typing-indicator chat-bubble agent">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChat} className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask Dharma AI e.g. 'book a slot for Kedarnath', 'what is Badrinath wait time?'"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isLoadingChat}
              />
              <button 
                type="submit" 
                className="chat-send-btn"
                disabled={isLoadingChat || !chatInput.trim()}
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: DARSHAN SLOT BOOKING
           ------------------------------------------------------------- */}
        {activeTab === 'booking' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              <div className="glass-card">
                <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Book Darshan Pass</h3>
                <form onSubmit={handleSubmitBooking}>
                  <div className="form-group">
                    <label>Select Shrine / Temple</label>
                    <select 
                      className="form-select"
                      value={bookingForm.templeId}
                      onChange={(e) => setBookingForm({...bookingForm, templeId: e.target.value})}
                    >
                      {temples.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Wait: {t.wait_time_mins}m)</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Preferred Time Slot</label>
                    <select 
                      className="form-select"
                      value={bookingForm.timeSlot}
                      onChange={(e) => setBookingForm({...bookingForm, timeSlot: e.target.value})}
                    >
                      <option value="06:00 AM - 07:00 AM">Morning - 06:00 AM to 07:00 AM</option>
                      <option value="08:00 AM - 09:00 AM">Morning - 08:00 AM to 09:00 AM</option>
                      <option value="10:00 AM - 11:00 AM">Morning - 10:00 AM to 11:00 AM</option>
                      <option value="12:00 PM - 13:00 PM">Noon - 12:00 PM to 13:00 PM</option>
                      <option value="15:00 PM - 16:00 PM">Afternoon - 15:00 PM to 16:00 PM</option>
                      <option value="18:00 PM - 19:00 PM">Evening (Aarti) - 18:00 PM to 19:00 PM</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Primary Pilgrim Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={bookingForm.pilgrimName}
                      onChange={(e) => setBookingForm({...bookingForm, pilgrimName: e.target.value})}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="form-submit-btn">Request Booking via AI Agent</button>
                </form>
              </div>

              <div>
                <h3 style={{ marginBottom: '20px' }}>Your Active Passes</h3>
                {tickets.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No bookings logged yet. Use the booking form or instruct Dharma AI directly to reserve passes.
                  </div>
                ) : (
                  <div className="ticket-container">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="ticket-card">
                        <div className="ticket-left">
                          <div className="ticket-title">VIRTUAL Darshan PASS</div>
                          <div className="ticket-temple">{ticket.temple_name}</div>
                          <div className="ticket-details-grid">
                            <div className="stat-item">
                              <span>Slot Time</span>
                              <p style={{ fontSize: '13px' }}>{ticket.time_slot}</p>
                            </div>
                            <div className="stat-item">
                              <span>Pilgrim</span>
                              <p style={{ fontSize: '13px' }}>{ticket.pilgrim_name}</p>
                            </div>
                            <div className="stat-item">
                              <span>Queue Status</span>
                              <p style={{ fontSize: '13px', color: 'var(--accent-teal)' }}>Confirmed</p>
                            </div>
                            <div className="stat-item">
                              <span>Reference</span>
                              <p style={{ fontSize: '11px', fontFamily: 'monospace' }}>{ticket.id}</p>
                            </div>
                          </div>
                        </div>
                        <div className="ticket-right">
                          <div className="qr-code-box">
                            {renderQR(ticket.id)}
                          </div>
                          <div className="ticket-id">{ticket.id}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: SWACHH VISION (AI WASTE SCANNER)
           ------------------------------------------------------------- */}
        {activeTab === 'swachh' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              <div className="glass-card">
                <h3 style={{ marginBottom: '16px' }}>AI Waste Classification</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Select one of the sample mock trail photos below to simulate the crowdsourced AI Vision classifier (SDG 12 compliance).
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div 
                    className="glass-card" 
                    style={{ padding: '12px', cursor: 'pointer', border: selectedMockPhoto === 'plastic' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)' }}
                    onClick={() => handleSelectMockPhoto('plastic')}
                  >
                    <div style={{ height: '80px', backgroundColor: '#334155', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🥤</div>
                    <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', fontWeight: '600' }}>Plastic Bottles Pile</div>
                  </div>

                  <div 
                    className="glass-card" 
                    style={{ padding: '12px', cursor: 'pointer', border: selectedMockPhoto === 'organic' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)' }}
                    onClick={() => handleSelectMockPhoto('organic')}
                  >
                    <div style={{ height: '80px', backgroundColor: '#334155', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🍂</div>
                    <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', fontWeight: '600' }}>Organic Waste / Bags</div>
                  </div>
                </div>

                {isScanning && (
                  <div className="ai-scan-overlay" style={{ textAlign: 'center', padding: '30px' }}>
                    <div className="ai-scan-title" style={{ justifyContent: 'center' }}>
                      <span className="nav-icon" style={{ animation: 'spin 1.5s linear infinite' }}>🔄</span> Running AI Classification...
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Scanning pixel arrays for litter boundaries...</p>
                  </div>
                )}

                {scanResult && !isScanning && (
                  <div className="preview-grid" style={{ gridTemplateColumns: '1fr', margin: '0' }}>
                    <div className="ai-scan-overlay">
                      <div className="ai-scan-title">
                        ✅ Swachh Vision Detected
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                        <div><strong>Category:</strong> {scanResult.wasteType}</div>
                        <div><strong>Confidence:</strong> {scanResult.confidence}</div>
                        <div><strong>Severity:</strong> <span className={`severity-badge ${scanResult.severity.toLowerCase()}`}>{scanResult.severity}</span></div>
                        <div style={{ gridColumn: '1 / -1' }}><strong>Detected Objects:</strong> {scanResult.detected}</div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitWasteReport} style={{ marginTop: '20px' }}>
                      <div className="form-group">
                        <label>Spotted Location / Trail Mark</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Kedarnath Path, near 4km resting bench"
                          value={wasteLocation}
                          onChange={(e) => setWasteLocation(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Incident Details (Auto-filled by AI)</label>
                        <textarea 
                          className="form-input" 
                          rows="3"
                          value={wasteDescription}
                          onChange={(e) => setWasteDescription(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="form-submit-btn" style={{ backgroundColor: 'var(--accent-teal)' }}>Submit Report via AI Agent</button>
                    </form>
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ marginBottom: '20px' }}>Active Trail Reports</h3>
                <div className="reports-list">
                  {reports.map(rep => (
                    <div key={rep.id} className="report-item">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <h4>{rep.location}</h4>
                          <span className={`severity-badge ${rep.severity.toLowerCase()}`}>
                            {rep.severity}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0' }}>{rep.description}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Type: {rep.waste_type} | Reported by {rep.reporter}
                        </p>
                      </div>
                      <span className={`badge ${rep.status === 'Resolved' ? 'low' : 'busy'}`}>
                        {rep.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: ECO-REWARDS (PUNYA POINTS LEDGER)
           ------------------------------------------------------------- */}
        {activeTab === 'rewards' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="glass-card rewards-header-card">
              <h3>Pilgrim Punya Ledger</h3>
              <p>Your eco-conscious contributions build a sustainable pilgrimage system.</p>
              <div className="points-display">
                <span className="points-num">{profile.points}</span>
                <span className="points-label">
                  <strong>Punya Points Balance</strong><br />
                  Equivalent to 3 priority Darshan passes or 15% discount at local shops.
                </span>
              </div>
            </div>

            <h3 style={{ marginBottom: '20px' }}>Log Eco-Actions to Earn Points</h3>
            <div className="action-cards-grid">
              <div 
                className="glass-card action-card"
                onClick={() => handleEarnPoints("Deposited plastic water bottles at smart recycling bin", 50)}
              >
                <div className="action-card-icon">♻️</div>
                <h4>Plastic Recycling</h4>
                <p>Deposit plastic packaging/bottles into any smart reverse vending machine.</p>
                <span className="points-earn-badge">+50 Points</span>
              </div>

              <div 
                className="glass-card action-card"
                onClick={() => handleEarnPoints("Logged trekking/walking route instead of using mule transport", 100)}
              >
                <div className="action-card-icon">🥾</div>
                <h4>Green Commute</h4>
                <p>Choose walking or electric shuttles over carbon/animal trekking alternatives.</p>
                <span className="points-earn-badge">+100 Points</span>
              </div>

              <div 
                className="glass-card action-card"
                onClick={() => handleEarnPoints("Purchased certified community-grown organic products", 75)}
              >
                <div className="action-card-icon">🌾</div>
                <h4>Local Artisan Purchase</h4>
                <p>Purchase direct from certified community vendors to preserve heritage.</p>
                <span className="points-earn-badge">+75 Points</span>
              </div>
            </div>

            <div className="glass-card">
              <h3>Eco-Ledger History</h3>
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Contribution / Green Action</th>
                    <th>Points Earned</th>
                    <th>Date Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.history && profile.history.map((h, i) => (
                    <tr key={i}>
                      <td>{h.action}</td>
                      <td style={{ color: 'var(--accent-teal)', fontWeight: '700' }}>+{h.points}</td>
                      <td>{new Date(h.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: LOCAL SERVICES DIRECTORY
           ------------------------------------------------------------- */}
        {activeTab === 'local' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="vendor-grid">
              {vendors.map(v => (
                <div key={v.id} className="glass-card vendor-card">
                  <div className="vendor-category">{v.category}</div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{v.name}</h3>
                  <div style={{ color: 'var(--accent-gold)', marginBottom: '12px', fontSize: '14px' }}>
                    {'⭐'.repeat(Math.floor(v.rating))} ({v.rating})
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
                    {v.description}
                  </p>
                  <div className="vendor-contact">
                    📞 Contact: {v.contact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: ADMIN PORTAL
           ------------------------------------------------------------- */}
        {activeTab === 'admin' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            <div className="admin-stats-grid">
              <div className="glass-card admin-stat-card">
                <span>Total Active Bookings</span>
                <h3>{tickets.length}</h3>
                <span style={{ color: 'var(--accent-teal)' }}>+12% vs yesterday</span>
              </div>
              <div className="glass-card admin-stat-card">
                <span>Average Wait Time</span>
                <h3>68 mins</h3>
                <span style={{ color: 'var(--accent-saffron)' }}>Peak hours active</span>
              </div>
              <div className="glass-card admin-stat-card">
                <span>Pending Cleanliness Alerts</span>
                <h3>{reports.filter(r => r.status === 'Open').length} Reports</h3>
                <span style={{ color: 'var(--accent-red)' }}>Needs immediate dispatch</span>
              </div>
              <div className="glass-card admin-stat-card">
                <span>Local Vendor Revenue</span>
                <h3>₹42,850</h3>
                <span style={{ color: 'var(--accent-teal)' }}>Supported via app incentives</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
              
              <div className="glass-card">
                <h3>AI Crowd Predictor (Next 7 Days)</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ML predictive mapping based on regional calendars, weather forecasting, and registration pipelines.
                </p>
                <div className="chart-placeholder">
                  {/* Bars representing simulated crowd predictions */}
                  {[
                    { day: 'Mon', val: '30%', status: 'Low' },
                    { day: 'Tue', val: '45%', status: 'Moderate' },
                    { day: 'Wed', val: '40%', status: 'Moderate' },
                    { day: 'Thu', val: '50%', status: 'Moderate' },
                    { day: 'Fri', val: '75%', status: 'Busy' },
                    { day: 'Sat', val: '95%', status: 'Busy' }, // Peak Aarti day
                    { day: 'Sun', val: '85%', status: 'Busy' }
                  ].map((bar, i) => (
                    <div key={i} className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ 
                          height: bar.val,
                          background: bar.status === 'Busy' ? 'linear-gradient(to top, var(--accent-saffron), #ef4444)' : 
                                      bar.status === 'Moderate' ? 'linear-gradient(to top, var(--accent-gold), var(--accent-saffron))' : 
                                      'linear-gradient(to top, var(--accent-teal), #0f766e)'
                        }}
                      ></div>
                      <span className="chart-label">{bar.day} ({bar.status})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card">
                <h3>Cleanliness Action Board</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Coordinate local volunteers and municipality groups to clean spotted areas.
                </p>
                
                {reports.filter(r => r.status === 'Open').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    All routes are clean! No pending alerts.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reports.filter(r => r.status === 'Open').map(rep => (
                      <div key={rep.id} className="glass-card" style={{ padding: '12px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700' }}>{rep.location}</span>
                          <span className={`severity-badge ${rep.severity.toLowerCase()}`} style={{ margin: '0' }}>{rep.severity}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0' }}>{rep.description}</p>
                        <button 
                          className="btn-outline" 
                          style={{ width: '100%', padding: '4px', fontSize: '11px', borderColor: 'var(--accent-teal)', color: 'var(--accent-teal)' }}
                          onClick={() => handleResolveReport(rep.id)}
                        >
                          Mark as Cleaned
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Spinning animation stylesheet addition */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}

export default App;
