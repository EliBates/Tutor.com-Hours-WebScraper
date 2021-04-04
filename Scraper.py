from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC
from collections import deque
from icalendar import Calendar, Event
from datetime import datetime, timedelta
import os
import time

options = Options()
options.binary_location = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
driver_path = 'chromedriver'
driver = webdriver.Chrome(options=options, executable_path=driver_path)
TIMEZONE_SHIFT = 6
HTML_FILE_LOCATION = "http://127.0.0.1:5500/"


def shift(key, array):
    a = deque(array)  # turn list into deque
    a.rotate(key)    # rotate deque by key
    return list(a)   # turn deque back into a list


def substring(string, start, end):
    return string[start:end]


if os.path.exists("export.ics"):
    os.remove("export.ics")

driver.get(HTML_FILE_LOCATION)

# time.sleep(5)
try:
    # locate the table
    search_results = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.ID, "cell167")))

    selected_week = driver.find_element_by_id("divSelectedWeek")
    week_string = selected_week.find_element_by_xpath('a').text
    week_string = substring(week_string, 8, 18)
    week_string = week_string.split("/")

    curMonth = int(week_string[0])
    curDay = int(week_string[1])
    curYear = int(week_string[2])

    test = driver.find_element_by_id("cell105")

    print(test)

    # scrape table cells
    cells = search_results.find_elements_by_xpath(
        "//*[contains(@id, 'cell') and not(contains(@id, 'cellHours')) and not(contains(@id, 'cellDays')) ]")

    for cell in cells:
        print(cell.get_attribute('id') + " " + cell.get_attribute('innerHTML'))

    time_slots = [[0 for columns in range(7)] for rows in range(24)]

    hour = 0
    day = 0
    for cell in cells:
        time_slots[day][hour] = cell.get_attribute('innerHTML')
        hour += 1

        if hour == 7:
            hour = 0
            day += 1
    time_slots2 = shift(TIMEZONE_SHIFT, time_slots)  # convert to my time

    my_shifts = [[]for rows in range(7)]

    for x in range(24):
        for y in range(7):
            if "Scheduled!" in time_slots2[x][y]:
                my_shifts[y].append(x)

    cal = Calendar()
    for day in range(7):
        for hour in my_shifts[day]:
            incDays = timedelta(days=day)

            dateStart = datetime(curYear, curMonth, curDay, int(hour), 0, 0)
            dateEnd = datetime(curYear, curMonth, curDay, int(hour+1), 0, 0)

            dateStart = dateStart + incDays
            dateEnd = dateEnd + incDays

            event = Event()
            event.add('summary', 'Tutor.com Shift')
            event.add('dtstart', dateStart)
            event.add('dtend', dateEnd)
            event['dtstart'].to_ical()
            event['dtend'].to_ical()
            cal.add_component(event)
    f = open(os.path.join('', 'export.ics'), 'wb')
    f.write(cal.to_ical())
    f.close()
finally:
    print("finished")
    driver.quit()
    os.system('open export.ics')
