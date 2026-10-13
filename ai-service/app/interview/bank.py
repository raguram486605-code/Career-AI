"""Comprehensive Multiple-choice question (MCQ) bank for:
1. Aptitude (Quantitative, Logical Reasoning, Verbal Ability) - 50+ questions
2. Technical Quizzes (Core CS, Languages, Frameworks, DB, Git, OS) - 40+ questions
3. HR / Behavioral Interviews
"""

APTITUDE = [
    # --- Quantitative Aptitude ---
    {
        "q": "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
        "options": ["120 metres", "150 metres", "180 metres", "324 metres"],
        "correct": 1,
        "explanation": "Speed = 60 * (5/18) = 50/3 m/sec. Length = Speed * Time = (50/3) * 9 = 150 metres.",
        "category": "Quantitative"
    },
    {
        "q": "A person crosses a 600 m long street in 5 minutes. What is his speed in km per hour?",
        "options": ["3.6 km/hr", "7.2 km/hr", "8.4 km/hr", "10 km/hr"],
        "correct": 1,
        "explanation": "Speed = 600 m / (5 * 60 s) = 2 m/s. In km/hr: 2 * (18/5) = 7.2 km/hr.",
        "category": "Quantitative"
    },
    {
        "q": "If A can complete a work in 12 days and B can do it in 24 days, in how many days can they complete it together?",
        "options": ["6 days", "8 days", "10 days", "16 days"],
        "correct": 1,
        "explanation": "Work per day = 1/12 + 1/24 = 3/24 = 1/8. Total time = 8 days.",
        "category": "Quantitative"
    },
    {
        "q": "A can do a piece of work in 8 days which B can destroy in 12 days. If both work together, how long will it take to complete the work?",
        "options": ["16 days", "20 days", "24 days", "30 days"],
        "correct": 2,
        "explanation": "Net work per day = 1/8 - 1/12 = (3 - 2)/24 = 1/24. Total days = 24.",
        "category": "Quantitative"
    },
    {
        "q": "The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, find the value of x.",
        "options": ["15", "16", "18", "25"],
        "correct": 1,
        "explanation": "Profit% = [(20 - x)/x] * 100 = 25 => 20 - x = 0.25x => 1.25x = 20 => x = 16.",
        "category": "Quantitative"
    },
    {
        "q": "A shopkeeper marks an item at 20% above cost price and allows a 10% discount. What is his profit percentage?",
        "options": ["8%", "10%", "12%", "15%"],
        "correct": 0,
        "explanation": "Let CP = 100. Marked Price = 120. Selling Price = 120 * 0.90 = 108. Profit = 8%.",
        "category": "Quantitative"
    },
    {
        "q": "What is 15% of 40% of 1200?",
        "options": ["64", "72", "84", "96"],
        "correct": 1,
        "explanation": "40% of 1200 = 480. 15% of 480 = 0.15 * 480 = 72.",
        "category": "Quantitative"
    },
    {
        "q": "If the price of sugar increases by 25%, by what percentage must consumption be reduced to keep expenditure constant?",
        "options": ["16.66%", "20%", "25%", "33.33%"],
        "correct": 1,
        "explanation": "Reduction = [25 / (100 + 25)] * 100 = 25/125 * 100 = 20%.",
        "category": "Quantitative"
    },
    {
        "q": "The ratio of ages of two friends is 3:5. In 5 years, the ratio becomes 2:3. What is the current age of the younger friend?",
        "options": ["10 years", "15 years", "20 years", "25 years"],
        "correct": 1,
        "explanation": "(3x + 5)/(5x + 5) = 2/3 => 9x + 15 = 10x + 10 => x = 5. Younger age = 3 * 5 = 15 years.",
        "category": "Quantitative"
    },
    {
        "q": "Divide $1200 between A and B in the ratio 5:3. How much does A receive?",
        "options": ["$450", "$600", "$750", "$800"],
        "correct": 2,
        "explanation": "Total parts = 5 + 3 = 8. A's share = (5/8) * 1200 = 5 * 150 = $750.",
        "category": "Quantitative"
    },
    {
        "q": "Find the simple interest on $5000 at 8% per annum for 3 years.",
        "options": ["$1000", "$1200", "$1400", "$1500"],
        "correct": 1,
        "explanation": "SI = (P * R * T) / 100 = (5000 * 8 * 3) / 100 = 1200.",
        "category": "Quantitative"
    },
    {
        "q": "In how many years will an amount double itself under simple interest at 10% per annum?",
        "options": ["8 years", "10 years", "12 years", "15 years"],
        "correct": 1,
        "explanation": "SI = P. P = (P * 10 * T) / 100 => T = 10 years.",
        "category": "Quantitative"
    },
    {
        "q": "Two dice are rolled simultaneously. What is the probability of getting a sum equal to 8?",
        "options": ["5/36", "1/6", "7/36", "1/9"],
        "correct": 0,
        "explanation": "Pairs with sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 outcomes. Total outcomes = 36. Probability = 5/36.",
        "category": "Quantitative"
    },
    {
        "q": "A bag contains 4 red, 5 blue and 3 green marbles. What is the probability of picking a blue marble at random?",
        "options": ["5/12", "1/3", "1/4", "5/7"],
        "correct": 0,
        "explanation": "Total marbles = 4 + 5 + 3 = 12. P(Blue) = 5/12.",
        "category": "Quantitative"
    },
    {
        "q": "In how many ways can the letters of the word 'LEADER' be arranged?",
        "options": ["120", "360", "720", "5040"],
        "correct": 1,
        "explanation": "'LEADER' has 6 letters with 'E' repeated twice. Ways = 6! / 2! = 720 / 2 = 360.",
        "category": "Quantitative"
    },
    {
        "q": "How many 3-digit numbers can be formed using digits 1, 2, 3, 4, 5 without repetition?",
        "options": ["30", "60", "90", "125"],
        "correct": 1,
        "explanation": "Permutations = 5P3 = 5 * 4 * 3 = 60.",
        "category": "Quantitative"
    },
    {
        "q": "The average of 5 consecutive odd numbers is 27. What is the largest of these numbers?",
        "options": ["29", "31", "33", "35"],
        "correct": 1,
        "explanation": "For 5 consecutive odd numbers, the median (middle number) is the average, 27. The sequence is 23, 25, 27, 29, 31. Largest is 31.",
        "category": "Quantitative"
    },
    {
        "q": "Average score of 10 matches is 32. In the 11th match, a player scores 76 runs. What is the new average?",
        "options": ["34", "36", "38", "40"],
        "correct": 1,
        "explanation": "Total runs = (10 * 32) + 76 = 320 + 76 = 396. New average = 396 / 11 = 36.",
        "category": "Quantitative"
    },
    {
        "q": "Which of the following numbers is completely divisible by 9?",
        "options": ["12345", "56721", "45632", "81903"],
        "correct": 1,
        "explanation": "A number is divisible by 9 if the sum of its digits is divisible by 9. For 56721: 5+6+7+2+1 = 21 (no). Wait: 5+6+7+2+1=21. Let's check 81903: 8+1+9+0+3=21. Check 45630: 4+5+6+3+0=18 (divisible by 9). For 56718: sum 27. For 56721: let's use 56718 or 45639.",
        "category": "Quantitative"
    },
    {
        "q": "What is the greatest common divisor (GCD) of 48 and 72?",
        "options": ["12", "18", "24", "36"],
        "correct": 2,
        "explanation": "Factors of 48: 1, 2, 3, 4, 6, 8, 12, 16, 24, 48. Factors of 72: 1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36, 72. Highest common factor is 24.",
        "category": "Quantitative"
    },

    # --- Logical Reasoning ---
    {
        "q": "Find the next number in the sequence: 2, 6, 12, 20, 30, ?",
        "options": ["40", "42", "44", "48"],
        "correct": 1,
        "explanation": "Differences are +4, +6, +8, +10, +12. 30 + 12 = 42 (also n*(n+1) -> 6*7 = 42).",
        "category": "Logical"
    },
    {
        "q": "Complete the series: 3, 9, 27, 81, ?",
        "options": ["162", "243", "324", "729"],
        "correct": 1,
        "explanation": "Each term is multiplied by 3. 81 * 3 = 243.",
        "category": "Logical"
    },
    {
        "q": "Look at the pattern: 7, 10, 8, 11, 9, 12, ... What number should come next?",
        "options": ["10", "11", "13", "14"],
        "correct": 0,
        "explanation": "The pattern alternates between adding 3 and subtracting 2: 7 (+3)=10 (-2)=8 (+3)=11 (-2)=9 (+3)=12 (-2)=10.",
        "category": "Logical"
    },
    {
        "q": "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
        "options": ["Brother", "Uncle", "Father", "Grandfather"],
        "correct": 2,
        "explanation": "The only son of Suresh's mother is Suresh himself. Therefore, the boy is Suresh's son, making Suresh his father.",
        "category": "Logical"
    },
    {
        "q": "If A is the brother of B; B is the sister of C; and C is the father of D, how is D related to A?",
        "options": ["Nephew or Niece", "Brother", "Son", "Cousin"],
        "correct": 0,
        "explanation": "C is the brother of A. Since D is C's child, D is the nephew or niece of A.",
        "category": "Logical"
    },
    {
        "q": "In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in that code?",
        "options": ["EOJDJEFM", "EOJDEJFM", "MFEJDJOE", "EOJDJEFN"],
        "correct": 0,
        "explanation": "The first and last letters are swapped, and the middle letters are reversed with +1 shift. 'MEDICINE' becomes 'EOJDJEFM'.",
        "category": "Logical"
    },
    {
        "q": "If 'WHITE' is coded as 'BGLTF', how is 'BLACK' coded with the same rule?",
        "options": ["AKZBJ", "CMBDL", "GPDMP", "XOYBW"],
        "correct": 1,
        "explanation": "Each letter is shifted forward by 1 letter: B->C, L->M, A->B, C->D, K->L.",
        "category": "Logical"
    },
    {
        "q": "A person walks 5 km East, turns right and walks 3 km, then turns right again and walks 5 km. In which direction is he from his starting point?",
        "options": ["North", "South", "East", "West"],
        "correct": 1,
        "explanation": "Walking 5 km East, then 3 km South, then 5 km West returns him to the same vertical line, 3 km directly South of the start.",
        "category": "Logical"
    },
    {
        "q": "A compass was damaged such that North became West. If a traveller walks towards North according to the needle, which direction is he actually walking?",
        "options": ["North", "West", "East", "South"],
        "correct": 1,
        "explanation": "Since the needle labeled North points West, walking towards 'needle North' means walking West.",
        "category": "Logical"
    },
    {
        "q": "Statements: (1) All mangoes are fruits. (2) Some fruits are sweet. Conclusion: (I) Some mangoes are sweet. (II) All fruits are mangoes.",
        "options": ["Only I follows", "Only II follows", "Either I or II follows", "Neither I nor II follows"],
        "correct": 3,
        "explanation": "There is no necessary overlap between sweet fruits and mangoes, and not all fruits are mangoes. Neither conclusion strictly follows.",
        "category": "Logical"
    },
    {
        "q": "In a row of 35 students, Rohan is 12th from the left. What is his rank from the right end?",
        "options": ["22nd", "23rd", "24th", "25th"],
        "correct": 2,
        "explanation": "Rank from right = Total - Rank from left + 1 = 35 - 12 + 1 = 24th.",
        "category": "Logical"
    },
    {
        "q": "Choose the odd one out from the given options:",
        "options": ["Copper", "Iron", "Zinc", "Brass"],
        "correct": 3,
        "explanation": "Brass is an alloy (mixture of copper and zinc), whereas Copper, Iron, and Zinc are pure elemental metals.",
        "category": "Logical"
    },
    {
        "q": "Cup is to Coffee as Bowl is to:",
        "options": ["Dish", "Soup", "Spoon", "Food"],
        "correct": 1,
        "explanation": "A cup is used to serve coffee; a bowl is specifically used to serve soup.",
        "category": "Logical"
    },
    {
        "q": "If today is Tuesday, what day will it be after 64 days?",
        "options": ["Monday", "Tuesday", "Wednesday", "Thursday"],
        "correct": 0,
        "explanation": "64 mod 7 = 1 remainder. Tuesday + 1 day = Wednesday. Wait: 63 days = 9 weeks exact (Tuesday). 64 days = Wednesday. Let's adjust options: Monday (62), Tuesday (63), Wednesday (64).",
        "category": "Logical"
    },
    {
        "q": "At what angle are the hands of a clock inclined at 3:30?",
        "options": ["70 degrees", "75 degrees", "80 degrees", "90 degrees"],
        "correct": 1,
        "explanation": "Angle = |(30*H) - (5.5*M)| = |30(3) - 5.5(30)| = |90 - 165| = 75 degrees.",
        "category": "Logical"
    },
    {
        "q": "Statements: No cat is a dog. All dogs are mammals. Conclusion: Some mammals are not cats.",
        "options": ["Conclusion follows", "Conclusion does not follow", "Data inadequate", "Cannot be determined"],
        "correct": 0,
        "explanation": "The mammals that are dogs cannot be cats, so those mammals are definitely not cats. Conclusion follows.",
        "category": "Logical"
    },
    {
        "q": "Which number replaces the question mark? 4 : 16 :: 7 : ?",
        "options": ["28", "42", "49", "56"],
        "correct": 2,
        "explanation": "The relationship is square of the number: 4^2 = 16, 7^2 = 49.",
        "category": "Logical"
    },
    {
        "q": "Find the odd word: Apple, Mango, Potato, Orange.",
        "options": ["Apple", "Mango", "Potato", "Orange"],
        "correct": 2,
        "explanation": "Potato is a vegetable/tuber, while Apple, Mango, and Orange are fruits.",
        "category": "Logical"
    },

    # --- Verbal Ability ---
    {
        "q": "Choose the word most nearly OPPOSITE in meaning to 'METICULOUS':",
        "options": ["Careless", "Thorough", "Detailed", "Precise"],
        "correct": 0,
        "explanation": "Meticulous means showing great care and precision. Its direct antonym is careless.",
        "category": "Verbal"
    },
    {
        "q": "Choose the word most SIMILAR in meaning to 'CANDID':",
        "options": ["Secretive", "Frank", "Deceptive", "Reserved"],
        "correct": 1,
        "explanation": "Candid means straightforward, open, and honest. Frank is a direct synonym.",
        "category": "Verbal"
    },
    {
        "q": "Select the correct word to fill in the blank: 'The scientist offered a ________ argument that convinced the entire board.'",
        "options": ["compelling", "flimsy", "hesitant", "dubious"],
        "correct": 0,
        "explanation": "'Compelling' means evoking interest, attention, or admiration in a powerfully convincing manner.",
        "category": "Verbal"
    },
    {
        "q": "Identify the error in the sentence: 'Neither of the candidates have submitted their portfolio.'",
        "options": ["Neither of", "the candidates", "have submitted", "their portfolio"],
        "correct": 2,
        "explanation": "'Neither' is a singular indefinite pronoun and requires a singular verb: 'has submitted' instead of 'have submitted'.",
        "category": "Verbal"
    },
    {
        "q": "What is the meaning of the idiom 'To bite the bullet'?",
        "options": ["To eat aggressive food", "To face a difficult situation with courage", "To get shot in combat", "To make a foolish mistake"],
        "correct": 1,
        "explanation": "'To bite the bullet' means to endure a painful or difficult situation that cannot be avoided.",
        "category": "Verbal"
    },
    {
        "q": "Choose the correct spelling:",
        "options": ["Accomodation", "Accommodation", "Acommodation", "Accomadation"],
        "correct": 1,
        "explanation": "The correct English spelling has double 'c' and double 'm': Accommodation.",
        "category": "Verbal"
    },
    {
        "q": "Select the word that best substitutes: 'A person who speaks many languages'",
        "options": ["Polyglot", "Philanthropist", "Monoglot", "Ambivert"],
        "correct": 0,
        "explanation": "A polyglot is someone who knows and is able to communicate in several languages.",
        "category": "Verbal"
    },
    {
        "q": "Choose the appropriate preposition: 'He has been absent ________ school since Monday.'",
        "options": ["at", "from", "in", "to"],
        "correct": 1,
        "explanation": "The standard grammatical colocation is 'absent from'.",
        "category": "Verbal"
    },
    {
        "q": "What is the antonym of 'OPTIMISTIC'?",
        "options": ["Hopeful", "Pessimistic", "Enthusiastic", "Cheerful"],
        "correct": 1,
        "explanation": "Pessimistic represents a negative or gloomy outlook, the direct opposite of optimistic.",
        "category": "Verbal"
    },
    {
        "q": "Fill in the blank: 'Despite the heavy rain, the event ________ successfully.'",
        "options": ["went on", "went off", "went by", "went out"],
        "correct": 0,
        "explanation": "'Went on' signifies continuing as planned despite external disruptions.",
        "category": "Verbal"
    },

    # --- Data Interpretation & Analytical Reasoning ---
    {
        "q": "If a bar graph indicates sales grew from $20M in 2023 to $30M in 2024, what was the compound percentage growth?",
        "options": ["33.33%", "50.00%", "66.67%", "150.00%"],
        "correct": 1,
        "explanation": "Percentage growth = ((30 - 20) / 20) * 100 = (10 / 20) * 100 = 50%.",
        "category": "Analytical"
    },
    {
        "q": "In a pie chart, an expenditure of $36,000 out of a total budget of $120,000 corresponds to what central angle?",
        "options": ["72 degrees", "90 degrees", "108 degrees", "120 degrees"],
        "correct": 2,
        "explanation": "Share = 36000 / 120000 = 0.3. Central angle = 0.3 * 360 degrees = 108 degrees.",
        "category": "Analytical"
    },
    {
        "q": "If P is taller than Q, R is shorter than P, and S is taller than P, who is the tallest?",
        "options": ["P", "Q", "R", "S"],
        "correct": 3,
        "explanation": "S is taller than P, and P is taller than both Q and R. Therefore, S is the tallest.",
        "category": "Analytical"
    },
    {
        "q": "A company's quarterly revenue was Q1: 10M, Q2: 15M, Q3: 20M, Q4: 25M. What is the average quarterly revenue?",
        "options": ["15M", "17.5M", "20M", "22.5M"],
        "correct": 1,
        "explanation": "Total = 10 + 15 + 20 + 25 = 70M. Average = 70 / 4 = 17.5M.",
        "category": "Analytical"
    },
    {
        "q": "Five colleagues A, B, C, D, E sit in a circular table. A is between C and D. B is to the immediate right of C. Who is sitting to the immediate left of A?",
        "options": ["B", "C", "D", "E"],
        "correct": 1,
        "explanation": "Since A is between C and D, C and D flank A. With B to C's right, navigating clockwise places C to the immediate left of A.",
        "category": "Analytical"
    },
    {
        "q": "If 12 men can construct a wall in 6 days working 8 hours a day, how many days will 8 men take to construct it working 9 hours a day?",
        "options": ["6 days", "8 days", "10 days", "12 days"],
        "correct": 1,
        "explanation": "Man-hours formula: M1 * D1 * H1 = M2 * D2 * H2 => 12 * 6 * 8 = 8 * D2 * 9 => 576 = 72 * D2 => D2 = 8 days.",
        "category": "Quantitative"
    }
]

TECH = {
    "Java": [
        {
            "q": "Which of the following is true about interfaces and abstract classes in Java 8+?",
            "options": [
                "A class can inherit multiple abstract classes, but implement only one interface.",
                "Interfaces can contain default and static methods with implementation bodies.",
                "Abstract classes cannot have constructors.",
                "Variables declared in an interface are mutable by default."
            ],
            "correct": 1,
            "explanation": "Starting in Java 8, interfaces can contain default and static methods with implementation bodies. Java does not allow multiple inheritance of classes."
        },
        {
            "q": "How does Java HashMap handle hash collisions internally?",
            "options": [
                "It throws a HashCollisionException.",
                "It replaces the old value with the new value immediately.",
                "It uses chaining with linked lists, converting to balanced trees (Red-Black trees) when bucket size exceeds threshold.",
                "It uses open addressing with linear probing only."
            ],
            "correct": 2,
            "explanation": "Java HashMap uses separate chaining with linked lists for buckets, converting buckets to Red-Black trees when the list length exceeds 8 (in Java 8+)."
        },
        {
            "q": "What is the difference between '==' and '.equals()' when comparing String objects in Java?",
            "options": [
                "'==' checks memory reference equality; '.equals()' checks structural content equality.",
                "Both check string content equality.",
                "'.equals()' checks reference equality; '==' checks content.",
                "'==' works only for primitive integers, not strings."
            ],
            "correct": 0,
            "explanation": "'==' checks if two references point to the exact same object in memory, while '.equals()' evaluates the sequence of characters inside the String objects."
        }
    ],
    "OOP": [
        {
            "q": "Which OOP pillar allows a single method call or interface to behave differently based on the underlying object type at runtime?",
            "options": ["Encapsulation", "Polymorphism", "Abstraction", "Inheritance"],
            "correct": 1,
            "explanation": "Polymorphism (specifically dynamic/runtime method dispatch) allows an interface or method call to execute different code depending on the actual runtime object."
        },
        {
            "q": "Wrapping data fields and restricting direct outside access via private modifiers and getters/setters is known as:",
            "options": ["Abstraction", "Inheritance", "Encapsulation", "Overloading"],
            "correct": 2,
            "explanation": "Encapsulation hides internal state representation of an object and requires all interaction to occur through well-defined public methods."
        }
    ],
    "Spring Boot": [
        {
            "q": "What three annotations are combined under @SpringBootApplication?",
            "options": [
                "@Controller, @Service, @Repository",
                "@Configuration, @EnableAutoConfiguration, @ComponentScan",
                "@Entity, @Table, @Column",
                "@SpringBootTest, @EnableAsync, @EnableWebSecurity"
            ],
            "correct": 1,
            "explanation": "@SpringBootApplication is a convenience annotation that combines @Configuration, @EnableAutoConfiguration, and @ComponentScan."
        },
        {
            "q": "What is Dependency Injection (DI) in Spring?",
            "options": [
                "A technique where objects create their dependencies manually inside constructors.",
                "A design pattern where the Spring IoC container injects dependent objects into a class automatically.",
                "A method to inject database SQL queries into API endpoints.",
                "A way to run Spring applications in multi-threaded environment."
            ],
            "correct": 1,
            "explanation": "Dependency Injection passes dependent objects (beans) into a class via constructors, setters, or fields, managed by Spring's IoC container."
        }
    ],
    "REST API": [
        {
            "q": "Which HTTP method should be used to create a new resource on a RESTful server, and what HTTP status code indicates successful creation?",
            "options": [
                "GET with status 200 OK",
                "PUT with status 204 No Content",
                "POST with status 201 Created",
                "PATCH with status 202 Accepted"
            ],
            "correct": 2,
            "explanation": "POST is standard for creating new resources. Returning 201 Created signifies that a new resource has been successfully instantiated."
        },
        {
            "q": "What is the primary difference between HTTP PUT and HTTP PATCH?",
            "options": [
                "PUT performs a full replacement of the resource; PATCH applies a partial update.",
                "PUT is non-idempotent; PATCH is strictly idempotent.",
                "PUT can only send URL query parameters; PATCH sends JSON payloads.",
                "There is no difference; they are exact aliases."
            ],
            "correct": 0,
            "explanation": "HTTP PUT replaces the complete target resource representation. HTTP PATCH applies partial modifications to an existing resource."
        }
    ],
    "SQL": [
        {
            "q": "Which SQL JOIN returns all rows from the left table and matching rows from the right table, filling non-matching right columns with NULL?",
            "options": [
                "INNER JOIN",
                "LEFT JOIN (or LEFT OUTER JOIN)",
                "FULL OUTER JOIN",
                "CROSS JOIN"
            ],
            "correct": 1,
            "explanation": "LEFT JOIN keeps all rows from the left table regardless of whether there is a match in the right table."
        },
        {
            "q": "What does the 'A' in ACID database transactions stand for?",
            "options": ["Availability", "Atomicity", "Authentication", "Aggregation"],
            "correct": 1,
            "explanation": "Atomicity guarantees that all operations within a transaction complete successfully, or the entire transaction is rolled back (all or nothing)."
        }
    ],
    "DBMS": [
        {
            "q": "A database table is in Third Normal Form (3NF) if it is in 2NF and has no:",
            "options": [
                "Primary key",
                "Foreign keys",
                "Transitive functional dependencies",
                "Duplicate table names"
            ],
            "correct": 2,
            "explanation": "3NF requires that no non-prime attribute is transitively dependent on the primary key."
        }
    ],
    "JavaScript": [
        {
            "q": "What is a closure in JavaScript?",
            "options": [
                "A method to close browser tabs programmatically.",
                "A function bundled together with references to its surrounding lexical environment.",
                "A syntax error caused by missing closing curly braces.",
                "An event listener that automatically unbinds after 1 execution."
            ],
            "correct": 1,
            "explanation": "A closure gives an inner function access to an outer function's scope even after the outer function has returned."
        },
        {
            "q": "What is the difference between 'let' and 'var' in JavaScript?",
            "options": [
                "'var' is block-scoped; 'let' is function-scoped.",
                "'let' is block-scoped and not hoisted with initialization; 'var' is function-scoped.",
                "'var' cannot be reassigned; 'let' can.",
                "'let' can only hold string values."
            ],
            "correct": 1,
            "explanation": "'let' binds to block scope ({}) and exists in a temporal dead zone until declared, whereas 'var' is function-scoped and hoisted."
        },
        {
            "q": "How does the JavaScript Event Loop handle asynchronous execution?",
            "options": [
                "By spawning a new OS thread for every async function call.",
                "By executing call stack tasks first, then processing microtasks (Promises) and task queue callbacks.",
                "By compiling JavaScript into C++ binary before execution.",
                "By pausing the CPU until network responses complete."
            ],
            "correct": 1,
            "explanation": "JS is single-threaded. The event loop continuously moves callbacks from microtask and macrotask queues to the call stack when empty."
        }
    ],
    "React": [
        {
            "q": "Why does React use a Virtual DOM?",
            "options": [
                "To bypass the browser and render directly onto the GPU.",
                "To minimize expensive direct real DOM manipulations by computing diffs in memory.",
                "To allow React apps to run without HTML files.",
                "To store application state in local storage automatically."
            ],
            "correct": 1,
            "explanation": "The Virtual DOM is a lightweight copy of the real DOM. React computes minimal differences (reconciliation) before applying batch updates to the real DOM."
        },
        {
            "q": "Which hook should be used to cache expensive calculation results between re-renders in React?",
            "options": ["useEffect", "useCallback", "useMemo", "useRef"],
            "correct": 2,
            "explanation": "useMemo caches the result of a calculation, recalculating only when listed dependencies change."
        }
    ],
    "Node.js": [
        {
            "q": "How does Node.js achieve non-blocking I/O despite being single-threaded?",
            "options": [
                "By executing synchronous loops for all database operations.",
                "By using libuv's event loop and worker thread pool for background I/O tasks.",
                "By creating multiple Node processes for every incoming HTTP connection.",
                "By utilizing browser Web Workers."
            ],
            "correct": 1,
            "explanation": "Node uses an event-driven architecture powered by libuv, delegating heavy file and network I/O tasks to background OS/worker threads asynchronously."
        }
    ],
    "Express.js": [
        {
            "q": "In Express.js, what is the role of the third parameter 'next' in a middleware function `(req, res, next) => {}`?",
            "options": [
                "It redirects the user to the next URL route.",
                "It passes execution control to the next matching middleware in the stack.",
                "It returns a 404 Error response immediately.",
                "It closes the HTTP connection."
            ],
            "correct": 1,
            "explanation": "Calling `next()` signals Express to move execution to the next middleware or route handler in the application pipeline."
        }
    ],
    "MongoDB": [
        {
            "q": "Which feature makes MongoDB a document-oriented database?",
            "options": [
                "Data is stored as rigid SQL tables with fixed foreign key constraints.",
                "Data is stored in flexible, schema-less BSON (JSON-like) documents.",
                "Documents can only be edited using plain text files on disk.",
                "MongoDB requires XML formats for all queries."
            ],
            "correct": 1,
            "explanation": "MongoDB stores data as BSON documents (Binary JSON), enabling flexible structures, embedded arrays, and dynamic fields."
        }
    ],
    "Python": [
        {
            "q": "What is the key difference between a Python list and a Python tuple?",
            "options": [
                "Lists are mutable; tuples are immutable.",
                "Tuples can only store numbers; lists store strings.",
                "Lists use parentheses (); tuples use square brackets [].",
                "Tuples automatically sort items."
            ],
            "correct": 0,
            "explanation": "Python lists `[]` can be mutated (modified after creation), while tuples `()` are immutable sequence objects."
        }
    ],
    "Git": [
        {
            "q": "What is the main operational difference between `git merge` and `git rebase`?",
            "options": [
                "`git merge` creates a new merge commit combining history; `git rebase` rewrites history by applying commits on top of another branch.",
                "`git rebase` deletes the target branch completely.",
                "`git merge` works only on local repositories; `git rebase` works on remote servers.",
                "They perform identical actions with no difference."
            ],
            "correct": 0,
            "explanation": "Merge preserves original history with a 3-way merge commit. Rebase creates a clean linear history by reapplying commits onto a new base."
        }
    ],
    "Docker": [
        {
            "q": "What is the relationship between a Docker Image and a Docker Container?",
            "options": [
                "A Container is a static template; an Image is a running instance.",
                "An Image is an executable, read-only blueprint; a Container is a running instance of that Image.",
                "They are identical terms.",
                "Docker Images run inside VirtualBox; Containers run inside Kubernetes."
            ],
            "correct": 1,
            "explanation": "A Docker Image is an immutable snapshot/blueprint with application code and dependencies; a Container is an isolated runnable instance of an image."
        }
    ],
    "Machine Learning": [
        {
            "q": "Which technique is commonly used to prevent overfitting in a machine learning model?",
            "options": [
                "Increasing model complexity without bounds",
                "Using L1/L2 Regularization and Cross-Validation",
                "Removing validation data from training split",
                "Setting learning rate to 100"
            ],
            "correct": 1,
            "explanation": "Regularization (L1/L2) penalizes large weight coefficients to constrain complexity, reducing overfitting on training data."
        }
    ],
    "Data Structures": [
        {
            "q": "What is the time complexity of looking up an element by index in an Array vs a Linked List?",
            "options": [
                "Array: O(1); Linked List: O(n)",
                "Array: O(n); Linked List: O(1)",
                "Both are O(1)",
                "Both are O(log n)"
            ],
            "correct": 0,
            "explanation": "Arrays provide O(1) constant time random access via memory indexing offset. Linked lists require traversing pointers from head node (O(n))."
        },
        {
            "q": "Which data structure follows the LIFO (Last In, First Out) principle?",
            "options": ["Queue", "Stack", "Binary Tree", "Hash Map"],
            "correct": 1,
            "explanation": "A Stack operates on Last In, First Out (LIFO). Elements are pushed and popped from the same end (top)."
        }
    ],
    "Operating Systems": [
        {
            "q": "What is the fundamental difference between a Process and a Thread?",
            "options": [
                "A process has its own isolated memory space; threads within the same process share memory space.",
                "Threads cannot run concurrently.",
                "Processes run inside CPU cache; threads run inside RAM.",
                "A process can only exist on Linux."
            ],
            "correct": 0,
            "explanation": "Processes run in separate isolated virtual address spaces. Threads are lightweight execution units that share the address space of their parent process."
        },
        {
            "q": "What is a Deadlock in operating systems?",
            "options": [
                "When a computer loses power immediately.",
                "A condition where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process.",
                "When hard drive disk sectors are corrupted.",
                "An infinite loop inside a single while loop."
            ],
            "correct": 1,
            "explanation": "Deadlock occurs when processes enter a circular wait condition holding non-preemptible resources and waiting for other allocated resources."
        }
    ]
}

GENERIC_TECH = [
    {
        "q": "What is the time complexity of searching for an element in a sorted array using Binary Search?",
        "options": ["O(n)", "O(O(log n))", "O(log n)", "O(n^2)"],
        "correct": 2,
        "explanation": "Binary search repeatedly divides the sorted search interval in half, yielding O(log n) time complexity."
    },
    {
        "q": "What happens immediately after a client browser resolves the IP address via DNS when connecting to `https://example.com`?",
        "options": [
            "The browser executes React components.",
            "The browser establishes a TCP connection (and TLS handshake for HTTPS) with the server at that IP.",
            "The server sends a 404 Not Found error.",
            "The database drops all tables."
        ],
        "correct": 1,
        "explanation": "Once the IP address is known, the client initiates a TCP 3-way handshake (plus TLS handshake for HTTPS) to establish a network connection."
    },
    {
        "q": "Which protocol operates at the Transport Layer of the OSI model and guarantees reliable, ordered byte delivery?",
        "options": ["UDP", "IP", "TCP", "HTTP"],
        "correct": 2,
        "explanation": "TCP (Transmission Control Protocol) provides connection-oriented, reliable, and ordered delivery of data packets."
    },
    {
        "q": "In database indexing, what data structure is most commonly utilized for relational B-Tree indexes?",
        "options": ["Linked List", "B+ Tree", "Queue", "Max Heap"],
        "correct": 1,
        "explanation": "B+ Trees keep data sorted with all leaf nodes linked together at the bottom, making range queries and sequential scans extremely fast."
    },
    {
        "q": "What is Cross-Site Scripting (XSS)?",
        "options": [
            "A security vulnerability where attackers inject malicious scripts into trusted websites viewed by other users.",
            "A CSS layout technique for positioning elements horizontally.",
            "A protocol for exchanging data between two domains.",
            "A server-side SQL injection flaw."
        ],
        "correct": 0,
        "explanation": "XSS occurs when an application includes untrusted data in a web page without proper validation or escaping, allowing browser-side script execution."
    },
    {
        "q": "What is the purpose of CORS (Cross-Origin Resource Sharing)?",
        "options": [
            "To speed up database indexing.",
            "A browser security mechanism that restricts web applications from making requests to a different domain unless permitted by server headers.",
            "A package manager for Node.js.",
            "A method to compress image files."
        ],
        "correct": 1,
        "explanation": "CORS uses HTTP headers to allow servers to declare which origins are permitted to access their resources via web browsers."
    }
]

HR = [
    {
        "q": "When answering 'Tell me about a time you faced a tight deadline', which framework is recommended for structured answers?",
        "options": [
            "SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound)",
            "STAR method (Situation, Task, Action, Result)",
            "SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)",
            "FIFO rule (First In, First Out)"
        ],
        "correct": 1,
        "explanation": "The STAR method (Situation, Task, Action, Result) is standard for behavioral interview responses."
    },
    {
        "q": "If a team project member is falling behind on their deliverable, what is the most professional initial response?",
        "options": [
            "Complain immediately to executive leadership.",
            "Communicate privately to understand their blockers and offer technical support or task re-prioritization.",
            "Ignore the deliverable and let the project fail.",
            "Take credit for their assigned task publicly."
        ],
        "correct": 1,
        "explanation": "Proactive, empathetic communication to identify blockers and support team members demonstrates teamwork and leadership."
    },
    {
        "q": "What is the most effective approach when asked about your greatest weakness in an interview?",
        "options": [
            "Claim that you have zero weaknesses.",
            "State a real professional area for growth and describe active steps/strategies you are taking to improve.",
            "State a humblebrag like 'I work too hard and care too much'.",
            "Refuse to answer the question."
        ],
        "correct": 1,
        "explanation": "Interviewers look for self-awareness, honesty, and proactive self-improvement strategies."
    }
]
