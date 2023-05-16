import csv

with open('data.csv', 'r') as csvfile:
    csv_reader = csv.reader(csvfile, delimiter=',')

    jobs = []
    food = []
    race = []
    sports = []
    animals = []
    x = True
    for row in csv_reader:
        if x:
            x = False
            continue
        sports += [row[0].title()]
        jobs += [row[1].title()]
        food += [row[2].title()]
        race += [row[3].title()]

        if row[5].title() not in animals:
            animals += [row[5].title()]

    print(animals)    
    
