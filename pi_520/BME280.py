import board
import time
import digitalio
from adafruit_bme280 import basic as adafruit_bme280
# spi = board.SPI()
# cs = digitalio.DigitalInOut(board.D5)
# bme280 = adafruit_bme280.Adafruit_BME280_SPI(spi, cs)

def bmeInit():
    spi = board.SPI()
    cs = digitalio.DigitalInOut(board.D5)
    bme280 = adafruit_bme280.Adafruit_BME280_SPI(spi, cs)
    return bme280

def bmeData(bme280):
    a = (bme280.temperature, bme280.humidity, bme280.pressure)
    return a
