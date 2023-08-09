import os
from pymongo import MongoClient
from dotenv import load_dotenv

def get_database():
   
   load_dotenv()
   # Provide the mongodb atlas url to connect python to mongodb using pymongo
   connection_string = os.getenv("DB_URL")
   if connection_string is None:
      connection_string = 'mongodb://127.0.0.1:27017/steamApi'
 
   db_name= connection_string.split("/")[-1].split("?")[0] 
   # Create a connection using MongoClient. You can import MongoClient or use pymongo.MongoClient
   client = MongoClient(connection_string)

   # Create the database for our example (we will use the same database throughout the tutorial
   return client[db_name]


# This is added so that many files can reuse the function get_database()
if __name__ == "__main__":

   # Get the database
   dbname = get_database()
