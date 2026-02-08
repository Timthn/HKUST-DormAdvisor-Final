"""
Constants and Configuration
"""

# HKUST Brand Colors
COLORS = {
    "primary": "#003366",  # HKUST Blue
    "secondary": "#C5A059",  # HKUST Gold
    "light_bg": "#f7f9fc",
}

# System Instruction for AI
SYSTEM_INSTRUCTION = """You are the HKUST Dorm Advisor, an expert AI assistant dedicated to helping students find their ideal residence hall at the Hong Kong University of Science and Technology.

Your goal is to provide personalized, accurate, and helpful recommendations based on the user's budget, identity (Undergraduate/Postgraduate), and preferences (room type, lifestyle, etc.).

Key Information about HKUST Halls:
1. Hall I: The "Social Hub". Closest to academic building. Vibrant hall culture. Double/Triple rooms. Shared bathrooms. Price: ~HK$3,100.
2. Hall II: "Sea View Choice". Vertical layout. Single/Double rooms. Suite-style shared bathrooms. Price: ~HK$4,200.
3. Hall IV: "Top Pick". Renovated facilities. Balanced value. Single/Double rooms. Partial en-suite. Price: ~HK$4,800.
4. Hall V: "Quiet & Private". Mostly single rooms. Shared bathrooms. Recently renovated. Price: ~HK$4,500.
5. Hall VI: "Sea View Corridor". Active events. Double/Triple rooms. Shared bathrooms. Price: ~HK$4,900.

Tone: Friendly, encouraging, and informative. Avoid markdown headers (###) in short summaries. Use bullet points or paragraphs for readability."""

# Hall Facilities Data
HALL_FACILITIES = {
    "Hall I": {
        "name": "Hall I",
        "avg_price": "HK$ 3,100",
        "room_types": "Double / Triple",
        "ac": "Yes (Prepaid)",
        "bathroom": "Shared (Per Floor)",
        "gym": "No (Near Sports Hall)",
        "common": "Common Room per Floor",
        "laundry": "G/F Laundry",
        "features": "Closest to academic building, strong hall culture, suitable for social butterflies.",
        "tags": ["Social Hub"],
        "tag_color": "bg-green-500"
    },
    "Hall II": {
        "name": "Hall II",
        "avg_price": "HK$ 4,200",
        "room_types": "Double / Single",
        "ac": "Yes (Prepaid)",
        "bathroom": "Shared (Suite-style)",
        "gym": "Mini Gym Corner",
        "common": "Sea View Common Room",
        "laundry": "On each floor",
        "features": "Panoramic sea view, vertical layout, best value for ocean lovers.",
        "tags": ["Sea View Choice"],
        "tag_color": "bg-orange-400"
    },
    "Hall IV": {
        "name": "Hall IV",
        "avg_price": "HK$ 4,800",
        "room_types": "Single / Double",
        "ac": "Yes (Smart Control)",
        "bathroom": "En-suite (Partial)",
        "gym": "New Gym",
        "common": "Multi-function Room",
        "laundry": "G/F Smart Laundry",
        "features": "Renovated facilities, balanced value, perfect for mid-range budget.",
        "tags": ["Top Pick"],
        "tag_color": "bg-[#2b5dad]"
    },
    "Hall V": {
        "name": "Hall V",
        "avg_price": "HK$ 4,500",
        "room_types": "Single (Majority)",
        "ac": "Yes",
        "bathroom": "Shared",
        "gym": "No",
        "common": "Reading Rooms",
        "laundry": "G/F",
        "features": "Quiet environment, mostly single rooms, renovated recently."
    },
    "Hall VI": {
        "name": "Hall VI",
        "avg_price": "HK$ 4,900",
        "room_types": "Double / Triple",
        "ac": "Yes",
        "bathroom": "Shared",
        "gym": "Sea View Gym",
        "common": "Sea View Corridor",
        "laundry": "G/F",
        "features": "The famous \"Sea View Corridor\", newer facilities, active events."
    }
}
