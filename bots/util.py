import json
import numpy as np
import time

# database
from db import get_database


class Target:
    name  : str
    skin : str
    quality : str 
    # constructor
    def __init__(self, name, skin, quality):
        self.name = name
        self.skin = skin
        self.quality = quality 

    def get_api_link(self):
        return f"https://steamcommunity.com/market/pricehistory/?appid=730&market_hash_name={self.name}%20%7C%20{self.skin}%20({self.quality})" 
    def get_market_link(self):
        return f"https://steamcommunity.com/market/listings/730/{self.name}%20%7C%20{self.skin}%20({self.quality})"
    
    def update_price(self, price:float):
        dbname = get_database()
        collection_skins = dbname["skins"]
        collection_skins.update_one({"name":self.name,"skin": self.skin}, {"$set": {f"prices.{self.quality}": price}})
        

def get_update_targets():
    dbname = get_database()
    collection_skins = dbname["skins"]
    skins = collection_skins.find({})
    

    targets = []

    for skin in skins:
        for quality in skin["prices"]:
            if skin["prices"][quality] != -1: 
                target = Target(skin["name"], skin["skin"], quality)
                targets.append(target)
    return targets


def get_avg_price(history_str : str) -> float:
    
    history_json = json.loads(history_str)
    avg_price = np.mean(np.array(list(map(lambda el: el[1] , history_json["prices"][-10:]))))
    return np.round(avg_price, 2)
 
def update_server_info_skin_update_time():
    dbname = get_database()
    now = time.time()



    nowStr = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now))

    collection_server_info = dbname["serverinfos"]
    collection_server_info.find_one_and_update({}, {"$set": {"skinsUpdateInfo": {"valid": True}}})
    collection_server_info.update_one({}, {"$set": {"lastChanged": now, "skinsUpdateInfo": nowStr }})
    
