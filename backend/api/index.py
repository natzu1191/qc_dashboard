import sys
import os

# Ensure the project root is on the path so all imports resolve
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
