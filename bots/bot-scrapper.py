import os
from time import sleep
import sys



# SELENIUM
from selenium import webdriver
# DRIVERS
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
# EXTENSION
from selenium.webdriver.chrome.options import Options as ChromeOptions

# UTILS
from util import *

print('Number of arguments:', len(sys.argv), 'arguments.')
print('Argument List:', str(sys.argv))

update_start=0
update_end=10_000_000_000
for arg in sys.argv:
    if arg.startswith("start="):
        update_start = int(arg.replace("start=", ""))
    elif arg.startswith("end="):
        update_end = int(arg.replace("end=", ""))


# SETTING UP DRIVER
PATH = f"{os.getcwd()}/chromedriver.exe"
chrome_options = ChromeOptions()
chrome_options.add_experimental_option('detach', True)
driver = webdriver.Chrome(options=chrome_options)
currency = "zł"

# GETTING ON PAGE AND LOGGING
driver.get("https://store.steampowered.com/login/?l=english")

prompt = input("Is Logged In? (y/n): ")
if prompt == 'y':
    print("OK")
else:
    raise Exception("Not logged in")


# GETTING DATA
 
targets = get_update_targets()
for i, target in enumerate(targets): 
    if i < update_start or i > update_end:
        continue
    
    driver.get(target.get_market_link())
    print(f"{i} out of {len(targets)}")

    try:
        elem = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".market_listing_price")) 
        )

        if elem.text == "There are no listings for this item.":
            print(f"ERROR:{i} - {target.name} {target.skin} {target.quality}")
            continue

        price = float(elem.text.replace(currency, "").replace(",", ".").replace(" ", "")) 
        target.update_price(price)
    except:
        print(f"ERROR: {i} - {target.name} {target.skin} {target.quality}")

        continue
