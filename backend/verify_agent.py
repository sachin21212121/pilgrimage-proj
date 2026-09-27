import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
import main

print("=== STARTING OFFLINE AGENT & DB VERIFICATION ===")

# Reset database to defaults first
if os.path.exists(database.DB_FILE):
    os.remove(database.DB_FILE)
    print("Cleaned up existing database file for a fresh verification run.")

# 1. Test Temple Status Tool
print("\n[Test 1] Testing check_temple_status tool:")
result = main.check_temple_status("Kedarnath")
print(result)
assert "Kedarnath Temple" in result
assert "Busy" in result
print("✅ Test 1 Passed!")

# 2. Test Darshan Pass Booking Tool
print("\n[Test 2] Testing book_darshan_pass tool:")
result = main.book_darshan_pass("Kedarnath", "09:00 AM - 10:00 AM", "Jha Sachin R")
print(result)
assert "Successfully booked Darshan slot!" in result
assert "Jha Sachin R" in result
assert "Kedarnath Temple" in result

# Verify DB update
tickets = database.get_tickets()
print(f"Current tickets in DB: {len(tickets)}")
assert len(tickets) == 1
assert tickets[0]["pilgrim_name"] == "Jha Sachin R"
print("✅ Test 2 Passed!")

# 3. Test Cleanliness Report Tool
print("\n[Test 3] Testing report_cleanliness_issue tool:")
result = main.report_cleanliness_issue("Kedarnath Trek Path - Mile 5", "A large pile of plastic wrappers", "Plastic Bottles")
print(result)
assert "Thank you for your report" in result
assert "Kedarnath Trek Path - Mile 5" in result

# Verify DB update
reports = database.get_reports()
print(f"Current open reports in DB: {len(reports)}")
# Default has 2 reports, so this should be the 3rd
assert len(reports) == 3
assert reports[-1]["location"] == "Kedarnath Trek Path - Mile 5"
print("✅ Test 3 Passed!")

# 4. Test Eco-Points logging Tool
print("\n[Test 4] Testing claim_eco_points tool:")
result = main.claim_eco_points("Recycled 3 glass cups", 30)
print(result)
assert "recorded in the Punya Points ledger" in result

# Verify profile updates
profile = database.get_user_profile()
print(f"User points balance: {profile['points']}")
assert profile["points"] == 380  # Default was 350 + 30 = 380
print("✅ Test 4 Passed!")

# 5. Test Local Services Directory Tool
print("\n[Test 5] Testing get_local_services tool:")
result = main.get_local_services("Homestay")
print(result)
assert "Himalayan Homestays" in result
print("✅ Test 5 Passed!")

# 6. Test Smart Fallback AI Router
print("\n[Test 6] Testing smart fallback chat logic:")
chat_res = main.run_simulated_ai("I want to book a ticket for Badrinath temple at evening")
print("User prompt: 'I want to book a ticket for Badrinath temple at evening'")
print(f"Response: {chat_res}")
assert "book_darshan_pass" in chat_res
assert "Badrinath" in chat_res
assert "18:00 PM" in chat_res

# Verify ticket count is now 2
tickets = database.get_tickets()
assert len(tickets) == 2
print("✅ Test 6 Passed!")

print("\n=== ALL OFFLINE VERIFICATIONS COMPLETED SUCCESSFULLY ===")
