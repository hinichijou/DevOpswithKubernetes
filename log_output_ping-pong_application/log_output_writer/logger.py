import random
import signal
import sys
import string
from time import sleep
from datetime import datetime

generateRandomString = lambda: ''.join(random.choices(string.ascii_letters + string.digits, k=8))
randomString = generateRandomString()
timeStamp = lambda: datetime.now().isoformat()
filePath = '/usr/src/app/files/log.txt'#'./log.txt'

def handler(sig, frame):
    print(f'Logger exiting with {sig}')
    sys.exit(0)

signal.signal(signal.SIGINT, handler)
signal.signal(signal.SIGTERM, handler)

while True:
    with open(filePath, 'a') as f:
        f.write(f'{timeStamp()}: {randomString}\n')
        sleep(5)