"""Multiple-choice question (MCQ) bank for technical and HR/behavioral interview practice.
Each question has:
- 'q': Question statement
- 'options': List of 4 choice strings
- 'correct': Index of the correct option (0, 1, 2, or 3)
- 'explanation': Explanation of why the correct option is right
"""

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
            "options": [
                "Encapsulation",
                "Polymorphism",
                "Abstraction",
                "Inheritance"
            ],
            "correct": 1,
            "explanation": "Polymorphism (specifically dynamic/runtime method dispatch) allows an interface or method call to execute different code depending on the actual runtime object."
        },
        {
            "q": "Wrapping data fields and restricting direct outside access via private modifiers and getters/setters is known as:",
            "options": [
                "Abstraction",
                "Inheritance",
                "Encapsulation",
                "Overloading"
            ],
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
            "options": [
                "Availability",
                "Atomicity",
                "Authentication",
                "Aggregation"
            ],
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
            "explanation": "3NF requires that no non-prime attribute is transitively dependent on the primary key (every non-key attribute must depend directly on the key)."
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
            "explanation": "A closure gives a inner function access to an outer function's scope even after the outer function has returned."
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
            "options": [
                "useEffect",
                "useCallback",
                "useMemo",
                "useRef"
            ],
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
        }
    ]
}

GENERIC_TECH = [
    {
        "q": "What is the time complexity of searching for an element in a sorted array using Binary Search?",
        "options": [
            "O(n)",
            "O(O(log n))",
            "O(log n)",
            "O(n^2)"
        ],
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
