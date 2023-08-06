import time 
import  json
import os
# SELENIUM
from selenium import webdriver
# DRIVERS
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
# EXTENSION
from selenium.webdriver.chrome.options import Options as ChromeOptions
 
 
PATH = f"{os.getcwd()}/chromedriver.exe"
chrome_options = ChromeOptions()
chrome_options.add_extension('floatchecker.crx')
chrome_options.add_experimental_option('detach', True)
driver = webdriver.Chrome(options=chrome_options)




# GETTING ON PAGE AND LOGGING
driver.get("https://store.steampowered.com/login/?l=english")
 
prompt = input("Is Logged In? (y/n): ")
if prompt == 'y':
    print("OK")
else:
    raise Exception("Not logged in")

link = "https://steamcommunity.com/market/pricehistory/?appid=730&market_hash_name=AK-47%20%7C%20Aquamarine%20Revenge%20(Minimal%20Wear)"
driver.get(link)

time.sleep(5)
pre = driver.find_element(By.CSS_SELECTOR, "pre")
pre_json = json.loads(pre.text)
print(pre_json)

price = pre_json["prices"][-10:]


