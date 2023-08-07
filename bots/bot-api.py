import os  
from time import sleep 


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



# SETTING UP DRIVER
PATH = f"{os.getcwd()}/chromedriver.exe"
chrome_options = ChromeOptions() 
chrome_options.add_experimental_option('detach', True)
driver = webdriver.Chrome(options=chrome_options)




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
    print(f"{i+1} out of {len(targets)}")
    driver.get(target.get_api_link())
     
    try:
        elem_pre = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "pre"))
        )
        price = get_avg_price(elem_pre.text)
        target.update_price(price) 
    except:
        print(f"ERROR:{i} - {target.name} {target.skin} {target.quality}")

        continue









 