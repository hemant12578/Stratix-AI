"""
Setup script to create necessary directories
"""
import os

# Create data directories
os.makedirs("data/temp", exist_ok=True)
os.makedirs("server/data/temp", exist_ok=True)

print("✅ Directories created successfully!")
