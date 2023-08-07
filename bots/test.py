from util import *

targets = get_update_targets()

t = targets[0]

print( f"{t.name} {t.skin} {t.quality}" )

t.update_price(12.12)
        


