# webapp/utils/db_config_handler.py
import json
import os

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "../../config/db_config.json")

def save_db_config(data: dict):
    with open(CONFIG_PATH, 'w') as f:
        json.dump(data, f)

def load_db_config():
    if not os.path.exists(CONFIG_PATH):
        return None
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)
