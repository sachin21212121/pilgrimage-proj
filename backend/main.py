import os
import uuid
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env variables from backend/.env or parent directory
load_dotenv()

# Import our JSON database helpers
import database

# Try to import Google Antigravity SDK
HAS_SDK = False
try:
    from google.antigravity import Agent, LocalAgentConfig
    from google.antigravity.hooks import policy
    HAS_SDK = True
except ImportError:
    pass

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DivyaPathBackend")

app = FastAPI(title="DivyaPath Smart Pilgrimage API")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev purposes, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONVERSATIONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "conversations")
os.makedirs(CONVERSATIONS_DIR, exist_ok=True)

# -------------------------------------------------------------
# Define Custom Tools for Google Antigravity Agent
# -------------------------------------------------------------

def check_temple_status(temple_name: str) -> str:
    """Gets the real-time crowd level, wait times, weather, and active pilgrim counts for a temple.

    Args:
        temple_name: The name of the temple (e.g. "Kedarnath", "Badrinath", "Gangotri", "Yamunotri").
    """
    logger.info(f"Tool check_temple_status called with: {temple_name}")
    temples = database.get_temples()
    search_name = temple_name.lower()
    
    # Try direct match or substring match
    match = None
    for t in temples:
        if t["id"] in search_name or search_name in t["id"] or t["name"].lower() in search_name or search_name in t["name"].lower():
            match = t
            break
            
    if not match:
        names = ", ".join([t["name"] for t in temples])
        return f"Could not find crowd stats for '{temple_name}'. Available temples are: {names}"
        
    return (
        f"Real-time status for {match['name']}:\n"
        f"- Crowd Level: {match['crowd_status']}\n"
        f"- Wait Time: {match['wait_time_mins']} minutes\n"
        f"- Current Pilgrims inside: {match['active_pilgrims']} / {match['max_capacity']} limit\n"
        f"- Next Aarti: {match['next_aarti']}\n"
        f"- Weather: {match['weather']}"
    )

def book_darshan_pass(temple_name: str, time_slot: str, pilgrim_name: str) -> str:
    """Books a virtual queue Darshan pass/ticket for a pilgrim.

    Args:
        temple_name: The name of the temple (e.g. "Kedarnath", "Badrinath", "Gangotri", "Yamunotri").
        time_slot: The requested hourly slot (e.g., "09:00 AM - 10:00 AM", "14:00 PM").
        pilgrim_name: Name of the person booking the ticket.
    """
    logger.info(f"Tool book_darshan_pass called: {temple_name}, {time_slot}, {pilgrim_name}")
    temples = database.get_temples()
    search_name = temple_name.lower()
    
    match_id = None
    for t in temples:
        if t["id"] in search_name or search_name in t["id"] or t["name"].lower() in search_name or search_name in t["name"].lower():
            match_id = t["id"]
            break
            
    if not match_id:
        return f"Booking failed. Could not recognize temple '{temple_name}'."
        
    ticket = database.add_ticket(match_id, time_slot, pilgrim_name)
    return (
        f"Successfully booked Darshan slot!\n"
        f"- Ticket ID: {ticket['id']}\n"
        f"- Temple: {ticket['temple_name']}\n"
        f"- Time Slot: {ticket['time_slot']}\n"
        f"- Pilgrim: {ticket['pilgrim_name']}\n"
        f"- Status: Active (QR Code generated)"
    )

def report_cleanliness_issue(location: str, description: str, waste_type: str) -> str:
    """Files a cleanliness / waste report (Swachh Report) for a spotted pile of trash or debris.

    Args:
        location: Detailed location of the issue (e.g. "near Kedarnath dining area").
        description: Description of the waste or hazard.
        waste_type: The type of waste, must be one of: "Plastic Bottles", "Organic Waste", "General Litter".
    """
    logger.info(f"Tool report_cleanliness_issue called: {location}, {description}, {waste_type}")
    # Determine severity based on keywords
    severity = "Medium"
    desc_lower = description.lower()
    if "large" in desc_lower or "major" in desc_lower or "blocking" in desc_lower or "river" in desc_lower or "hazard" in desc_lower:
        severity = "High"
    elif "small" in desc_lower or "few" in desc_lower or "minor" in desc_lower:
        severity = "Low"
        
    report = database.add_report(location, description, waste_type, severity, "Pilgrim (via Dharma AI)")
    return (
        f"Thank you for your report. A Swachh Task has been created!\n"
        f"- Report ID: {report['id']}\n"
        f"- Location: {report['location']}\n"
        f"- Categorized Waste: {report['waste_type']}\n"
        f"- Estimated Severity: {report['severity']}\n"
        f"- Status: Open (Local volunteer team notified)"
    )

def claim_eco_points(action: str, points: int = 50) -> str:
    """Awards Punya Points (eco-rewards) to the pilgrim for executing an eco-friendly task.

    Args:
        action: The description of the eco-friendly task performed (e.g. 'Deposited plastic bottle in recycling bin').
        points: The number of points to award (default is 50).
    """
    logger.info(f"Tool claim_eco_points called: {action}, {points}")
    profile = database.add_punya_points(action, points)
    return (
        f"Excellent job! Your action has been recorded in the Punya Points ledger.\n"
        f"- Action logged: '{action}'\n"
        f"- Points awarded: +{points}\n"
        f"- New Total Balance: {profile['points']} Punya Points"
    )

def get_local_services(category: str) -> str:
    """Retrieves directory of local, community-owned services to promote local tourism support.

    Args:
        category: The category of service, choose from: "Homestay", "Guide", "Eatery", "Handicrafts".
    """
    logger.info(f"Tool get_local_services called: {category}")
    vendors = database.get_vendors()
    search_cat = category.lower()
    
    matches = [v for v in vendors if v["category"].lower() == search_cat]
    if not matches:
        all_cats = ", ".join(list(set([v["category"] for v in vendors])))
        return f"No services found in category '{category}'. Available categories are: {all_cats}"
        
    res = f"Verified local community services for category '{category}':\n"
    for m in matches:
        res += f"- {m['name']} ({m['rating']}⭐)\n  Contact: {m['contact']}\n  Details: {m['description']}\n\n"
    return res

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    is_simulated: bool

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    load_dotenv(override=True)
    conversation_id = req.conversation_id or str(uuid.uuid4())
    api_key = os.environ.get("GEMINI_API_KEY")
    
    # Fallback to smart rule-based simulator if API Key is not set or SDK not available
    if not HAS_SDK or not api_key:
        logger.warning("GEMINI_API_KEY is not set or Google Antigravity SDK is not available. Falling back to rule-based mock AI agent.")
        simulated_response = run_simulated_ai(req.message)
        return ChatResponse(
            response=simulated_response,
            conversation_id=conversation_id,
            is_simulated=True
        )

    # If API Key is set and SDK is present, run using Google Antigravity SDK
    try:
        config = LocalAgentConfig(
            model="gemini-3.5-flash",
            api_key=api_key,
            conversation_id=conversation_id,
            save_dir=CONVERSATIONS_DIR,
            system_instructions=(
                "You are Dharma AI, a helpful, polite, and intelligent virtual assistant for DivyaPath. "
                "You help pilgrims manage their pilgrimage journey, check crowd levels, book Darshan tickets, "
                "file cleanliness reports, claim eco-friendly points, and find local community vendors. "
                "Always be respectful and welcoming. Use the tools provided whenever you need to check "
                "real-time data, perform bookings, file reports, or log points. Do not make up ticket IDs or status details; "
                "use the tool outputs. If a tool fails or isn't available, explain the issue clearly."
            ),
            tools=[
                check_temple_status,
                book_darshan_pass,
                report_cleanliness_issue,
                claim_eco_points,
                get_local_services
            ]
        )
        
        async with Agent(config=config) as agent:
            response_stream = await agent.chat(req.message)
            response_text = await response_stream.text()
            
        return ChatResponse(
            response=response_text,
            conversation_id=conversation_id,
            is_simulated=False
        )
        
    except Exception as e:
        logger.error(f"Error executing Antigravity Agent: {e}")
        # Graceful fallback in case of API failure (quota limits, network errors, etc.)
        simulated_response = f"[System Warning: Google Antigravity SDK error: {e}. Falling back to smart backup assistant.]\n\n" + run_simulated_ai(req.message)
        return ChatResponse(
            response=simulated_response,
            conversation_id=conversation_id,
            is_simulated=True
        )

# Direct data retrieval endpoints for frontend UI dashboards
@app.get("/api/temples")
def get_temples_endpoint():
    return database.get_temples()

@app.get("/api/tickets")
def get_tickets_endpoint():
    return database.get_tickets()

@app.get("/api/reports")
def get_reports_endpoint():
    return database.get_reports()

@app.post("/api/reports/resolve/{report_id}")
def resolve_report_endpoint(report_id: str):
    res = database.resolve_report(report_id)
    if not res:
        raise HTTPException(status_code=404, detail="Report not found")
    return res

@app.get("/api/profile")
def get_profile_endpoint():
    return database.get_user_profile()

@app.get("/api/vendors")
def get_vendors_endpoint():
    return database.get_vendors()

# Helper endpoint to check AI configuration status
@app.get("/api/status")
def get_status_endpoint():
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    return {
        "has_sdk": HAS_SDK,
        "has_api_key": bool(api_key),
        "api_key_configured": "Yes (GEMINI_API_KEY set)" if api_key else "No (Set GEMINI_API_KEY in backend/.env)"
    }


# -------------------------------------------------------------
# Smart Keyword-Based Fallback AI Logic
# -------------------------------------------------------------
def run_simulated_ai(msg: str) -> str:
    msg_lower = msg.lower()
    
    # 1. Booking intent
    if "book" in msg_lower or "ticket" in msg_lower or "slot" in msg_lower or "darshan" in msg_lower:
        # Simple parameter extraction from natural language
        temple = "Kedarnath"
        for t in ["kedarnath", "badrinath", "gangotri", "yamunotri"]:
            if t in msg_lower:
                temple = t.title()
                break
                
        time_slot = "10:00 AM - 11:00 AM"
        if "noon" in msg_lower or "12" in msg_lower:
            time_slot = "12:00 PM - 13:00 PM"
        elif "evening" in msg_lower or "6" in msg_lower or "18:" in msg_lower:
            time_slot = "18:00 PM - 19:00 PM"
            
        pilgrim = "Sachin Jha"
        
        # Invoke tool function directly
        result = book_darshan_pass(temple, time_slot, pilgrim)
        return (
            "Hari Om! I'd be happy to assist you with booking a Darshan slot.\n\n"
            f"Calling book_darshan_pass(temple_name='{temple}', time_slot='{time_slot}', pilgrim_name='{pilgrim}')...\n\n"
            f"{result}\n\n"
            "Your ticket is confirmed! You can view the QR code in the booking tab."
        )
        
    # 2. Crowd / Status checking intent
    if "crowd" in msg_lower or "status" in msg_lower or "wait" in msg_lower or "weather" in msg_lower:
        temple = "Kedarnath"
        for t in ["kedarnath", "badrinath", "gangotri", "yamunotri"]:
            if t in msg_lower:
                temple = t.title()
                break
                
        result = check_temple_status(temple)
        return (
            f"Here is the latest data for your journey:\n\n"
            f"Calling check_temple_status(temple_name='{temple}')...\n\n"
            f"{result}"
        )
        
    # 3. Cleanliness reporting intent
    if "clean" in msg_lower or "waste" in msg_lower or "litter" in msg_lower or "report" in msg_lower:
        location = "Kedarnath Trek Trail"
        if "badrinath" in msg_lower:
            location = "Badrinath East Gate"
            
        waste = "Plastic Bottles"
        if "organic" in msg_lower or "food" in msg_lower:
            waste = "Organic Waste"
            
        desc = "Litter pile reported by pilgrim via chat."
        
        result = report_cleanliness_issue(location, desc, waste)
        return (
            "Thank you for keeping our sacred trails clean! I am filing a cleanup report immediately.\n\n"
            f"Calling report_cleanliness_issue(location='{location}', description='{desc}', waste_type='{waste}')...\n\n"
            f"{result}"
        )
        
    # 4. Eco points intent
    if "points" in msg_lower or "punya" in msg_lower or "reward" in msg_lower or "eco" in msg_lower:
        action = "Logged walking trip instead of hiring pony"
        points = 75
        if "bottle" in msg_lower or "recycle" in msg_lower:
            action = "Returned 2 water bottles to smart recycling bin"
            points = 20
            
        result = claim_eco_points(action, points)
        return (
            "Om Namah Shivay! Thank you for choosing a green pilgrimage path. I've recorded your action:\n\n"
            f"Calling claim_eco_points(action='{action}', points={points})...\n\n"
            f"{result}"
        )
        
    # 5. Local vendor intent
    if "local" in msg_lower or "homestay" in msg_lower or "guide" in msg_lower or "eat" in msg_lower or "shop" in msg_lower:
        category = "Homestay"
        if "guide" in msg_lower:
            category = "Guide"
        elif "eat" in msg_lower or "food" in msg_lower or "restaurant" in msg_lower:
            category = "Eatery"
        elif "shop" in msg_lower or "craft" in msg_lower or "souvenir" in msg_lower:
            category = "Handicrafts"
            
        result = get_local_services(category)
        return (
            "Empowering local communities keeps our pilgrimage ecosystem sustainable. Here are options you can support:\n\n"
            f"Calling get_local_services(category='{category}')...\n\n"
            f"{result}"
        )

    # 6. Default Welcome response
    return (
        "Namaste! I am Dharma AI, the intelligent virtual guide for DivyaPath.\n\n"
        "I can help you with the following tasks:\n"
        "1. **Check Live Status**: Ask me 'What is the crowd level at Badrinath?'\n"
        "2. **Book Darshan Passes**: Tell me 'Book a morning slot for Kedarnath'\n"
        "3. **Claim Eco-Rewards**: Tell me 'I recycled a plastic bottle' to get Punya Points.\n"
        "4. **Report Litter**: Tell me 'Report trash near Kedarnath temple'\n"
        "5. **Find Local Services**: Ask me 'Show local homestays' or guides.\n\n"
        "How can I help you make your pilgrimage safe and sustainable today?"
    )
