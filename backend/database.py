import os
import json
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db.json")

DEFAULT_DB = {
    "temples": [
        {
            "id": "kedarnath",
            "name": "Kedarnath Temple",
            "crowd_status": "Busy",
            "wait_time_mins": 180,
            "active_pilgrims": 4500,
            "max_capacity": 6000,
            "next_aarti": "18:30 PM",
            "weather": "Cold (8°C), Clear Sky",
            "latitude": 30.7352,
            "longitude": 79.0669
        },
        {
            "id": "badrinath",
            "name": "Badrinath Temple",
            "crowd_status": "Moderate",
            "wait_time_mins": 60,
            "active_pilgrims": 2100,
            "max_capacity": 5000,
            "next_aarti": "19:00 PM",
            "weather": "Cool (14°C), Partly Cloudy",
            "latitude": 30.7448,
            "longitude": 79.4912
        },
        {
            "id": "gangotri",
            "name": "Gangotri Temple",
            "crowd_status": "Low",
            "wait_time_mins": 15,
            "active_pilgrims": 450,
            "max_capacity": 3000,
            "next_aarti": "18:45 PM",
            "weather": "Cool (12°C), Sunny",
            "latitude": 30.9947,
            "longitude": 78.9398
        },
        {
            "id": "yamunotri",
            "name": "Yamunotri Temple",
            "crowd_status": "Low",
            "wait_time_mins": 20,
            "active_pilgrims": 320,
            "max_capacity": 2500,
            "next_aarti": "18:15 PM",
            "weather": "Mild (15°C), Wind Speed 10km/h",
            "latitude": 31.0140,
            "longitude": 78.4600
        }
    ],
    "tickets": [],
    "reports": [
        {
            "id": "rep_101",
            "location": "Kedarnath Trek Path - 4km mark",
            "description": "Large pile of plastic water bottles near the resting shed.",
            "waste_type": "Plastic Bottles",
            "severity": "High",
            "status": "Open",
            "reporter": "Devansh Singh",
            "timestamp": "2026-07-19T14:10:00Z"
        },
        {
            "id": "rep_102",
            "location": "Badrinath Temple Complex - East Gate",
            "description": "Discarded organic waste bags spilling over the dustbin.",
            "waste_type": "Organic Waste",
            "severity": "Medium",
            "status": "Open",
            "reporter": "Sujit Thakur",
            "timestamp": "2026-07-19T14:25:00Z"
        }
    ],
    "users": [
        {
            "id": "user_default",
            "name": "Sachin Jha",
            "points": 350,
            "history": [
                {"action": "Returned 5 plastic water bottles to smart bin", "points": 50, "date": "2026-07-19T10:00:00Z"},
                {"action": "Opted for eco-friendly battery vehicle", "points": 100, "date": "2026-07-19T11:30:00Z"},
                {"action": "Completed Uttarakhand green pilgrimage survey", "points": 200, "date": "2026-07-19T12:00:00Z"}
            ]
        }
    ],
    "vendors": [
        {
            "id": "vendor_1",
            "name": "Himalayan Homestays & Cottages",
            "category": "Homestay",
            "contact": "+91 9876543210",
            "rating": 4.8,
            "description": "Locally-run eco-friendly stay. Supports local mountain families directly."
        },
        {
            "id": "vendor_2",
            "name": "Guide Kedar: Local Trekking Guides Association",
            "category": "Guide",
            "contact": "+91 9998887776",
            "rating": 4.9,
            "description": "Certified local guides trained in regional history, geography, and safety."
        },
        {
            "id": "vendor_3",
            "name": "Chhoti Ganga Organic Eatery",
            "category": "Eatery",
            "contact": "+91 8887776665",
            "rating": 4.6,
            "description": "Pure vegetarian satvik food cooked using locally sourced organic ingredients."
        },
        {
            "id": "vendor_4",
            "name": "Yamuna Heritage Wooden Handicrafts",
            "category": "Handicrafts",
            "contact": "+91 7776665554",
            "rating": 4.7,
            "description": "Support local artisans by purchasing hand-carved wood models of holy temples."
        }
    ]
}

def load_db():
    if not os.path.exists(DB_FILE):
        save_db(DEFAULT_DB)
        return DEFAULT_DB
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_DB

def save_db(data):
    try:
        with open(DB_FILE, "w") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"Error saving database: {e}")

# Database helper APIs
def get_temples():
    db = load_db()
    return db["temples"]

def update_temple_crowd(temple_id, crowd_status, wait_time_mins, active_pilgrims):
    db = load_db()
    for t in db["temples"]:
        if t["id"] == temple_id.lower():
            t["crowd_status"] = crowd_status
            t["wait_time_mins"] = wait_time_mins
            t["active_pilgrims"] = active_pilgrims
            save_db(db)
            return t
    return None

def get_tickets():
    db = load_db()
    return db["tickets"]

def add_ticket(temple_id, time_slot, pilgrim_name):
    db = load_db()
    ticket_id = f"TX_{datetime.now().strftime('%m%d')}_{len(db['tickets']) + 1001}"
    
    # Check if temple exists
    temple_name = temple_id.title()
    for t in db["temples"]:
        if t["id"] == temple_id.lower():
            temple_name = t["name"]
            break

    ticket = {
        "id": ticket_id,
        "temple_id": temple_id.lower(),
        "temple_name": temple_name,
        "time_slot": time_slot,
        "pilgrim_name": pilgrim_name,
        "status": "Active",
        "timestamp": datetime.now().isoformat()
    }
    db["tickets"].append(ticket)
    save_db(db)
    return ticket

def get_reports():
    db = load_db()
    return db["reports"]

def add_report(location, description, waste_type, severity, reporter="Anonymous"):
    db = load_db()
    report_id = f"REP_{len(db['reports']) + 101}"
    report = {
        "id": report_id,
        "location": location,
        "description": description,
        "waste_type": waste_type,
        "severity": severity,
        "status": "Open",
        "reporter": reporter,
        "timestamp": datetime.now().isoformat()
    }
    db["reports"].append(report)
    save_db(db)
    return report

def resolve_report(report_id):
    db = load_db()
    for r in db["reports"]:
        if r["id"] == report_id:
            r["status"] = "Resolved"
            save_db(db)
            return r
    return None

def get_user_profile():
    db = load_db()
    return db["users"][0]  # Return default user for simulation

def add_punya_points(action, points):
    db = load_db()
    user = db["users"][0]
    user["points"] += points
    user["history"].append({
        "action": action,
        "points": points,
        "date": datetime.now().isoformat()
    })
    save_db(db)
    return user

def get_vendors():
    db = load_db()
    return db["vendors"]
