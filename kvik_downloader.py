"""
KVIK PMEGP Report Downloader
Downloads reports from https://www.kviconline.gov.in/pmegpeportal/pmegpmr3/reportHomePage.jsp
Date Range: 01-APR-2025 to 17-MAR-2026

Default Credentials:
  Username: tgkvib
  Password: tgkvib
"""

import time
import os
import requests
from datetime import datetime
from urllib.parse import urljoin
from io import StringIO
import pandas as pd

# Configuration
PORTAL_LOGIN_URL = "https://www.kviconline.gov.in/pmegpeportal/pmegpmr3/login.jsp"
PORTAL_HOME = "https://www.kviconline.gov.in/pmegpeportal/"
REPORT_URL = "https://www.kviconline.gov.in/pmegpeportal/pmegpmr3/reportHomePage.jsp"

FROM_DATE = "01-APR-2025"
TO_DATE = "17-MAR-2026"
DOWNLOAD_DIR = r"E:\kadhi\PMEGP_project\kvik_downloads"

# Default credentials (from existing scraper configs)
DEFAULT_USERNAME = "tgkvib"
DEFAULT_PASSWORD = "tgkvib"

def create_download_folder():
    """Create download folder if it doesn't exist"""
    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR)
        print(f"✅ Created folder: {DOWNLOAD_DIR}")
    else:
        print(f"✅ Folder exists: {DOWNLOAD_DIR}")

def login_to_kvik(username=DEFAULT_USERNAME, password=DEFAULT_PASSWORD):
    """Login to KVIK portal using Selenium"""
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
    except ImportError:
        print("❌ Selenium not installed. Install with: pip install selenium")
        return None
    
    try:
        options = webdriver.ChromeOptions()
        # Disable notifications and popups
        options.add_argument("--disable-notifications")
        options.add_argument("--disable-popup-blocking")
        prefs = {"download.default_directory": DOWNLOAD_DIR}
        options.add_experimental_option("prefs", prefs)
        
        driver = webdriver.Chrome(options=options)
        
        print(f"🔐 Logging in to KVIK Portal...")
        print(f"   URL: {PORTAL_LOGIN_URL}")
        
        driver.get(PORTAL_LOGIN_URL)
        time.sleep(3)
        
        # Try to find login form fields
        try:
            username_field = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "user"))
            ) or driver.find_element(By.NAME, "username")
            
            password_field = driver.find_element(By.ID, "password") or driver.find_element(By.NAME, "password")
            
            username_field.clear()
            username_field.send_keys(username)
            print(f"✅ Entered username: {username}")
            
            password_field.clear()
            password_field.send_keys(password)
            print(f"✅ Entered password")
            
            # Find and click login button
            login_button = driver.find_element(By.XPATH, "//button[@type='submit'] | //input[@type='submit'] | //button[contains(text(), 'Login')]")
            login_button.click()
            print(f"⏳ Logging in...")
            
            time.sleep(3)
            print(f"✅ Logged in successfully!")
            
            return driver
            
        except Exception as e:
            print(f"⚠️  Login form elements not found: {e}")
            print(f"📋 Current URL: {driver.current_url}")
            print(f"📋 Page Title: {driver.title}")
            return driver
            
    except Exception as e:
        print(f"❌ Browser error: {e}")
        return None


def download_report(driver=None, username=DEFAULT_USERNAME, password=DEFAULT_PASSWORD):
    """Download report from KVIK portal"""
    
    if driver is None:
        driver = login_to_kvik(username, password)
    
    if driver is None:
        print("❌ Could not establish browser connection")
        return False
    
    try:
        print(f"\n📊 Fetching report...")
        print(f"    From Date: {FROM_DATE}")
        print(f"    To Date: {TO_DATE}")
        
        driver.get(REPORT_URL)
        time.sleep(3)
        
        # Try to fill the date fields
        try:
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            
            from_date_input = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[name*='from'], input[id*='from'], input[placeholder*='From']"))
            )
            from_date_input.clear()
            from_date_input.send_keys(FROM_DATE)
            print(f"✅ Set From Date: {FROM_DATE}")
            time.sleep(1)
            
            to_date_input = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[name*='to'], input[id*='to'], input[placeholder*='To']"))
            )
            to_date_input.clear()
            to_date_input.send_keys(TO_DATE)
            print(f"✅ Set To Date: {TO_DATE}")
            time.sleep(1)
            
        except Exception as e:
            print(f"⚠️  Could not fill date fields: {str(e)[:100]}")
        
        # Try to find and click submit button
        try:
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.webdriver.common.by import By
            
            submit_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Search')] | //button[contains(text(), 'Download')] | //button[contains(text(), 'Submit')] | //input[@type='submit']"))
            )
            print("⏳ Clicking submit button...")
            submit_btn.click()
            time.sleep(5)
            print("✅ Report loaded!")
            
        except Exception as e:
            print(f"⚠️  Could not find submit button: {str(e)[:100]}")
        
        # Check downloaded files
        time.sleep(2)
        files = [f for f in os.listdir(DOWNLOAD_DIR) if os.path.isfile(os.path.join(DOWNLOAD_DIR, f))]
        
        if files:
            print(f"\n✅ Files in downloads folder:")
            for file in files:
                file_path = os.path.join(DOWNLOAD_DIR, file)
                size = os.path.getsize(file_path) / (1024 * 1024)
                print(f"   - {file} ({size:.2f} MB)")
            return True
        else:
            print("⚠️  No files downloaded yet")
            print("\n💡 Browser is still open. Manual actions:")
            print("   1. Fill any remaining form fields")
            print("   2. Click Download/Export button")
            print("   3. Files will be saved to:", DOWNLOAD_DIR)
            print("\nYou can keep the browser open for manual interaction.")
            print("Press Ctrl+C to close...")
            
            try:
                while True:
                    time.sleep(1)
                    # Check if new files are created
                    files = [f for f in os.listdir(DOWNLOAD_DIR) if os.path.isfile(os.path.join(DOWNLOAD_DIR, f))]
                    if files:
                        print(f"\n✅ Download detected! Found {len(files)} file(s)")
                        break
            except KeyboardInterrupt:
                print("\nClosing browser...")
            
            return len(files) > 0
        
    except Exception as e:
        print(f"❌ Error during download: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        if driver:
            try:
                input("\n👁️  Press Enter to close the browser...")
                driver.quit()
                print("🔌 Browser closed")
            except:
                try:
                    driver.quit()
                except:
                    pass


if __name__ == "__main__":
    print("=" * 70)
    print("KVIK PMEGP Report Downloader")
    print("=" * 70)
    print(f"\n📋 Configuration:")
    print(f"   Portal: https://www.kviconline.gov.in/pmegpeportal/")
    print(f"   From Date: {FROM_DATE}")
    print(f"   To Date: {TO_DATE}")
    print(f"   Download Folder: {DOWNLOAD_DIR}")
    print(f"   Username: {DEFAULT_USERNAME}")
    print()
    
    create_download_folder()
    
    # Option to enter custom credentials
    print("Press Enter to use default credentials, or enter custom ones:")
    custom_user = input("  Username [tgkvib]: ").strip() or DEFAULT_USERNAME
    custom_pass = input("  Password [tgkvib]: ").strip() or DEFAULT_PASSWORD
    
    print()
    success = download_report(username=custom_user, password=custom_pass)
    
    print("=" * 70)
    if success:
        print("✅ Download completed!")
    else:
        print("⚠️  Download may need manual completion")
